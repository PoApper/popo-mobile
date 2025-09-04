import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '@navigation/types';
import PoPoAxios from '../../utils/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

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
  const [startTime, setStartTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [reservedEquipments, setReservedEquipments] = useState<string[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // 장비 리스트 불러오기
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        console.log('장비 리스트 요청 시작');
        console.log('association 값:', association);
        console.log('API 엔드포인트:', `equip/owner/${association}`);

        const res = await PoPoAxios.get<IEquipment[]>(
          `equip/owner/${association}`,
        );

        console.log('장비 리스트 응답 성공:', res.data);
        console.log('응답 데이터 길이:', res.data?.length || 0);

        // 장비 리스트를 가나다순으로 정렬
        const sortedEquipmentList = (res.data || []).sort((a, b) =>
          a.name.localeCompare(b.name, 'ko-KR'),
        );

        setEquipmentList(sortedEquipmentList);
      } catch (e: any) {
        console.error('장비 리스트 요청 실패:', e);
        console.error('에러 상세:', e.response?.data || e.message);
        setEquipmentList([]);
      }
    };

    if (association) {
      fetchEquipment();
    } else {
      console.log('association이 설정되지 않음');
    }
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
  const roundUpToNearest30Minutes = (inputDate: Date) => {
    const minutes = inputDate.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    const newDate = new Date(inputDate);
    newDate.setMinutes(roundedMinutes);
    return newDate;
  };

  // 현재 시간을 30분 단위로 올림하여 초기 시간 설정
  useEffect(() => {
    const now = new Date();
    const roundedTime = roundUpToNearest30Minutes(now);
    setStartTime(roundedTime);
    const newEndTime = new Date(roundedTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + 30);
    setEndTime(newEndTime);
  }, []);

  // 종료 시간이 시작 시간보다 빠르면 자동 보정
  useEffect(() => {
    if (endTime < startTime) {
      setEndTime(startTime);
    }
  }, [startTime, endTime]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
    flex: 1,
  };
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const subTextColor = isDarkMode ? '#a0a0a0' : '#6B7280';
  const inputBackgroundColor = isDarkMode ? '#2a2a2a' : '#F9FAFB';
  const disabledInputBackgroundColor = isDarkMode ? '#3a3a3a' : '#F3F3F3';
  const noticeBackgroundColor = isDarkMode ? '#2a2a2a' : '#FFF8F8';
  const noticeBorderColor = isDarkMode ? '#3a3a3a' : '#FFE5E5';

  // 날짜를 한글 형식으로 포맷 (YYYY년 MM월 DD일)
  const formatDate = (d: Date) =>
    `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(
      2,
      '0',
    )}월 ${String(d.getDate()).padStart(2, '0')}일`;

  // 장비 선택 토글
  const toggleEquipment = useCallback((equipment: IEquipment) => {
    setSelectedEquipments(prev => {
      if (prev.find(e => e.uuid === equipment.uuid)) {
        return prev.filter(e => e.uuid !== equipment.uuid);
      } else {
        return [...prev, equipment];
      }
    });
  }, []);

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

  const openEquipListPicker = () => {
    Keyboard.dismiss();
    setShowDatePicker(false);
    setShowStartPicker(false);
    setShowEndPicker(false);
    setShowEquipmentModal(true);
    // 모달이 열릴 때 예약된 장비 상태 확인
    checkReservedEquipments();
  };

  // Picker 상태 관리 함수
  const openDatePicker = () => {
    setShowEquipmentModal(false);
    Keyboard.dismiss();
    setShowDatePicker(true);
    setShowStartPicker(false);
    setShowEndPicker(false);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({x: 0, y: 600, animated: true});
    }, 100);
  };
  const openStartPicker = () => {
    setShowEquipmentModal(false);
    Keyboard.dismiss();
    setShowDatePicker(false);
    setShowStartPicker(true);
    setShowEndPicker(false);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({x: 0, y: 600, animated: true});
    }, 100);
  };
  const openEndPicker = () => {
    setShowEquipmentModal(false);
    Keyboard.dismiss();
    setShowDatePicker(false);
    setShowStartPicker(false);
    setShowEndPicker(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({x: 0, y: 600, animated: true});
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

  // 이모티콘 제거 함수
  const removeEmoji = (text: string) => {
    return text.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      '',
    );
  };

  // 장비 아이템 렌더 함수 메모이제이션
  const renderEquipmentItem = useCallback(
    ({item}: {item: IEquipment}) => {
      const selected = !!selectedEquipments.find(e => e.uuid === item.uuid);
      const isReserved = reservedEquipments.includes(item.uuid);

      return (
        <TouchableOpacity
          key={item.uuid}
          onPress={() => toggleEquipment(item)}
          disabled={isReserved}
          style={[
            styles.equipmentItem,
            {borderColor: isDarkMode ? '#3a3a3a' : '#F3F4F6'},
            isReserved && styles.disabledEquipmentItem,
            isReserved && {
              backgroundColor: isDarkMode ? '#2a2a2a' : '#F3F4F6',
            },
            selected && {
              backgroundColor: isDarkMode ? '#3a3a3a' : '#E5E7EB',
            },
          ]}>
          <Text
            style={[
              styles.equipmentName,
              {color: textColor},
              isReserved && styles.reservedEquipmentName,
              isReserved && {color: subTextColor},
            ]}>
            {removeEmoji(item.name)}
          </Text>
          {selected && <Text style={styles.checkIcon}>✔</Text>}
          {isReserved && !selected && (
            <Text style={[styles.reservedText, {color: subTextColor}]}>
              (예약됨)
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [
      selectedEquipments,
      reservedEquipments,
      isDarkMode,
      textColor,
      subTextColor,
      toggleEquipment,
    ],
  );

  const keyExtractor = useCallback((item: IEquipment) => item.uuid, []);

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
        <Text style={[styles.headerTitle, {color: textColor}]}>
          장비 예약:{' '}
          {association === 'dormunion' ? '생활관자치회' : '동아리연합회'}
        </Text>
        <View style={styles.placeholderButton} />
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        bottomOffset={association === 'dormunion' ? 120 : 200}>
        {/* 공지사항 섹션 */}
        <View
          style={[
            styles.noticeSection,
            {
              borderColor: noticeBorderColor,
              backgroundColor: noticeBackgroundColor,
            },
          ]}>
          <Text style={[styles.noticeTitle, {color: textColor}]}>
            📢 예약 공지사항
          </Text>
          {association === 'dormunion' ? (
            <View style={styles.noticeContent}>
              <Text style={[styles.noticeText, {color: textColor}]}>
                예약한 장비는 생활관자치회 사무실(생활관 4동)에서 수령하실 수
                있습니다. 🏢️
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                장비가 분실되거나 예약 시간을 초과할 경우, 차후 예약에 제한을 둘
                수 있습니다. 🚨
              </Text>
            </View>
          ) : (
            <View style={styles.noticeContent}>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>물품 대여 순서 :</Text> POPO
                신청&입금 - 카카오톡 채널 입장 - 승인 - 대여&반납
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>예약비 입금 계좌 :</Text>{' '}
                부산은행 1122244813601 (안강현)
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                *입금자명은 예약자명과 동일하게 해주세요.
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                예약금 납부 후, 카카오톡 채널에 입장하여 대여자명 / 대여일 /
                대여품목 / 송금 화면 발송
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>카카오톡 채널 링크 :</Text>{' '}
                동아리연합회 2025
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>예시</Text>
                {'\n'}
                정종민{'\n'}
                3월 10일 월요일{'\n'}
                메인스피커1 / 오디오 인터페이스 / 유선 보컬 마이크 1~3
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>대여/반납 시간 :</Text> 월 ~ 금
                / 12:30 ~ 13:30
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                *그 외 시간에 대여와 반납은 어렵습니다.
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>수령 장소 :</Text> 동아리연합회
                사무실(학생회관 301호)
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                장비 분실 및 반납 시간을 어길 시 책임을 물을 수 있습니다.
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>문의 :</Text> (운영관리부장
                장현웅) 010-5917-8295
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, {color: textColor}]}>
            사용자 <Text style={styles.requiredText}>*</Text>
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
                    backgroundColor: disabledInputBackgroundColor,
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
            전화번호 <Text style={styles.requiredText}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: inputBackgroundColor,
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
                backgroundColor: inputBackgroundColor,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="예약 제목을 입력하세요"
            placeholderTextColor={subTextColor}
          />
          <Text style={[styles.label, {color: textColor}]}>
            설명 <Text style={styles.requiredText}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              {
                color: textColor,
                backgroundColor: inputBackgroundColor,
              },
            ]}
            value={desc}
            onChangeText={setDesc}
            placeholder="사용처를 반드시 작성 해주세요."
            placeholderTextColor={subTextColor}
            multiline
          />
          <Text style={[styles.label, {color: textColor}]}>
            장비 선택 <Text style={styles.requiredText}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.equipmentSelector,
              {
                backgroundColor: inputBackgroundColor,
              },
            ]}
            onPress={openEquipListPicker}
            activeOpacity={0.8}>
            {selectedEquipments.length > 0 ? (
              selectedEquipments.map(equip => (
                <View
                  key={equip.uuid}
                  style={[
                    styles.selectedEquipmentItem,
                    {backgroundColor: isDarkMode ? '#3a3a3a' : '#E5E7EB'},
                  ]}>
                  <Text
                    style={[styles.selectedEquipmentText, {color: textColor}]}>
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

          {/* 날짜/시간 선택 */}
          <View style={styles.dateTimePickerContainer}>
            <View style={styles.datePickerWrapper}>
              <Text
                style={[styles.label, styles.pickerLabel, {color: textColor}]}>
                날짜 <Text style={styles.requiredText}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={openDatePicker}
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBackgroundColor,
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
                style={[styles.label, styles.pickerLabel, {color: textColor}]}>
                시작 시간 <Text style={styles.requiredText}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={openStartPicker}
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBackgroundColor,
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
                style={[styles.label, styles.pickerLabel, {color: textColor}]}>
                종료 시간 <Text style={styles.requiredText}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={openEndPicker}
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBackgroundColor,
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
        </View>
        {/* DateTimePicker 및 예외처리 */}
        {showDatePicker && (
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={date => {
              setShowDatePicker(false);
              setDate(date);
            }}
            onCancel={() => setShowDatePicker(false)}
            date={date}
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
            is24Hour
            minuteInterval={30}
            date={startTime}
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
            is24Hour
            minuteInterval={30}
            date={endTime}
            minimumDate={startTime}
            confirmTextIOS="확인"
            cancelTextIOS="취소"
          />
        )}
        {/* 하단 버튼 */}
        <View
          style={[
            styles.bottomButtonContainer,
            {backgroundColor: backgroundStyle.backgroundColor},
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
            {/* TODO: 장소 예약이랑 색깔 및 단어 통일 */}
            <Text style={styles.reservationButtonText}>예약 생성하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* 장비 선택 팝업 (하단에서 슬라이드업) */}
      {showEquipmentModal && (
        <View style={styles.popupOverlay}>
          <TouchableOpacity
            style={styles.popupBackdrop}
            onPress={() => setShowEquipmentModal(false)}
            activeOpacity={1}
          />
          <View
            style={[
              styles.popupContent,
              {backgroundColor: backgroundStyle.backgroundColor},
            ]}>
            {/* 팝업 헤더 */}
            <View
              style={[styles.popupHeader, {borderBottomColor: borderColor}]}>
              <Text style={[styles.popupTitle, {color: textColor}]}>
                장비 선택
              </Text>
              <TouchableOpacity
                style={styles.popupCompleteButton}
                onPress={() => setShowEquipmentModal(false)}>
                <Text style={styles.popupCompleteText}>확인</Text>
              </TouchableOpacity>
            </View>

            {/* 팝업 바디 */}
            <View style={styles.popupBody}>
              {/* 장비 개수 표시 */}
              <Text style={[styles.popupInfoText, {color: textColor}]}>
                ⚒️ 선택 가능한 장비: {equipmentList.length}개
              </Text>

              {/* 로딩 상태 표시 */}
              {loadingReservations && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={subTextColor} />
                  <Text style={[styles.loadingText, {color: subTextColor}]}>
                    예약 상태 확인 중...
                  </Text>
                </View>
              )}

              {/* 장비 리스트 */}
              <FlatList
                data={equipmentList}
                renderItem={renderEquipmentItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.popupEquipmentList}
                style={styles.popupFlatList}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
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
  pickerLabel: {
    marginBottom: 13,
  },
  requiredText: {
    color: '#FB5353',
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
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  disabledEquipmentItem: {
    opacity: 0.5,
  },
  equipmentName: {
    fontSize: 16,
    flex: 1,
  },
  reservedEquipmentName: {
    textDecorationLine: 'line-through',
  },
  checkIcon: {
    color: '#FB5353',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reservedText: {
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
  noticeSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noticeContent: {
    gap: 8,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noticeBold: {
    fontWeight: 'bold',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalEquipmentList: {
    paddingBottom: 20,
  },
  // 팝업 스타일 (하단에서 슬라이드업)
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  popupBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    zIndex: 1001,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  popupCompleteButton: {
    backgroundColor: '#FB5353',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  popupCompleteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  popupBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  popupInfoText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  popupEquipmentList: {
    paddingBottom: 20,
  },
  popupFlatList: {
    maxHeight: 400,
  },
  debugInfo: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default EquipmentReservationApplyScreen;
