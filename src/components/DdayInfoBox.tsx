import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, useColorScheme} from 'react-native';
import axios from 'axios';

type CalendarEvent = {
  id: number;
  title: string;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
};

const DdayInfoBox = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [latestEvent, setLatestEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        const response = await axios.get(
          'https://api.popo-dev.poapper.club/calendar/get-next-event',
        );
        const event = response.data;

        if (event) {
          setLatestEvent(event);
        }
      } catch (error) {
        console.error('일정 정보 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestEvent();
  }, []);

  const calculateDday = (startDate: string) => {
    const today = new Date();
    const eventDate = new Date(startDate);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <View style={styles.locationHeader}>
        <View
          style={[
            styles.locationBox,
            {backgroundColor: isDarkMode ? '#2D3748' : '#E6EAF5'},
          ]}>
          <Text
            style={[
              styles.locationText,
              {color: isDarkMode ? '#FFFFFF' : '#000000'},
            ]}>
            일정 정보를 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  if (!latestEvent) {
    return null;
  }

  const dday = calculateDday(latestEvent.eventDate);
  const ddayText =
    dday > 0 ? `D-${dday}` : dday === 0 ? 'D-day' : `D+${Math.abs(dday)}`;

  return (
    <View style={styles.locationHeader}>
      <View
        style={[
          styles.locationBox,
          {backgroundColor: isDarkMode ? '#2D3748' : '#E6EAF5'},
        ]}>
        <Text
          style={[
            styles.locationText,
            {color: isDarkMode ? '#FFFFFF' : '#000000'},
          ]}>
          🗓️ {latestEvent.title} {ddayText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  locationHeader: {
    padding: 16,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DdayInfoBox;
