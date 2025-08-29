import React, {useEffect, useState, useRef} from 'react';
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import {RouteProp} from '@react-navigation/native';
import api from '../../utils/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {LocaleConfig} from 'react-native-calendars';
import CalendarKoreanLocales from '../../utils/calendar-locales';

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
  const {buildingName, placeName, placeId} = route.params;

  // 사용자 정보
  const [userName, setUserName] = useState('');
  useEffect(() => {
    api.get('/auth/myInfo').then(res => setUserName(res.data.name || ''));
  }, []);

  // 폼 상태
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

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
    const roundedTime = roundUpToNearest30Minutes(now);
    setStartTime(roundedTime);
    // 종료 시간을 시작 시간 + 30분으로 설정
    const endTime = new Date(roundedTime);
    endTime.setMinutes(endTime.getMinutes() + 30);
    setEndTime(endTime);
  }, []);

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
    if (title.length === 1 || desc.length === 1) {
      Alert.alert('알림', '예약 설명이 너무 짧습니다.');
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
                place_id: placeId,
                phone: phone,
                title: title,
                description: desc,
                date: formattedDate,
                start_time: formattedStartTime,
                end_time: formattedEndTime,
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

  // Picker 상태 관리 함수 추가
  const openDatePicker = () => {
    setShowDatePicker(true);
    setShowStartPicker(false);
    setShowEndPicker(false);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({y: 600, animated: true});
    }, 100);
  };
  const openStartPicker = () => {
    setShowDatePicker(false);
    setShowStartPicker(true);
    setShowEndPicker(false);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({y: 600, animated: true});
    }, 100);
  };
  const openEndPicker = () => {
    setShowDatePicker(false);
    setShowStartPicker(false);
    setShowEndPicker(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({y: 600, animated: true});
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
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        extraHeight={120}
      >
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
          <Text style={[styles.label, {color: textColor}]}>사용자</Text>
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
          <Text style={[styles.label, {color: textColor}]}>전화번호</Text>
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
          <Text style={[styles.label, {color: textColor}]}>예약 제목</Text>
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
          />
          <Text style={[styles.label, {color: textColor}]}>설명</Text>
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
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 8,
            }}>
            {/* 날짜 */}
            <View style={{flex: 1.5}}>
              <Text
                style={[styles.label, {color: textColor, marginBottom: 13}]}>
                날짜
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
                시작 시각
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
                종료 시각
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
              }}
              onCancel={() => setShowDatePicker(false)}
              minimumDate={new Date()}
              maximumDate={
                new Date(new Date().setDate(new Date().getDate() + 30))
              }
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
              }}
              onCancel={() => setShowStartPicker(false)}
              minuteInterval={30}
              is24Hour
              confirmTextIOS="확인"
              cancelTextIOS="취소"
            />
          )}
          {showEndPicker && (
            <DateTimePickerModal
              isVisible={showEndPicker}
              mode="time"
              onConfirm={time => {
                setShowEndPicker(false);
                setEndTime(roundUpToNearest30Minutes(time));
              }}
              onCancel={() => setShowEndPicker(false)}
              minuteInterval={30}
              is24Hour
              minimumDate={startTime}
              confirmTextIOS="확인"
              cancelTextIOS="취소"
            />
          )}
        </View>
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.bottomButtonContainer,
          {
            borderTopColor: borderColor,
            backgroundColor: isDarkMode ? '#121212' : '#fff',
          },
        ]}>
        <TouchableOpacity
          style={styles.reservationButton}
          onPress={handleReservation}>
          <Text style={styles.reservationButtonText}>예약하기</Text>
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
    backgroundColor: '#FB5353',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reservationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlaceReservationApplyScreen;
