import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {RouteProp} from '@react-navigation/native';
import api from '../../utils/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {LocaleConfig} from 'react-native-calendars';
import CalendarKoreanLocales from '../../utils/calendar-locales';
import TimeSlotPickerModal from '../../components/TimeSlotPickerModal';
import {
  toConcreteSlots,
  hasRestrictedTimeSlotPolicy,
  getRestrictedTimeSlotPolicy,
} from '../../config/restricted-time-slots';

LocaleConfig.locales.kr = CalendarKoreanLocales;
LocaleConfig.defaultLocale = 'kr';

type PlaceReservationApplyScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'PlaceReservationApply'
  >;
  route: RouteProp<RootStackParamList, 'PlaceReservationApply'>;
};

const PlaceReservationApplyScreen = ({
  navigation,
  route,
}: PlaceReservationApplyScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const {buildingName, placeName, placeId, selectedDate} = route.params;


  // 사용자 정보
  const [userName, setUserName] = useState('');
  useEffect(() => {
    api.get('/auth/myInfo').then(res => setUserName(res.data.name || ''));
  }, []);

  // 폼 상태
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // 선택된 날짜가 있으면 해당 날짜로, 없으면 현재 날짜로 초기화
  const getInitialDate = () => {
    if (selectedDate) {
      // YYYYMMDD 형식을 Date 객체로 변환
      const year = parseInt(selectedDate.substring(0, 4));
      const month = parseInt(selectedDate.substring(4, 6)) - 1; // 월은 0부터 시작
      const day = parseInt(selectedDate.substring(6, 8));
      return new Date(year, month, day);
    }
    return new Date();
  };

  const [date, setDate] = useState(getInitialDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [timeSlotPickerVisible, setTimeSlotPickerVisible] = useState(false);

  const hasRestrictedTimeSlot = useMemo(
    () => hasRestrictedTimeSlotPolicy(placeName),
    [placeName],
  );

  const restrictedPolicy = useMemo(
    () => (hasRestrictedTimeSlot ? getRestrictedTimeSlotPolicy(placeName) : undefined),
    [hasRestrictedTimeSlot, placeName],
  );

  // 날짜 범위 계산 (컴포넌트 마운트 시 1회)
  const {minimumDate, maximumDate} = useMemo(() => {
    const today = new Date();
    const minDate = new Date(today.setHours(0, 0, 0, 0));
    const maxDate = new Date(today.setDate(today.getDate() + 30));
    return {minimumDate: minDate, maximumDate: maxDate};
  }, []);

  const scrollViewRef = useRef<any>(null);

  // 30분 단위로 시간 올림
  const roundUpToNearest30Minutes = (date: Date) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    const newDate = new Date(date);
    newDate.setMinutes(roundedMinutes);
    return newDate;
  };

  // 현재 시간을 30분 단위로 올림하여 초기 시간 설정
  useEffect(() => {
    const now = new Date();
    // 제한된 시간대 정책이 있는 경우
    if (hasRestrictedTimeSlot) {
      const policy = getRestrictedTimeSlotPolicy(placeName);
      // 오늘 기준 다음 가능한 슬롯으로 초기화
      const first = toConcreteSlots(now, policy)[0];
      setStartTime(first.start);
      setEndTime(first.end);
    } else {
      const roundedTime = roundUpToNearest30Minutes(now);
      setStartTime(roundedTime);
      const end = new Date(roundedTime);
      end.setMinutes(end.getMinutes() + 30);
      setEndTime(end);
    }
  }, [hasRestrictedTimeSlot]);

  // 선택된 날짜와 시간이 현재보다 이후인지 확인
  const isTimeAfterNow = (selectedDate: Date, selectedTime: Date) => {
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
    );
    return selectedDateTime > now;
  };

  // 종료 시간이 시작 시간보다 빠르면 자동 보정
  useEffect(() => {
    if (endTime < startTime) {
      setEndTime(startTime);
    }
  }, [startTime, endTime]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const subTextColor = isDarkMode ? '#888888' : '#6B7280';

  // 날짜를 한글 형식으로 포맷 (YYYY년 MM월 DD일)
  const formatDate = (d: Date) =>
    `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(
      2,
      '0',
    )}월 ${String(d.getDate()).padStart(2, '0')}일`;

  const handleReservation = () => {
    // 필수 입력값 검증
    if (!phone.trim()) {
      Alert.alert('알림', '전화번호를 입력해주세요.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('알림', '예약 제목을 입력해주세요.');
      return;
    }
    if (!desc.trim()) {
      Alert.alert('알림', '설명을 입력해주세요.');
      return;
    }
    if (title.length === 1) {
      Alert.alert('알림', '예약 제목이 너무 짧습니다.');
      return;
    }
    if (desc.length === 1) {
      Alert.alert('알림', '예약 설명이 너무 짧습니다.');
      return;
    }

    // 과거 날짜는 예약 금지 (조회만 허용)
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const selectedStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    if (selectedStart < todayStart) {
      Alert.alert('알림', '과거 날짜는 예약할 수 없습니다.');
      return;
    }

    // 예약 정보 확인 팝업
    Alert.alert(
      '',
      `예약 장소: ${placeName}\n예약 날짜: ${formatDate(
        date,
      )}\n예약 시간: ${startTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${endTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}\n\n예약하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '예약하기',
          onPress: () => {
            // Format date and time according to API requirements
            const formattedDate = `${date.getFullYear()}${String(
              date.getMonth() + 1,
            ).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
            const formattedStartTime = `${String(startTime.getHours()).padStart(
              2,
              '0',
            )}${String(startTime.getMinutes()).padStart(2, '0')}`;
            const formattedEndTime = `${String(endTime.getHours()).padStart(
              2,
              '0',
            )}${String(endTime.getMinutes()).padStart(2, '0')}`;

            // API call to create reservation
            api
              .post('/reservation-place', {
                placeId: placeId,
                phone: phone,
                title: title,
                description: desc,
                date: formattedDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
              })
              .then(() => {
                Alert.alert('알림', '예약을 생성 했습니다.', [
                  {
                    text: '확인',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              })
              .catch(error => {
                Alert.alert(
                  '알림',
                  `예약 생성에 실패했습니다: ${
                    error.response?.data?.message ||
                    '알 수 없는 오류가 발생했습니다.'
                  }`,
                );
              });
          },
        },
      ],
    );
  };

  // 버튼 비활성화 조건: 필수값 누락 또는 과거 날짜 선택
  const isPastSelectedDate = (() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const selectedStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    return selectedStart < todayStart;
  })();

  const disabledCreate =
    !phone.trim() || !title.trim() || !desc.trim() || isPastSelectedDate;

  // Picker 상태 관리 함수 추가
  const openDatePicker = () => {
    setShowDatePicker(true);
    setShowStartPicker(false);
    setShowEndPicker(false);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({x: 0, y: 600, animated: true});
    }, 100);
  };
  const openStartPicker = () => {
    setShowDatePicker(false);
    if (hasRestrictedTimeSlot) {
      setTimeSlotPickerVisible(true);
    } else {
      setShowStartPicker(true);
      setShowEndPicker(false);
    }
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({x: 0, y: 600, animated: true});
    }, 100);
  };
  const openEndPicker = () => {
    setShowDatePicker(false);
    if (hasRestrictedTimeSlot) {
      setTimeSlotPickerVisible(true);
    } else {
      setShowStartPicker(false);
      setShowEndPicker(true);
    }
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({x: 0, y: 600, animated: true});
    }, 100);
  };

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

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={{padding: 20}}
        keyboardShouldPersistTaps="handled"
        bottomOffset={180}>
        <View style={styles.infoSection}>
          <Text style={[styles.placeName, {color: textColor}]}>
            {placeName}
          </Text>
          <Text style={[styles.placeLocation, {color: subTextColor}]}>
            {buildingName}
          </Text>
        </View>
        {/* 예약 폼 */}
        <View style={styles.formSection}>
          {restrictedPolicy && (
            <View
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDarkMode ? '#1E1E1E' : '#F3F4F6',
                borderWidth: 1,
                borderColor: isDarkMode ? '#333333' : '#E5E7EB',
                marginBottom: 8,
              }}>
              <Text
                style={{
                  color: isDarkMode ? '#E5E7EB' : '#000000',
                  fontSize: 13,
                  lineHeight: 18,
                }}>
                {restrictedPolicy.notice}
              </Text>
            </View>
          )}
          <Text style={[styles.label, {color: textColor}]}>
            사용자 <Text style={styles.requiredText}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.disabledInput,
              {
                color: isDarkMode ? '#888888' : '#AAA',
                backgroundColor: isDarkMode ? '#2C2C2C' : '#F3F3F3',
                borderColor: borderColor,
              },
            ]}
            value={userName}
            editable={false}
            placeholder="이름"
            placeholderTextColor={subTextColor}
          />
          <Text style={[styles.label, {color: textColor}]}>
            전화번호 <Text style={styles.requiredText}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
                borderColor: borderColor,
              },
            ]}
            value={phone}
            onChangeText={setPhone}
            placeholder="010-xxxx-xxxx"
            placeholderTextColor={subTextColor}
            keyboardType="phone-pad"
            maxLength={13}
          />
          <Text style={[styles.label, {color: textColor}]}>
            예약 제목 <Text style={styles.requiredText}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
                borderColor: borderColor,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="예약 제목을 입력하세요"
            placeholderTextColor={subTextColor}
            maxLength={50}
          />
          <Text style={[styles.charCount, {color: subTextColor}]}>
            {title.length}/50
          </Text>
          <Text style={[styles.label, {color: textColor}]}>
            설명 <Text style={styles.requiredText}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                height: 80,
                color: textColor,
                backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
                borderColor: borderColor,
                textAlignVertical: 'top',
              },
            ]}
            value={desc}
            onChangeText={setDesc}
            placeholder="예약에 대한 설명과 사용 인원을 꼭 작성해 주세요"
            placeholderTextColor={subTextColor}
            multiline
            maxLength={200}
          />
          <Text style={[styles.charCount, {color: subTextColor}]}>
            {desc.length}/200
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 8,
            }}>
            {/* 날짜 */}
            <View style={{flex: 1.5}}>
              <Text
                style={[styles.label, {color: textColor, marginBottom: 10}]}>
                날짜 <Text style={styles.requiredText}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={openDatePicker}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
                    borderColor: showDatePicker ? '#FB5353' : borderColor,
                  },
                ]}>
                <Text style={{color: textColor, textAlign: 'center'}}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            </View>
            {/* 시작 시간 */}
            <View style={{flex: 1}}>
              <Text
                style={[styles.label, {color: textColor, marginBottom: 10}]}>
                시작 시각 <Text style={styles.requiredText}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={openStartPicker}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
                    borderColor: showStartPicker ? '#FB5353' : borderColor,
                  },
                ]}>
                <Text style={{color: textColor, textAlign: 'center'}}>
                  {startTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
            {/* 종료 시간 */}
            <View style={{flex: 1}}>
              <Text
                style={[styles.label, {color: textColor, marginBottom: 10}]}>
                종료 시각 <Text style={styles.requiredText}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={openEndPicker}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
                    borderColor: showEndPicker ? '#FB5353' : borderColor,
                  },
                ]}>
                <Text style={{color: textColor, textAlign: 'center'}}>
                  {endTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {showDatePicker && (
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              onConfirm={date => {
                setShowDatePicker(false);
                setDate(date);
                if (restrictedPolicy) {
                  // TODO: 오늘 가장 근접한 날짜 가져오는 로직 추출해서 사용하기
                  const first = toConcreteSlots(date, restrictedPolicy)[0];
                  if (first) {
                    setStartTime(first.start);
                    setEndTime(first.end);
                  }
                }
              }}
              onCancel={() => setShowDatePicker(false)}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              locale="ko-KR"
              confirmTextIOS="확인"
              cancelTextIOS="취소"
            />
          )}
          {showStartPicker && (
            <DateTimePickerModal
              isVisible={showStartPicker}
              mode="time"
              onConfirm={time => {
                setShowStartPicker(false);
                const roundedTime = roundUpToNearest30Minutes(time);
                const policy = restrictedPolicy;
                if (policy) {
                  const slots = toConcreteSlots(date, policy);
                  const chosen = slots.find(
                    s => roundedTime >= s.start && roundedTime < s.end,
                  );
                  if (!chosen) {
                    Alert.alert('알림', policy.notice);
                    return;
                  }
                  const now = new Date();
                  if (
                    new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      chosen.start.getHours(),
                      chosen.start.getMinutes(),
                    ) <= now
                  ) {
                    Alert.alert('알림', '현재 이후의 시간대를 선택해주세요.');
                    return;
                  }
                  setStartTime(chosen.start);
                  setEndTime(chosen.end);
                } else {
                  if (isTimeAfterNow(date, roundedTime)) {
                    setStartTime(roundedTime);
                    const newEndTime = new Date(roundedTime);
                    newEndTime.setMinutes(newEndTime.getMinutes() + 30);
                    setEndTime(newEndTime);
                  } else {
                    Alert.alert(
                      '알림',
                      '현재 시간보다 이후의 시간을 선택해주세요.',
                    );
                  }
                }
              }}
              onCancel={() => setShowStartPicker(false)}
              minuteInterval={30}
              date={startTime}
              minimumDate={minimumDate}
              is24Hour
              confirmTextIOS="확인"
              cancelTextIOS="취소"
            />
          )}
          {showEndPicker && !restrictedPolicy && (
            <DateTimePickerModal
              isVisible={showEndPicker}
              mode="time"
              onConfirm={time => {
                setShowEndPicker(false);
                setEndTime(roundUpToNearest30Minutes(time));
              }}
              onCancel={() => setShowEndPicker(false)}
              minuteInterval={30}
              date={endTime}
              is24Hour
              minimumDate={startTime}
              confirmTextIOS="확인"
              cancelTextIOS="취소"
            />
          )}

          {/* 제한 타임슬롯 커스텀 피커 */}
          {restrictedPolicy && (
            <TimeSlotPickerModal
              visible={timeSlotPickerVisible}
              onClose={() => setTimeSlotPickerVisible(false)}
              slots={toConcreteSlots(date, restrictedPolicy)}
              onSelectSlot={slot => {
                setStartTime(slot.start);
                setEndTime(slot.end);
                setTimeSlotPickerVisible(false);
              }}
            />
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.reservationButton,
            {
              backgroundColor: disabledCreate
                ? isDarkMode
                  ? '#2C2C2C'
                  : '#E5E7EB'
                : '#2a2a2a',
            },
          ]}
          onPress={handleReservation}
          disabled={disabledCreate}
          accessibilityState={{disabled: disabledCreate}}
          activeOpacity={disabledCreate ? 1 : 0.85}>
          <Text style={styles.reservationButtonText}>예약하기</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
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
  infoSection: {
    marginBottom: 5,
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
  formSection: {
    marginTop: 0,
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {},
  requiredText: {
    color: '#FB5353',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeCalendarBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FB5353',
  },
  calendarSelectedDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  inlineCalendarWrapper: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  reservationButton: {
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  reservationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default PlaceReservationApplyScreen;
