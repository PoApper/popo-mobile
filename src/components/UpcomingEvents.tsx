import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, ScrollView, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '@utils/api';
import paxi_api from '@utils/paxi_api';
import moment from 'moment';
import {formatReservationTime} from '../utils/popo-datetime';

interface Place {
  uuid: string;
  name: string;
  description: string;
  location: string;
  region: string;
  staff_email: string;
  image_url: string;
}

interface PlaceReservation {
  uuid: string;
  place_id: string;
  booker_id: string;
  phone: string;
  title: string;
  description: string;
  date: string; // YYYYMMDD
  start_time: string; // HHmm
  end_time: string; // HHmm
  status: '심사중' | '통과' | '거절';
  created_at: Date;
  place: Place;
}

interface TaxiRoom {
  uuid: string;
  title: string;
  departureLocation: string;
  destinationLocation: string;
  departureTime: string;
  status: string;
  userStatus: string;
}

interface Equipment {
  uuid: string;
  name: string;
  description: string;
  equip_owner: string;
  region: string;
  staff_email: string;
  image_url: string;
}

interface EquipmentReservation {
  uuid: string;
  booker_id: string;
  phone: string;
  title: string;
  description: string;
  date: string; // YYYYMMDD
  start_time: string; // HHmm
  end_time: string; // HHmm
  status: '심사중' | '통과' | '거절';
  created_at: Date;
  equipments: Equipment[];
}

interface CombinedEvent {
  id: string;
  type: 'place' | 'taxi' | 'equipment';
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  data: PlaceReservation | TaxiRoom | EquipmentReservation;
}

type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  take: number;
};

interface UpcomingEventsProps {
  refreshKey?: number;
}

const UpcomingEvents = ({refreshKey}: UpcomingEventsProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [combinedEvents, setCombinedEvents] = useState<CombinedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceEvents = () => {
      return api
        .get<PaginatedResponse<PlaceReservation>>(
          'https://api.popo-dev.poapper.club/reservation-place/user',
          {
            params: {
              skip: 0,
              take: 10,
            },
          },
        )
        .then(res => {
          return res.data.items;
        })
        .catch(err => {
          console.error('장소 예약 데이터 조회 오류:', err);
          return [];
        });
    };

    const fetchTaxiEvents = () => {
      return paxi_api
        .get<TaxiRoom[]>('/room/my')
        .then(res => {
          // 다가오는 일정에서는 강퇴된 카풀(KICKED) 제외함
          // 내 일정 -> 카풀에서는 강퇴된 방 확인할 수 있음
          return res.data
            .filter(room => room.userStatus !== 'KICKED')
            .filter(room => room.status !== 'COMPLETED');
        })
        .catch(err => {
          console.error('택시 카풀 데이터 조회 오류:', err);
          return [];
        });
    };

    const fetchEquipmentEvents = () => {
      return api
        .get<PaginatedResponse<EquipmentReservation>>(
          'https://api.popo-dev.poapper.club/reservation-equip/user',
          {
            params: {
              skip: 0,
              take: 10,
            },
          },
        )
        .then(res => {
          return res.data.items;
        })
        .catch(err => {
          console.error('장비 예약 데이터 조회 오류:', err);
          return [];
        });
    };

    const fetchAllEvents = async () => {
      console.log(
        'UpcomingEvents: Fetching all events, refreshKey:',
        refreshKey,
      );
      try {
        // 장소 예약 데이터 가져오기
        const placeResponse = await fetchPlaceEvents();

        // 택시 카풀 데이터 가져오기
        const taxiResponse = await fetchTaxiEvents();

        // 장비 예약 데이터 가져오기
        const equipmentResponse = await fetchEquipmentEvents();

        // 데이터 합치기
        const placeEvents: CombinedEvent[] = placeResponse.map(
          (reservation: PlaceReservation) => ({
            id: `place_${reservation.uuid}`,
            type: 'place' as const,
            title: reservation.title,
            date: reservation.date,
            time: `${formatReservationTime(
              reservation.start_time,
            )} - ${formatReservationTime(reservation.end_time)}`,
            location: reservation.place?.name || '장소 미정',
            status: reservation.status,
            data: reservation,
          }),
        );

        const taxiEvents: CombinedEvent[] = taxiResponse.map(
          (room: TaxiRoom) => ({
            id: `taxi_${room.uuid}`,
            type: 'taxi' as const,
            title: room.title,
            date: moment(room.departureTime).format('YYYYMMDD'),
            time: moment(room.departureTime).format('HH:mm'),
            location: `${room.departureLocation} → ${room.destinationLocation}`,
            status: room.status,
            data: room,
          }),
        );

        const equipmentEvents: CombinedEvent[] = equipmentResponse.map(
          (reservation: EquipmentReservation) => ({
            id: `equipment_${reservation.uuid}`,
            type: 'equipment' as const,
            title: reservation.title,
            date: reservation.date,
            time: `${formatReservationTime(
              reservation.start_time,
            )} - ${formatReservationTime(reservation.end_time)}`,
            location:
              reservation.equipments?.map(e => e.name).join(', ') ||
              '장비 미정',
            status: reservation.status,
            data: reservation,
          }),
        );

        // 모든 이벤트를 날짜 오름차순(=다가오는 일정 순)으로 정렬
        // 오늘부터 일주일 이내의 일정만 표시
        const allEvents: CombinedEvent[] = [
          ...placeEvents,
          ...taxiEvents,
          ...equipmentEvents,
        ]
          .filter(event => {
            const today = moment().format('YYYYMMDD');
            const oneWeekLater = moment().add(7, 'day').format('YYYYMMDD');
            const eventDate = moment(event.date, 'YYYYMMDD');
            return (
              eventDate.isSameOrAfter(today) &&
              eventDate.isSameOrBefore(oneWeekLater)
            );
          })
          .sort((a, b) => {
            // 날짜 및 시간까지 고려해서 정렬
            const earlyDate = a.date + a.time;
            const lateDate = b.date + b.time;
            const earlyDateTime = moment(earlyDate, 'YYYYMMDDHHmmss');
            const lateDateTime = moment(lateDate, 'YYYYMMDDHHmmss');
            return earlyDateTime.diff(lateDateTime);
          });

        setCombinedEvents(allEvents);
      } catch (error) {
        console.error('일정 정보 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEvents();
  }, [refreshKey]);

  const formatDate = (dateString: string) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  const getStatusText = (
    type: 'place' | 'taxi' | 'equipment',
    status: string,
  ) => {
    switch (type) {
      case 'place':
        return status;
      case 'equipment':
        return status;
      case 'taxi':
        return getPaxiStatusText(status);
      default:
        return status;
    }
  };

  const getPaxiStatusText = (status: string) => {
    // TODO: 방 상태 한 곳에서 관리하도록 수정
    switch (status) {
      case 'IN_SETTLEMENT':
        return '정산중';
      case 'ACTIVE':
        return '출발 전';
      case 'COMPLETED':
        return '완료';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '통과':
        return '#4CAF50';
      case '심사중':
        return '#FF9800';
      case '거절':
        return '#F44336';
      case 'IN_SETTLEMENT':
        return '#FF9800';
      case 'ACTIVE':
        return '#4CAF50';
      default:
        return '#2196F3';
    }
  };

  const getEventIcon = (type: 'place' | 'taxi' | 'equipment') => {
    switch (type) {
      case 'place':
        return 'place';
      case 'taxi':
        return 'directions-car';
      case 'equipment':
        return 'computer';
      default:
        return 'event';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.upcomingSection}>
        <Text
          style={[
            styles.sectionTitle,
            {color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24},
          ]}>
          다가오는 일정
        </Text>
        <View style={[styles.scheduleCard]} />
      </View>
    );
  }

  if (combinedEvents.length === 0) {
    return (
      <View style={styles.upcomingSection}>
        <Text
          style={[
            styles.sectionTitle,
            {color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24},
          ]}>
          다가오는 일정
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scheduleScroll}>
          <View style={[styles.scheduleCard, {backgroundColor: '#4D61DD'}]}>
            <Text style={styles.scheduleTitle}>다가오는 일정이 없습니다</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.upcomingSection}>
      <Text
        style={[
          styles.sectionTitle,
          {color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24},
        ]}>
        다가오는 일정
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scheduleScroll}>
        {combinedEvents.map((event, index) => (
          <View
            key={event.id}
            style={[
              styles.scheduleCard,
              {
                backgroundColor: index % 2 === 0 ? '#FF616B' : '#FF7BA5',
              },
            ]}>
            <View style={styles.eventHeader}>
              <Icon
                name={getEventIcon(event.type)}
                size={16}
                color="#FFFFFF"
                style={styles.eventIcon}
              />
              <Text style={styles.eventType}>
                {event.type === 'place'
                  ? '장소 예약'
                  : event.type === 'taxi'
                  ? '택시 카풀'
                  : '장비 예약'}
              </Text>
              {(event.type === 'place' || event.type === 'taxi') && (
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      {backgroundColor: getStatusColor(event.status)},
                    ]}>
                    <Text style={styles.statusText}>
                      {getStatusText(event.type, event.status)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <Text style={styles.scheduleTitle}>{event.title}</Text>
            <View style={styles.scheduleInfo}>
              <Icon
                name="place"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.scheduleLocation}>{event.location}</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Icon
                name="event"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.scheduleDate}>
                {formatDate(event.date)} {event.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  upcomingSection: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scheduleScroll: {
    paddingHorizontal: 16,
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 280,
    height: 160,
    justifyContent: 'space-between',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventIcon: {
    marginRight: 6,
  },
  eventType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  scheduleTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 4,
  },
  scheduleLocation: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  scheduleDate: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  statusContainer: {
    marginLeft: 8, // marginTop에서 marginLeft로 변경하여 한 줄 정렬
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default UpcomingEvents;
