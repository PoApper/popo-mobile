import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import api from '../../utils/api';
import CalendarKoreanLocales from '../../utils/calendar-locales';
import LazyImage from '../../components/LazyImage';

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
  imageUrl: string;
  location: string;
};

type Reservation = {
  uuid: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
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

  // 오늘 날짜를 YYYYMMDD 형식의 문자열로 계산 (컴포넌트 마운트 시 1회)
  const todayStr = useMemo(() => {
    const today = new Date();
    // 월은 0부터 시작함
    return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(
      2,
      '0',
    )}${String(today.getDate()).padStart(2, '0')}`;
  }, []);

  // 선택된 날짜가 과거인지 확인
  const isPastDate = useMemo(() => {
    if (!selectedDate) return false;
    return selectedDate < todayStr;
  }, [selectedDate, todayStr]);

  const marked = useMemo(
    () => ({
      [selectedDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')]: {
        selected: true,
        selectedColor: isDarkMode ? '#ddd' : 'black',
        selectedTextColor: isDarkMode ? 'black' : 'white',
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

  const fetchReservations = useCallback(async () => {
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
          Number(a.startTime) - Number(b.startTime),
      );
      setReservations(sortedReservations);
    } catch (error) {
      console.error('예약 내역을 불러오는데 실패했습니다:', error);
      setReservations([]);
    } finally {
      setIsLoadingReservations(false);
    }
  }, [placeDetail?.name, selectedDate]);

  // 화면이 포커스될 때마다 예약 내역을 다시 불러옴 (예약 후 돌아왔을 때 반영)
  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [fetchReservations]),
  );

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

  // 예약 가능 범위: 미래는 오늘 ~ 30일 후까지. 과거 날짜는 조회만 가능
  const {maxDateStr} = useMemo(() => {
    const toStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`;
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return {maxDateStr: toStr(max)};
  }, []);

  // 상태 색상 변환 함수
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case '통과':
        return '#4CAF50';
      case '심사중':
        return '#9E9E9E';
      case '거절':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderReservationItem = ({item}: {item: Reservation}) => (
    <View
      style={[styles.reservationItem, {backgroundColor: cardBackgroundColor}]}>
      <View style={styles.reservationTimeContainer}>
        <Text style={[styles.reservationTime, {color: textColor}]}>
          {convertTime(item.startTime)} - {convertTime(item.endTime)}
        </Text>
        <View
          style={[
            styles.statusIndicator,
            {backgroundColor: getStatusColor(item.status)},
          ]}
        />
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

  // 주말 컬러: 토/일 모두 빨강. 선택/비활성 상태는 기존 규칙 유지
  const renderDay = useCallback(
    ({date, state, marking, onPress}: any) => {
      const dayOfWeek = new Date(date.dateString).getDay(); // 0: Sun .. 6: Sat
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isSelected = Boolean(marking?.selected);

      const selectedBg = isDarkMode ? '#ddd' : 'black';
      const selectedFg = isDarkMode ? 'black' : 'white';
      const disabledColor = isDarkMode ? '#444444' : '#d9e1e8';

      const weekendColor = isSunday || isSaturday ? '#FB5353' : textColor;
      const textColorResolved =
        state === 'disabled'
          ? disabledColor
          : isSelected
          ? selectedFg
          : weekendColor;

      const isAfterMax = date.dateString > maxDateStr;

      return (
        <TouchableOpacity
          disabled={isAfterMax}
          onPress={() => onPress?.(date)}
          accessibilityRole="button"
          style={{
            alignSelf: 'center',
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected ? selectedBg : 'transparent',
            marginVertical: 6,
          }}>
          <Text style={{color: textColorResolved, fontSize: 16}}>
            {date.day}
          </Text>
        </TouchableOpacity>
      );
    },
    [isDarkMode, textColor],
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
            <LazyImage
              uri={placeDetail.imageUrl}
              style={styles.placeImage}
              fallbackSource={require('../../../assets/icon/POPO_typography_bg_removed_cropped.png')}
            />
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate.replace(
                  /(\d{4})(\d{2})(\d{2})/,
                  '$1-$2-$3',
                )}
                firstDay={1}
                hideExtraDays={false}
                disableMonthChange={false}
                disableAllTouchEventsForDisabledDays={false}
                disableAllTouchEventsForInactiveDays={false}
                maxDate={maxDateStr}
                onDayPress={onDayPress}
                markedDates={marked}
                dayComponent={renderDay}
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
                        color: textColor,
                      }}>{`${year}년 ${month}월`}</Text>
                  );
                }}
                theme={{
                  backgroundColor: isDarkMode ? '#121212' : '#ffffff',
                  calendarBackground: isDarkMode ? '#121212' : '#ffffff',
                  textSectionTitleColor: textColor,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#ff6868',
                  dayTextColor: textColor,
                  textDisabledColor: isDarkMode ? '#444444' : '#d9e1e8',
                  monthTextColor: textColor,
                  textMonthFontWeight: 'bold',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 14,
                  arrowColor: isDarkMode ? 'white' : 'black',
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

      {/* 예약 신청하기 버튼 - 하단 고정 */}
      <View style={styles.reserveButtonWrapper}>
        <TouchableOpacity
          style={[
            styles.reserveButton,
            (!selectedDate || isPastDate) && {opacity: 0.5},
          ]}
          disabled={!selectedDate || isPastDate}
          onPress={() => {
            if (isPastDate) {
              Alert.alert(
                '알림',
                '과거 날짜는 예약할 수 없습니다. 오늘 이후의 날짜를 선택해주세요.',
              );
              return;
            }

            navigation.navigate('PlaceReservationApply', {
              buildingName: placeDetail?.location || '',
              placeName: placeDetail?.name || '',
              placeId: placeId,
              selectedDate: selectedDate,
            });
          }}>
          <Text style={styles.reserveButtonText}>
            {!selectedDate
              ? '날짜를 선택해주세요'
              : isPastDate
              ? '과거 날짜는 예약 불가'
              : '예약 신청하기'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 30,
  },
  reserveButtonWrapper: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    backgroundColor: '#222',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
