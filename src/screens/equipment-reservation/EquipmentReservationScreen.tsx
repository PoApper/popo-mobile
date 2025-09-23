import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import PoPoAxios from '../../utils/api'; // 실제 axios 인스턴스 경로에 맞게 수정 필요
import {Calendar, LocaleConfig} from 'react-native-calendars';
import CalendarKoreanLocales from '../../utils/calendar-locales';

LocaleConfig.locales.kr = CalendarKoreanLocales;
LocaleConfig.defaultLocale = 'kr';

// API 타입에 맞게 수정
interface IEquipment {
  uuid: string;
  name: string;
  description: string;
  fee: number;
  imageUrl?: string;
  maxMinutes: number;
}

interface IEquipReservation {
  uuid: string;
  booker: {
    name: string;
  };
  equipments: IEquipment[];
  date: string;
  description: string;
  startTime: string;
  endTime: string;
  phone: string;
  status: string;
  title: string;
  createdAt: Date;
}

type EquipmentReservationScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'EquipmentReservation'
  >;
};

const tabs = [
  {label: '동아리연합회', value: 'dongyeon'},
  {label: '생활관자치회', value: 'dormunion'},
];

// 이모지 제거 함수 (숫자 등 일반 문자는 남기고 이모지만 제거) - 메모이제이션을 위해 컴포넌트 외부로 이동
const removeEmoji = (str: string) => {
  // 이모지 유니코드만 제거, 숫자/한글/영문 등은 남김
  return str.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83D[\uDE00-\uDE4F])/g,
    '',
  );
};

const EquipmentReservationScreen = ({
  navigation,
}: EquipmentReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedTab, setSelectedTab] = useState('dongyeon');
  const [equipmentList, setEquipmentList] = useState<IEquipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [reservations, setReservations] = useState<IEquipReservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  // 메모이제이션으로 불필요한 재계산 방지
  const styles_memo = useMemo(
    () => ({
      backgroundStyle: {
        backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
        flex: 1,
      },
      textColor: isDarkMode ? '#ffffff' : '#000000',
      borderColor: isDarkMode ? '#2C2C2C' : '#E5E7EB',
      secondaryTextColor: isDarkMode ? '#a0a0a0' : '#888888',
      buttonBackgroundColor: isDarkMode ? '#3a3a3a' : '#F6F7F9',
      placeholderImageStyle: {
        backgroundColor: isDarkMode ? '#3a3a3a' : '#eee',
      },
    }),
    [isDarkMode],
  );

  const {
    backgroundStyle,
    textColor,
    borderColor,
    secondaryTextColor,
    buttonBackgroundColor,
    placeholderImageStyle,
  } = styles_memo;

  // 달력 마킹을 위한 marked 객체
  const marked = useMemo(
    () => ({
      [selectedDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')]: {
        selected: true,
        selectedColor: isDarkMode ? '#ddd' : 'black',
        selectedTextColor: isDarkMode ? 'black' : 'white',
      },
    }),
    [selectedDate, isDarkMode],
  );

  // 최대 날짜 (30일 후)
  const maxDateStr = useMemo(() => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const res = await PoPoAxios.get<IEquipment[]>(
          `equip/owner/${selectedTab}`,
        );
        // 이름순 정렬
        const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
        setEquipmentList(sorted);
      } catch (e) {
        setEquipmentList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [selectedTab]);

  // 선택된 날짜의 예약 현황 불러오기
  useEffect(() => {
    if (!selectedDate) return;

    const fetchReservations = async () => {
      setIsLoadingReservations(true);
      try {
        const res = await PoPoAxios.get<IEquipReservation[]>(
          `/reservation-equip?owner=${selectedTab}&date=${selectedDate}`,
        );
        setReservations(res.data);
      } catch (error) {
        console.error('예약 현황을 불러오는데 실패했습니다:', error);
        setReservations([]);
      } finally {
        setIsLoadingReservations(false);
      }
    };

    fetchReservations();
  }, [selectedDate, selectedTab]);

  // 렌더 함수 메모이제이션
  const renderEquipmentItem = useCallback(
    ({item}: {item: IEquipment}) => (
      <View style={styles.equipmentItem}>
        {item.imageUrl ? (
          <Image source={{uri: item.imageUrl}} style={styles.equipmentImage} />
        ) : (
          <Image
            source={require('../../../assets/icon/POPO_typography_bg_removed_cropped.png')}
            style={styles.equipmentImage}
          />
        )}
        <View style={styles.equipmentInfo}>
          <Text style={[styles.equipmentName, {color: textColor}]}>
            {removeEmoji(item.name)}
          </Text>
          <Text style={[styles.equipmentPrice, {color: secondaryTextColor}]}>
            {item.fee.toLocaleString()}원
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.detailButton,
            {backgroundColor: buttonBackgroundColor},
          ]}
          onPress={() => {
            Alert.alert(
              '장비 상세정보',
              `이름: ${removeEmoji(item.name)}\n모델명/설명: ${
                item.description || '-'
              }\n가격: ${item.fee.toLocaleString()}원\n최대 사용 시간: ${
                item.maxMinutes
              }분`,
              [{text: '닫기', style: 'cancel'}],
            );
          }}>
          <Text style={[styles.detailButtonText, {color: textColor}]}>
            상세정보
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [
      textColor,
      secondaryTextColor,
      buttonBackgroundColor,
      placeholderImageStyle,
    ],
  );

  // FlatList keyExtractor 메모이제이션
  const keyExtractor = useCallback((item: IEquipment) => item.uuid, []);

  // 달력 날짜 선택 핸들러
  const onDayPress = useCallback((day: any) => {
    const dateStr = day.dateString.replace(/-/g, '');
    setSelectedDate(dateStr);
  }, []);

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
    [isDarkMode, textColor, maxDateStr],
  );

  // 시간 포맷팅 함수
  const convertTime = (timeStr: string) => {
    if (timeStr.length === 4) {
      const hours = timeStr.substring(0, 2);
      const minutes = timeStr.substring(2, 4);
      return `${hours}:${minutes}`;
    }
    return timeStr;
  };

  // 상태 색상 변환 함수
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case '승인':
        return '#4CAF50'; // 초록색
      case 'pending':
      case '대기':
        return '#FF9800'; // 주황색
      case 'rejected':
      case '거부':
        return '#F44336'; // 빨간색
      default:
        return '#9E9E9E'; // 회색
    }
  };

  // 예약 현황 아이템 렌더링
  const renderReservationItem = useCallback(
    ({item}: {item: IEquipReservation}) => (
      <View style={[styles.reservationItem, {backgroundColor: buttonBackgroundColor}]}>
        <View style={styles.reservationInfo}>
          <View style={styles.reservationHeader}>
            <Text style={[styles.reservationTitle, {color: textColor}]}>
              {item.title}
            </Text>
            <View style={[styles.statusIndicator, {backgroundColor: getStatusColor(item.status)}]} />
          </View>
          <Text style={[styles.reservationTime, {color: secondaryTextColor}]}>
            {convertTime(item.startTime)} - {convertTime(item.endTime)}
          </Text>
          <Text style={[styles.reservationBooker, {color: secondaryTextColor}]}>
            예약자: {item.booker.name}
          </Text>
          <View style={styles.equipmentTags}>
            {item.equipments.map(e => (
              <View key={e.uuid} style={[styles.equipmentTag, {backgroundColor: isDarkMode ? '#555' : '#E0E0E0'}]}>
                <Text style={[styles.equipmentTagText, {color: textColor}]}>
                  {e.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    ),
    [textColor, secondaryTextColor, buttonBackgroundColor, isDarkMode],
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
        <Text style={[styles.headerTitle, {color: textColor}]}>장비 예약</Text>
        <View style={styles.placeholderButton} />
      </View>

      {/* 상단 탭 */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tab,
              selectedTab === tab.value && styles.selectedTab,
            ]}
            onPress={() => setSelectedTab(tab.value)}>
            <Text
              style={[
                styles.tabText,
                {color: secondaryTextColor},
                selectedTab === tab.value && styles.selectedTabText,
                selectedTab === tab.value && {color: textColor},
              ]}>
              {tab.label}
            </Text>
            {selectedTab === tab.value && (
              <View
                style={[styles.tabUnderline, {backgroundColor: textColor}]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 달력 섹션 */}
      <View style={[styles.calendarContainer, {backgroundColor: backgroundStyle.backgroundColor}]}>
        <Calendar
          current={selectedDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}
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

      {/* 선택된 날짜의 예약 현황 */}
      {selectedDate && (
        <View style={styles.reservationsContainer}>
          <Text style={[styles.reservationsTitle, {color: textColor}]}>
            예약 현황
          </Text>
          {isLoadingReservations ? (
            <ActivityIndicator size="small" color={textColor} />
          ) : reservations.length > 0 ? (
            <FlatList
              data={reservations.sort((a, b) => Number(a.startTime) - Number(b.startTime))}
              renderItem={renderReservationItem}
              keyExtractor={(item) => item.uuid}
              showsVerticalScrollIndicator={false}
              style={styles.reservationsList}
            />
          ) : (
            <Text style={[styles.noReservationsText, {color: secondaryTextColor}]}>
              예약된 내역이 없습니다.
            </Text>
          )}
        </View>
      )}

      {/* 장비 리스트 */}
      <View style={styles.equipmentListContainer}>
        <FlatList
          data={equipmentList}
          renderItem={renderEquipmentItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.equipmentList}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 79, // approximate height of each item (paddingVertical: 15 * 2 + content height ~49)
            offset: 79 * index,
            index,
          })}
          ListEmptyComponent={
            <Text style={[styles.emptyListText, {color: secondaryTextColor}]}>
              {loading ? '불러오는 중...' : '장비가 없습니다.'}
            </Text>
          }
        />
      </View>

      {/* 예약 신청하기 버튼 - 하단 고정 */}
      <View style={styles.reserveButtonWrapper}>
        <TouchableOpacity
          style={styles.reserveButton}
          onPress={() =>
            navigation.navigate('EquipmentReservationApply', {
              association: selectedTab,
            })
          }>
          <Text style={styles.reserveButtonText}>예약 신청하기</Text>
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 4,
  },
  tab: {
    marginHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  selectedTab: {},
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTabText: {
    fontWeight: 'bold',
  },
  tabUnderline: {
    marginTop: 4,
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  equipmentListContainer: {
    flex: 1,
    marginBottom: 20,
  },
  equipmentList: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
  equipmentImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  equipmentDesc: {
    fontSize: 13,
    marginBottom: 2,
  },
  equipmentPrice: {
    fontSize: 13,
  },
  detailButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginLeft: 10,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reserveButtonWrapper: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 40,
  },
  calendarContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 8,
  },
  reservationsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  reservationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  reservationsList: {
    maxHeight: 200,
  },
  reservationItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reservationInfo: {
    flex: 1,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reservationTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  reservationTime: {
    fontSize: 12,
    marginBottom: 2,
  },
  reservationBooker: {
    fontSize: 12,
    marginBottom: 4,
  },
  equipmentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  equipmentTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 2,
  },
  equipmentTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  noReservationsText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default EquipmentReservationScreen;
