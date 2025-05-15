import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {RouteProp} from '@react-navigation/native';
import api from '../utils/api';
import CalendarKoreanLocales from '../utils/calendar-locales';

LocaleConfig.locales.kr = CalendarKoreanLocales;
LocaleConfig.defaultLocale = 'kr';

type PlaceDetailReservationScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'PlaceDetailReservation'
  >;
  route: RouteProp<RootStackParamList, 'PlaceDetailReservation'>;
};

type PlaceDetail = {
  name: string;
  description: string;
  image_url: string;
  location: string;
};

type Reservation = {
  uuid: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  booker: {
    name: string;
  };
};

const PlaceDetailReservationScreen = ({
  navigation,
  route,
}: PlaceDetailReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const {placeId} = route.params;
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [_showCalendar, _setShowCalendar] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  const marked = useMemo(
    () => ({
      [selectedDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')]: {
        selected: true,
        selectedColor: '#FB5353',
        selectedTextColor: 'white',
      },
    }),
    [selectedDate],
  );

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/place/${placeId}`);
        setPlaceDetail(response.data);
      } catch (error) {
        console.error('장소 상세 정보를 불러오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaceDetail();
  }, [placeId]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!placeDetail?.name || !selectedDate) {
        return;
      }

      try {
        setIsLoadingReservations(true);
        const response = await api.get(
          `/reservation-place/placeName/${placeDetail.name}/${selectedDate}`,
        );
        const sortedReservations = response.data.sort(
          (a: Reservation, b: Reservation) =>
            Number(a.start_time) - Number(b.start_time),
        );
        setReservations(sortedReservations);
      } catch (error) {
        console.error('예약 내역을 불러오는데 실패했습니다:', error);
        setReservations([]);
      } finally {
        setIsLoadingReservations(false);
      }
    };

    fetchReservations();
  }, [placeDetail?.name, selectedDate]);

  useEffect(() => {
    // 현재 날짜를 YYYYMMDD 형식으로 설정
    const today = new Date();
    const formattedDate = `${today.getFullYear()}${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
  }, []);

  const onDayPress = useCallback((day: any) => {
    const formattedDate = day.dateString.replace(/-/g, '');
    setSelectedDate(formattedDate);
  }, []);

  const convertTime = (time: string) => {
    if (!time) {
      return '시간 정보 없음';
    }
    return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const subTextColor = isDarkMode ? '#888888' : '#6B7280';
  const cardBackgroundColor = isDarkMode ? '#1A1A1A' : '#F3F3F3';

  const renderReservationItem = ({item}: {item: Reservation}) => (
    <View
      style={[styles.reservationItem, {backgroundColor: cardBackgroundColor}]}>
      <View style={styles.reservationTimeContainer}>
        <Text style={[styles.reservationTime, {color: textColor}]}>
          {convertTime(item.start_time)} - {convertTime(item.end_time)}
        </Text>
        <Text style={[styles.reservationStatus, {color: '#FB5353'}]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.reservationDetailContainer}>
        <Text style={[styles.reservationTitle, {color: textColor}]}>
          {item.title}
        </Text>
        <Text style={[styles.reservationUser, {color: subTextColor}]}>
          예약자: {item.booker.name}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, {color: textColor}]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>장소 예약</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={textColor} />
          </View>
        ) : placeDetail ? (
          <>
            <View style={styles.infoSection}>
              <Text style={[styles.placeName, {color: textColor}]}>
                {placeDetail.name}
              </Text>
              <Text style={[styles.placeLocation, {color: subTextColor}]}>
                {placeDetail.location}
              </Text>
              <Text style={[styles.placeDescription, {color: textColor}]}>
                {placeDetail.description}
              </Text>
            </View>
            <Image
              source={{uri: placeDetail.image_url}}
              style={styles.placeImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.reserveButton}
              onPress={() => {
                navigation.navigate('PlaceReservationApply', {
                  buildingName: placeDetail?.location || '',
                  placeName: placeDetail?.name || '',
                  placeId: placeId,
                });
              }}>
              <Text style={styles.reserveButtonText}>예약 신청하기</Text>
            </TouchableOpacity>
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate.replace(
                  /(\d{4})(\d{2})(\d{2})/,
                  '$1-$2-$3',
                )}
                onDayPress={onDayPress}
                markedDates={marked}
                renderHeader={date => {
                  const year = date.getFullYear();
                  const month = (date.getMonth() + 1)
                    .toString()
                    .padStart(2, '0');
                  return (
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        margin: 10,
                      }}>{`${year}년 ${month}월`}</Text>
                  );
                }}
                theme={{
                  backgroundColor: isDarkMode ? '#121212' : '#ffffff',
                  calendarBackground: isDarkMode ? '#121212' : '#ffffff',
                  textSectionTitleColor: textColor,
                  selectedDayBackgroundColor: '#FB5353',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#FB5353',
                  dayTextColor: textColor,
                  textDisabledColor: isDarkMode ? '#444444' : '#d9e1e8',
                  monthTextColor: textColor,
                  textMonthFontWeight: 'bold',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 14,
                }}
              />
            </View>
            <View style={styles.reservationsContainer}>
              <Text style={[styles.reservationsTitle, {color: textColor}]}>
                예약 현황
              </Text>
              {isLoadingReservations ? (
                <ActivityIndicator
                  style={styles.reservationsLoading}
                  color={textColor}
                />
              ) : reservations.length > 0 ? (
                <FlatList
                  data={reservations}
                  renderItem={renderReservationItem}
                  keyExtractor={item => item.uuid}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={[styles.noReservations, {color: subTextColor}]}>
                  예약된 내역이 없습니다.
                </Text>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
  },
  placeholderButton: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  infoSection: {
    marginBottom: 24,
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeLocation: {
    fontSize: 16,
    marginBottom: 16,
  },
  placeDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  placeImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 24,
  },
  reserveButton: {
    width: '100%',
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 24,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarContainer: {
    marginTop: 8,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 24,
  },
  reservationsContainer: {
    marginTop: 8,
  },
  reservationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reservationsLoading: {
    marginTop: 20,
  },
  noReservations: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  reservationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reservationTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservationTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  reservationStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  reservationUser: {
    fontSize: 14,
  },
  reservationDetailContainer: {
    marginTop: 8,
  },
  reservationTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default PlaceDetailReservationScreen;
