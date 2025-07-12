import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, ScrollView, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '@utils/api';
import paxi_api from '@utils/paxi_api';
import moment from 'moment';

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
}

interface CombinedEvent {
  id: string;
  type: 'place' | 'taxi';
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  data: PlaceReservation | TaxiRoom;
}

type PaginatedResponse = {
  items: PlaceReservation[];
  total: number;
  page: number;
  take: number;
};

const UpcomingEvents = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [combinedEvents, setCombinedEvents] = useState<CombinedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        // 장소 예약 데이터 가져오기
        const placeResponse = await api.get<PaginatedResponse>(
          'https://api.popo-dev.poapper.club/reservation-place/user',
          {
            params: {
              skip: 0,
              take: 10,
            },
          },
        );

        // 택시 카풀 데이터 가져오기
        const taxiResponse = await paxi_api.get<TaxiRoom[]>('/room/my');

        // 데이터 합치기
        const placeEvents: CombinedEvent[] = placeResponse.data.items.map(
          (reservation: PlaceReservation) => ({
            id: `place_${reservation.uuid}`,
            type: 'place' as const,
            title: reservation.title,
            date: reservation.date,
            time: `${reservation.start_time} - ${reservation.end_time}`,
            location: reservation.place?.name || '장소 미정',
            status: reservation.status,
            data: reservation,
          }),
        );

        const taxiEvents: CombinedEvent[] = taxiResponse.data.map(
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

        // 모든 이벤트를 날짜 내림차순(가장 최근 일정이 먼저)으로 정렬
        const allEvents = [...placeEvents, ...taxiEvents].sort((a, b) => {
          const dateA = moment(a.date, 'YYYYMMDD');
          const dateB = moment(b.date, 'YYYYMMDD');
          return dateB.diff(dateA); // 내림차순
        });

        setCombinedEvents(allEvents.slice(0, 5)); // 최대 5개만 표시
      } catch (error) {
        console.error('일정 정보 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '통과':
        return '#4CAF50';
      case '심사중':
        return '#FF9800';
      case '거절':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getEventIcon = (type: 'place' | 'taxi') => {
    return type === 'place' ? 'place' : 'directions-car';
  };

  if (isLoading) {
    return (
      <View style={styles.upcomingSection}>
        <Text
          style={[
            styles.sectionTitle,
            {color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24},
          ]}>
          나의 최근 일정
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
          나의 최근 일정
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scheduleScroll}>
          <View style={[styles.scheduleCard, {backgroundColor: '#4D61DD'}]}>
            <Text style={styles.scheduleTitle}>최근 일정이 없습니다</Text>
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
        나의 최근 일정
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
                backgroundColor:
                  event.type === 'place'
                    ? index % 2 === 0
                      ? '#FF616B'
                      : '#FF7BA5'
                    : index % 2 === 0
                    ? '#4CAF50'
                    : '#8BC34A',
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
                {event.type === 'place' ? '장소 예약' : '택시 카풀'}
              </Text>
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
            {event.type === 'place' && (
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: getStatusColor(event.status)},
                  ]}>
                  <Text style={styles.statusText}>{event.status}</Text>
                </View>
              </View>
            )}
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
    marginTop: 8,
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
