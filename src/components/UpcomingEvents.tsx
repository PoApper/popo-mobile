import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, ScrollView, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '@utils/api';
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

type PaginatedResponse = {
  items: PlaceReservation[];
  total: number;
  page: number;
  take: number;
};

const UpcomingEvents = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [reservations, setReservations] = useState<PlaceReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get<PaginatedResponse>(
          'https://api.popo-dev.poapper.club/reservation-place/user',
          {
            params: {
              skip: 0,
              take: 5,
            },
          },
        );
        setReservations(response.data.items);
      } catch (error) {
        console.error('예약 정보 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const formatDate = (dateString: string) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  if (isLoading) {
    return (
      <View style={styles.upcomingSection}>
        <Text
          style={[
            styles.sectionTitle,
            {color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24},
          ]}>
          나의 최근 예약
        </Text>
        <View style={[styles.scheduleCard]} />
      </View>
    );
  }

  if (reservations.length === 0) {
    return (
      <View style={styles.upcomingSection}>
        <Text
          style={[
            styles.sectionTitle,
            {color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24},
          ]}>
          나의 최근 예약
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scheduleScroll}>
          <View style={[styles.scheduleCard, {backgroundColor: '#4D61DD'}]}>
            <Text style={styles.scheduleTitle}>최근 예약 내역이 없습니다</Text>
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
        나의 최근 예약
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scheduleScroll}>
        {reservations.map((reservation, index) => (
          <View
            key={reservation.uuid}
            style={[
              styles.scheduleCard,
              {backgroundColor: index % 2 === 0 ? '#FF616B' : '#FF7BA5'},
            ]}>
            <Text style={styles.scheduleTitle}>{reservation.title}</Text>
            <View style={styles.scheduleInfo}>
              <Icon
                name="place"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.scheduleLocation}>
                {reservation.place.name || '장소 미정'}
              </Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Icon
                name="event"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.scheduleDate}>
                {formatDate(reservation.date)}
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
    width: 250,
    height: 140,
    justifyContent: 'space-between',
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
});

export default UpcomingEvents;
