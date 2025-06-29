import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '@navigation/types';
import PoPoAxios from '../../utils/api';
import DateTimePicker from '@react-native-community/datetimepicker';

interface IEquipment {
  uuid: string;
  name: string;
  description: string;
  fee: number;
  image_url?: string;
  max_minutes: number;
}

interface IUser {
  uuid: string;
  name: string;
  email: string;
}

interface IEquipReservation {
  uuid: string;
  booker: IUser;
  equipments: IEquipment[];
  date: string;
  description: string;
  start_time: string;
  end_time: string;
  phone: string;
  status: string;
  title: string;
  created_at: Date;
}

type EquipmentReservationApplyScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'EquipmentReservationApply'
  >;
  route: RouteProp<RootStackParamList, 'EquipmentReservationApply'>;
};

const EquipmentReservationApplyScreen = ({
  navigation,
  route,
}: EquipmentReservationApplyScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const association = route?.params?.association ?? 'dongyeon';

  // 사용자 정보
  const [userName, setUserName] = useState('');
  const [userLoading, setUserLoading] = useState(true);
  useEffect(() => {
    PoPoAxios.get('/auth/myInfo')
      .then(res => setUserName(res.data.name || ''))
      .finally(() => setUserLoading(false));
  }, []);

  // 폼 상태
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedEquipments, setSelectedEquipments] = useState<IEquipment[]>(
    [],
  );
  const [equipmentList, setEquipmentList] = useState<IEquipment[]>([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempEndTime, setTempEndTime] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const [showEquipmentList, setShowEquipmentList] = useState(false);
  const [reservedEquipments, setReservedEquipments] = useState<string[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // 장비 리스트 불러오기
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await PoPoAxios.get<IEquipment[]>(
          `equip/owner/${association}`,
        );
        setEquipmentList(res.data);
      } catch (e) {
        setEquipmentList([]);
      }
    };
    fetchEquipment();
  }, [association]);

  // 예약된 장비 확인
  const checkReservedEquipments = useCallback(async () => {
    if (!date || !startTime || !endTime) {
      return;
    }

    try {
      setLoadingReservations(true);
      const dateStr = `${date.getFullYear()}${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

      const response = await PoPoAxios.get<IEquipReservation[]>(
        '/reservation-equip',
        {
          params: {
            owner: association,
            date: dateStr,
          },
        },
      );

      const startTimeStr = `${String(startTime.getHours()).padStart(
        2,
        '0',
      )}${String(startTime.getMinutes()).padStart(2, '0')}`;
      const endTimeStr = `${String(endTime.getHours()).padStart(
        2,
        '0',
      )}${String(endTime.getMinutes()).padStart(2, '0')}`;

      const reservations = response.data || [];
      const overlappingReservations = reservations.filter(reservation => {
        // 예약이 'canceled' 상태이면 충돌 검사에서 제외
        if (reservation.status === 'canceled') {
          return false;
        }
        return (
          reservation.start_time < endTimeStr &&
          startTimeStr < reservation.end_time
        );
      });

      const reservedUUIDs = overlappingReservations.flatMap(reservation =>
        reservation.equipments.map(equipment => equipment.uuid),
      );

      setReservedEquipments(reservedUUIDs);
    } catch (error) {
      console.error('예약 확인 실패:', error);
      setReservedEquipments([]);
    } finally {
      setLoadingReservations(false);
    }
  }, [association, date, endTime, startTime]);

  // 날짜나 시간이 변경될 때 예약된 장비 확인
  useEffect(() => {
    checkReservedEquipments();
  }, [checkReservedEquipments]);

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
    const endTime = new Date(roundedTime);
    endTime.setMinutes(endTime.getMinutes() + 30);
    setEndTime(endTime);
  }, []);

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

  // 장비 선택 토글
  const toggleEquipment = (equipment: IEquipment) => {
    setSelectedEquipments(prev => {
      if (prev.find(e => e.uuid === equipment.uuid)) {
        return prev.filter(e => e.uuid !== equipment.uuid);
      } else {
        return [...prev, equipment];
      }
    });
  };

  // 총 가격 계산
  const totalPrice = selectedEquipments.reduce(
    (acc, equipment) => acc + equipment.fee,
    0,
  );

  // 예약 생성
  const handleReservation = () => {
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
    if (selectedEquipments.length === 0) {
      Alert.alert('알림', '예약할 장비를 선택해주세요.');
      return;
    }

    // 예약된 장비가 선택되었는지 확인
    const hasReservedEquipment = selectedEquipments.some(equipment =>
      reservedEquipments.includes(equipment.uuid),
    );

    if (hasReservedEquipment) {
      Alert.alert(
        '알림',
        '이미 예약된 장비가 포함되어 있습니다. 장비 목록을 다시 확인해주세요.',
      );
      return;
    }

    // 예약 정보 확인 팝업
    Alert.alert(
      '',
      `예약 장비: ${selectedEquipments
        .map(e => e.name)
        .join(', ')}\n예약 날짜: ${formatDate(
        date,
      )}\n예약 시간: ${startTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${endTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}\n\n예약하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '예약하기',
          onPress: async () => {
            try {
              // 날짜와 시간을 요구사항에 맞는 형식으로 변환
              const dateStr = `${date.getFullYear()}${String(
                date.getMonth() + 1,
              ).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
              const startTimeStr = `${String(startTime.getHours()).padStart(
                2,
                '0',
              )}${String(startTime.getMinutes()).padStart(2, '0')}`;
              const endTimeStr = `${String(endTime.getHours()).padStart(
                2,
                '0',
              )}${String(endTime.getMinutes()).padStart(2, '0')}`;

              await PoPoAxios.post<IEquipReservation>('/reservation-equip', {
                equipments: selectedEquipments.map(e => e.uuid),
                owner: association,
                phone: phone,
                title: title,
                description: desc,
                date: dateStr,
                start_time: startTimeStr,
                end_time: endTimeStr,
              });

              Alert.alert('성공', '예약이 성공적으로 생성되었습니다.', [
                {
                  text: '확인',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('예약 생성 실패:', error);
              Alert.alert(
                '오류',
                '예약 생성에 실패했습니다. 다시 시도해주세요.',
              );
            }
          },
        },
      ],
    );
  };

  // Picker 상태 관리 함수
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

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (showEquipmentList) {
          setShowEquipmentList(false);
        }
        Keyboard.dismiss();
      }}>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <View style={[styles.header, {borderBottomColor: borderColor}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={[styles.backButtonText, {color: textColor}]}>
              뒤로
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: textColor}]}>
            장비 예약:{' '}
            {association === 'dormunion' ? '생활관자치회' : '동아리연합회'}
          </Text>
          <View style={styles.placeholderButton} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formSection}>
            <Text style={[styles.label, {color: textColor}]}>
              사용자 <Text style={{color: '#FB5353'}}>*</Text>
            </Text>
            <View style={styles.userInfoContainer}>
              {userLoading ? (
                <ActivityIndicator size="small" color={subTextColor} />
              ) : (
                <TextInput
                  style={[
                    styles.input,
                    styles.disabledInput,
                    {
                      color: isDarkMode ? '#888888' : '#AAA',
                      backgroundColor: isDarkMode ? '#2C2C2C' : '#F3F3F3',
                    },
                  ]}
                  value={userName}
                  editable={false}
                  placeholder="이름"
                  placeholderTextColor={subTextColor}
                />
              )}
            </View>
            <Text style={[styles.label, {color: textColor}]}>
              전화번호 <Text style={{color: '#FB5353'}}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
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
              예약 제목 <Text style={{color: '#FB5353'}}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="예약 제목을 입력하세요"
              placeholderTextColor={subTextColor}
            />
            <Text style={[styles.label, {color: textColor}]}>
              설명 <Text style={{color: '#FB5353'}}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.descriptionInput,
                {
                  color: textColor,
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
                },
              ]}
              value={desc}
              onChangeText={setDesc}
              placeholder="사용처를 반드시 작성 해주세요."
              placeholderTextColor={subTextColor}
              multiline
            />
            <Text style={[styles.label, {color: textColor}]}>
              장비 선택 <Text style={{color: '#FB5353'}}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.equipmentSelector,
                {
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
                },
              ]}
              onPress={e => {
                e.stopPropagation && e.stopPropagation();
                setShowEquipmentList(prev => !prev);
              }}
              activeOpacity={0.8}>
              {selectedEquipments.length > 0 ? (
                selectedEquipments.map(equip => (
                  <View key={equip.uuid} style={styles.selectedEquipmentItem}>
                    <Text style={styles.selectedEquipmentText}>
                      {equip.name}
                    </Text>
                    <TouchableOpacity onPress={() => toggleEquipment(equip)}>
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={[styles.placeholderText, {color: subTextColor}]}>
                  예약할 장비들을 선택해주세요.
                </Text>
              )}
            </TouchableOpacity>
            {showEquipmentList && (
              <ScrollView style={styles.equipmentListScrollView}>
                {loadingReservations ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={subTextColor} />
                    <Text style={[styles.loadingText, {color: subTextColor}]}>
                      예약 상태 확인 중...
                    </Text>
                  </View>
                ) : equipmentList.length === 0 ? (
                  <Text style={styles.emptyListText}>장비가 없습니다.</Text>
                ) : (
                  equipmentList.map(item => {
                    const selected = !!selectedEquipments.find(
                      e => e.uuid === item.uuid,
                    );
                    const isReserved = reservedEquipments.includes(item.uuid);

                    return (
                      <TouchableOpacity
                        key={item.uuid}
                        onPress={() => toggleEquipment(item)}
                        disabled={selected}
                        style={[
                          styles.equipmentItem,
                          (selected || isReserved) &&
                            styles.disabledEquipmentItem,
                        ]}>
                        <Text
                          style={[
                            styles.equipmentName,
                            isReserved && styles.reservedEquipmentName,
                          ]}>
                          {item.name}
                        </Text>
                        {selected && <Text style={styles.checkIcon}>✔</Text>}
                        {isReserved && !selected && (
                          <Text style={styles.reservedText}>(예약됨)</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}
            {/* 날짜/시간 선택 */}
            <View style={styles.dateTimePickerContainer}>
              <View style={styles.datePickerWrapper}>
                <Text
                  style={[styles.label, {color: textColor, marginBottom: 13}]}>
                  날짜 <Text style={{color: '#FB5353'}}>*</Text>
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
                  <Text style={[styles.datePickerText, {color: textColor}]}>
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timePickerWrapper}>
                <Text
                  style={[styles.label, {color: textColor, marginBottom: 13}]}>
                  시작 시간 <Text style={{color: '#FB5353'}}>*</Text>
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
                  <Text style={[styles.datePickerText, {color: textColor}]}>
                    {startTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timePickerWrapper}>
                <Text
                  style={[styles.label, {color: textColor, marginBottom: 13}]}>
                  종료 시간 <Text style={{color: '#FB5353'}}>*</Text>
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
                  <Text style={[styles.datePickerText, {color: textColor}]}>
                    {endTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* DateTimePicker 및 예외처리 */}
            {showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                maximumDate={
                  new Date(new Date().setDate(new Date().getDate() + 30))
                }
                locale="ko-KR"
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    if (event.type === 'set' && selectedDate) {
                      setShowDatePicker(false);
                      setDate(selectedDate);
                    } else if (event.type === 'dismissed') {
                      setShowDatePicker(false);
                    }
                  } else {
                    if (selectedDate) {
                      setTempDate(selectedDate);
                    }
                  }
                }}
                onTouchCancel={() => setShowDatePicker(false)}
              />
            )}
            {showDatePicker && Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.iosPickerConfirmButton}
                onPress={() => {
                  setShowDatePicker(false);
                  setDate(tempDate);
                }}>
                <Text style={styles.iosPickerConfirmText}>확인</Text>
              </TouchableOpacity>
            )}
            {showStartPicker && (
              <DateTimePicker
                value={tempStartTime}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minuteInterval={30}
                onChange={(event, selected) => {
                  if (Platform.OS === 'android') {
                    if (event.type === 'set' && selected) {
                      setShowStartPicker(false);
                      const roundedTime = roundUpToNearest30Minutes(selected);
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
                    } else if (event.type === 'dismissed') {
                      setShowStartPicker(false);
                    }
                  } else {
                    if (selected) {
                      setTempStartTime(roundUpToNearest30Minutes(selected));
                    }
                  }
                }}
                onTouchCancel={() => setShowStartPicker(false)}
              />
            )}
            {showStartPicker && Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.iosPickerConfirmButton}
                onPress={() => {
                  setShowStartPicker(false);
                  if (isTimeAfterNow(date, tempStartTime)) {
                    setStartTime(tempStartTime);
                    const newEndTime = new Date(tempStartTime);
                    newEndTime.setMinutes(newEndTime.getMinutes() + 30);
                    setEndTime(newEndTime);
                  } else {
                    Alert.alert(
                      '알림',
                      '현재 시간보다 이후의 시간을 선택해주세요.',
                    );
                  }
                }}>
                <Text style={styles.iosPickerConfirmText}>확인</Text>
              </TouchableOpacity>
            )}
            {showEndPicker && (
              <DateTimePicker
                value={tempEndTime}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minuteInterval={30}
                minimumDate={startTime}
                onChange={(event, selected) => {
                  if (Platform.OS === 'android') {
                    if (event.type === 'set' && selected) {
                      setShowEndPicker(false);
                      setEndTime(roundUpToNearest30Minutes(selected));
                    } else if (event.type === 'dismissed') {
                      setShowEndPicker(false);
                    }
                  } else {
                    if (selected) {
                      setTempEndTime(roundUpToNearest30Minutes(selected));
                    }
                  }
                }}
                onTouchCancel={() => setShowEndPicker(false)}
              />
            )}
            {showEndPicker && Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.iosPickerConfirmButton}
                onPress={() => {
                  setShowEndPicker(false);
                  if (tempEndTime > startTime) {
                    setEndTime(tempEndTime);
                  } else {
                    const newEndTime = new Date(startTime);
                    newEndTime.setMinutes(newEndTime.getMinutes() + 30);
                    setEndTime(newEndTime);
                  }
                }}>
                <Text style={styles.iosPickerConfirmText}>확인</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* 하단 버튼 */}
          <View
            style={[
              styles.bottomButtonContainer,
              {backgroundColor: isDarkMode ? '#121212' : '#fff'},
            ]}>
            {selectedEquipments.length > 0 && (
              <View style={styles.totalPriceContainer}>
                <View style={styles.totalPriceWrapper}>
                  <Text style={[styles.totalPriceLabel, {color: textColor}]}>
                    총 예약비
                  </Text>
                  <Text style={styles.totalPriceValue}>
                    {totalPrice.toLocaleString()}원
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={styles.reservationButton}
              onPress={handleReservation}>
              <Text style={styles.reservationButtonText}>예약 생성하기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {},
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  equipmentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    minHeight: 48,
    marginBottom: 8,
  },
  selectedEquipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  selectedEquipmentText: {
    fontSize: 14,
    marginRight: 4,
  },
  removeButtonText: {
    color: '#FB5353',
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 16,
    paddingLeft: 4,
    lineHeight: 24,
  },
  equipmentListScrollView: {
    maxHeight: 220,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  disabledEquipmentItem: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
  equipmentName: {
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
  reservedEquipmentName: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  checkIcon: {
    color: '#FB5353',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reservedText: {
    color: '#888',
    fontSize: 12,
  },
  dateTimePickerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  datePickerWrapper: {
    flex: 1.5,
  },
  timePickerWrapper: {
    flex: 1,
  },
  datePickerText: {
    textAlign: 'center',
  },
  iosPickerConfirmButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#FB5353',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  iosPickerConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    paddingHorizontal: 0,
    paddingVertical: 20,
  },
  totalPriceContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  totalPriceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPriceValue: {
    color: '#FB5353',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reservationButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  reservationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    minHeight: 48,
    justifyContent: 'center',
  },
});

export default EquipmentReservationApplyScreen;
