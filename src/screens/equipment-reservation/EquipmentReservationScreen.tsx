import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import {LocaleConfig} from 'react-native-calendars';
import CalendarKoreanLocales from '../../utils/calendar-locales';
import {Calendar} from 'react-native-calendars';
import PoPoAxios from '../../utils/api'; // 실제 axios 인스턴스 경로에 맞게 수정 필요

LocaleConfig.locales.kr = CalendarKoreanLocales;
LocaleConfig.defaultLocale = 'kr';

// API 타입에 맞게 수정
interface IEquipment {
  uuid: string;
  name: string;
  description: string;
  fee: number;
  image_url?: string;
  max_minutes: number;
}

// 예약 정보 타입 추가
interface IReservation {
  uuid: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  booker: {
    name: string;
  };
  equipments: IEquipment[];
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

// 이모지 제거 함수 (숫자 등 일반 문자는 남기고 이모지만 제거)
function removeEmoji(str: string) {
  // 이모지 유니코드만 제거, 숫자/한글/영문 등은 남김
  return str.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83D[\uDE00-\uDE4F])/g,
    '',
  );
}

const EquipmentReservationScreen = ({
  navigation,
}: EquipmentReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedTab, setSelectedTab] = useState('dongyeon');
  const [equipmentList, setEquipmentList] = useState<IEquipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#fff' : '#fff',
    flex: 1,
  };
  const textColor = isDarkMode ? '#000' : '#000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const subTextColor = isDarkMode ? '#888' : '#888';

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

  // 예약 현황 불러오기
  useEffect(() => {
    const fetchReservations = async () => {
      if (!selectedDate) {
        return;
      }

      try {
        setIsLoadingReservations(true);
        const response = await PoPoAxios.get('/reservation-equip', {
          params: {
            owner: selectedTab,
            date: selectedDate,
          },
        });
        const sortedReservations = response.data.sort(
          (a: IReservation, b: IReservation) =>
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
  }, [selectedTab, selectedDate]);

  // 시간 포맷 변환 함수
  const convertTime = (time: string) => {
    if (!time) {
      return '시간 정보 없음';
    }
    return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
  };

  const renderEquipmentItem = ({item}: {item: IEquipment}) => (
    <View style={styles.equipmentItem}>
      {item.image_url ? (
        <Image source={{uri: item.image_url}} style={styles.equipmentImage} />
      ) : (
        <View style={[styles.equipmentImage, {backgroundColor: '#eee'}]} />
      )}
      <View style={styles.equipmentInfo}>
        <Text style={[styles.equipmentName, {color: textColor}]}>
          {removeEmoji(item.name)}
        </Text>
        <Text style={styles.equipmentPrice}>{item.fee.toLocaleString()}원</Text>
      </View>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => {
          Alert.alert(
            '장비 상세정보',
            `이름: ${removeEmoji(item.name)}\n모델명/설명: ${
              item.description || '-'
            }\n가격: ${item.fee.toLocaleString()}원\n최대 사용 시간: ${
              item.max_minutes
            }분`,
            [{text: '닫기', style: 'cancel'}],
          );
        }}>
        <Text style={styles.detailButtonText}>상세정보</Text>
      </TouchableOpacity>
    </View>
  );

  // 예약 아이템 렌더링
  const renderReservationItem = ({item}: {item: IReservation}) => (
    <View
      style={[
        styles.reservationItem,
        {backgroundColor: isDarkMode ? '#1A1A1A' : '#F3F3F3'},
      ]}>
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
          {item.equipments && item.equipments.length > 0
            ? item.equipments.map(e => e.name).join(', ')
            : '-'}
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
        barStyle={isDarkMode ? 'dark-content' : 'dark-content'}
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
                  selectedTab === tab.value && styles.selectedTabText,
                ]}>
                {tab.label}
              </Text>
              {selectedTab === tab.value && (
                <View style={styles.tabUnderline} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 장비 리스트 */}
        <View style={styles.equipmentListContainer}>
          <ScrollView
            nestedScrollEnabled={true}
            contentContainerStyle={styles.equipmentList}>
            {equipmentList.length > 0 ? (
              equipmentList.map(item => (
                <View key={item.uuid}>{renderEquipmentItem({item})}</View>
              ))
            ) : (
              <Text style={styles.emptyListText}>
                {loading ? '불러오는 중...' : '장비가 없습니다.'}
              </Text>
            )}
          </ScrollView>
        </View>

        {/* 예약 신청하기 버튼 */}
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

        {/* 캘린더 */}
        <View style={styles.calendarWrapper}>
          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#FB5353',
              selectedDayTextColor: '#fff',
              todayTextColor: '#FB5353',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#FB5353',
              selectedDotColor: '#fff',
              arrowColor: '#00BFFF',
              monthTextColor: '#222',
              indicatorColor: '#FB5353',
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '400',
              textDayFontSize: 16,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 13,
            }}
            renderHeader={date => (
              <Text style={styles.calendarHeaderText}>
                {date.getFullYear()}년{' '}
                {String(date.getMonth() + 1).padStart(2, '0')}월
              </Text>
            )}
            onDayPress={day => {
              const formattedDate = day.dateString.replace(/-/g, '');
              setSelectedDate(formattedDate);
            }}
            markedDates={{
              [selectedDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')]: {
                selected: true,
                selectedColor: '#FB5353',
              },
            }}
            maxDate={
              new Date(new Date().setDate(new Date().getDate() + 30))
                .toISOString()
                .split('T')[0]
            }
          />
        </View>

        {/* 예약 현황 */}
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
            <View style={styles.reservationsList}>
              {reservations.map(item => (
                <View key={item.uuid}>{renderReservationItem({item})}</View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noReservations, {color: subTextColor}]}>
              예약된 내역이 없습니다.
            </Text>
          )}
        </View>
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
    color: '#888',
    fontWeight: '500',
  },
  selectedTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  tabUnderline: {
    marginTop: 4,
    height: 2,
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 1,
  },
  equipmentListContainer: {
    height: 190, // 2.5개 아이템이 보이도록
    overflow: 'hidden',
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
    backgroundColor: '#eee',
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
    color: '#888',
    marginBottom: 2,
  },
  equipmentPrice: {
    fontSize: 13,
    color: '#888',
  },
  detailButton: {
    backgroundColor: '#F6F7F9',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginLeft: 10,
  },
  detailButtonText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '600',
  },
  reserveButtonWrapper: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 12,
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
  calendarWrapper: {
    width: 320,
    alignSelf: 'center',
  },
  calendar: {
    marginTop: 8,
    borderRadius: 16,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 0,
  },
  reservationsContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reservationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reservationsLoading: {
    marginTop: 20,
  },
  reservationsList: {
    gap: 12,
  },
  noReservations: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  reservationItem: {
    padding: 16,
    borderRadius: 12,
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
    color: '#FB5353',
  },
  reservationDetailContainer: {
    marginTop: 8,
  },
  reservationTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  reservationUser: {
    fontSize: 14,
  },
  container: {
    flex: 1,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 40,
  },
  calendarHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
    color: '#222',
    textAlign: 'center',
  },
});

export default EquipmentReservationScreen;
