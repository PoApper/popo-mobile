import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

type CalendarEvent = {
  id: number;
  title: string;
  event_date: string;
  location: string;
  createdAt: string;
  updatedAt: string;
};

const UpcomingEvents = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('https://api.popo-dev.poapper.club/calendar/get-upcoming-events');
        setEvents(response.data);
      } catch (error) {
        console.error('일정 정보 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.upcomingSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24 }]}>
          다가오는 일정
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleScroll}>
          <View style={[styles.scheduleCard, { backgroundColor: '#4D61DD' }]}>
            <Text style={styles.scheduleTitle}>일정을 불러오는 중...</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.upcomingSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24 }]}>
          다가오는 일정
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleScroll}>
          <View style={[styles.scheduleCard, { backgroundColor: '#4D61DD' }]}>
            <Text style={styles.scheduleTitle}>예정된 일정이 없습니다</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.upcomingSection}>
      <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24 }]}>
        다가오는 일정
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleScroll}>
        {events.map((event, index) => (
          <View
            key={event.id}
            style={[
              styles.scheduleCard,
              { backgroundColor: index % 2 === 0 ? '#4D61DD' : '#10ADB6' }
            ]}
          >
            <View style={styles.scheduleInfo}>
              <Icon name="place" size={20} color="#FFFFFF" />
              <Text style={styles.scheduleLocation}>{event.location || '장소 미정'}</Text>
              <Text style={styles.scheduleDate}>{formatDate(event.event_date)}</Text>
            </View>
            <Text style={styles.scheduleTitle}>{event.title}</Text>
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
    height: 140,
    justifyContent: 'space-between',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleLocation: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  scheduleDate: {
    color: '#FFFFFF',
    marginLeft: 'auto',
    fontSize: 14,
  },
  scheduleTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpcomingEvents;