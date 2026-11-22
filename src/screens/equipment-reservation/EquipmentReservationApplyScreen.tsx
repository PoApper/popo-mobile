import React, {useEffect, useState, useRef, useCallback, useMemo} from 'react';
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
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from '@navigation/types';
import PoPoAxios from '../../utils/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {openURLWithFallback} from '../../utils/linking';
import {DONGYEON_KAKAO_CHANNEL_URL} from '../../constants/urls';
import {
  MIN_RESERVATION_DURATION_MS,
  roundUpToNearest30Minutes,
} from '@utils/popo-datetime';
import {getCurrentLocale} from '@utils/i18n';
import {getLocalizedField} from '@utils/locale';

interface IEquipment {
  uuid: string;
  name: string;
  nameEn?: string | null;
  description: string;
  fee: number;
  imageUrl?: string;
  maxMinutes: number;
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
  startTime: string;
  endTime: string;
  phone: string;
  status: string;
  title: string;
  createdAt: Date;
}

interface ISettingResponse {
  dongyeonBank?: string;
  dongyeonServiceTime?: string;
  dongyeonContact?: string;
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
  const {t} = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const association = route?.params?.association;
  const selectedDate = route?.params?.selectedDate;

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
  const [dongyeonBank, setDongyeonBank] = useState('');
  const [dongyeonServiceTime, setDongyeonServiceTime] = useState('');
  const [dongyeonContact, setDongyeonContact] = useState('');

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

  // 날짜 범위 계산 (컴포넌트 마운트 시 1회)
  const {minimumDate, maximumDate} = useMemo(() => {
    const today = new Date();
    const minDate = new Date(today.setHours(0, 0, 0, 0));
    const maxDate = new Date(today.setDate(today.getDate() + 30));
    return {minimumDate: minDate, maximumDate: maxDate};
  }, []);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [reservedEquipments, setReservedEquipments] = useState<string[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  useEffect(() => {
    if (association !== 'dongyeon') {
      return;
    }
    let isMounted = true;
    PoPoAxios.get<ISettingResponse>('/setting')
      .then(res => {
        if (!isMounted) {
          return;
        }
        const data = res.data ?? {};
        setDongyeonBank(data.dongyeonBank ?? '');
        setDongyeonServiceTime(data.dongyeonServiceTime ?? '');
        setDongyeonContact(data.dongyeonContact ?? '');
      })
      .catch(error => {
        console.error('설정 정보 불러오기 실패:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [association]);

  const getSettingValue = useCallback(
    (value: string, fallback: string) => (value?.trim() ? value : fallback),
    [],
  );

  const openClubUnionChannel = useCallback(async () => {
    await openURLWithFallback(DONGYEON_KAKAO_CHANNEL_URL);
  }, []);

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
        const locale = getCurrentLocale();
        const sortedEquipmentList = (res.data || []).sort((a, b) =>
          getLocalizedField(a, 'name', locale).localeCompare(
            getLocalizedField(b, 'name', locale),
            locale,
          ),
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
          reservation.startTime < endTimeStr &&
          startTimeStr < reservation.endTime
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

  // 현재 시간을 30분 단위로 올림하여 초기 시간 설정
  useEffect(() => {
    const now = new Date();
    const roundedTime = roundUpToNearest30Minutes(now);
    setStartTime(roundedTime);
    const newEndTime = new Date(roundedTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + 30);
    setEndTime(newEndTime);
  }, []);

  // 최소 예약 시간(30분)을 만족하는 가장 이른 종료 시각
  const earliestEndTime = useMemo(
    () => new Date(startTime.getTime() + MIN_RESERVATION_DURATION_MS),
    [startTime],
  );

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

  const formatDate = (d: Date) =>
    d.toLocaleDateString(getCurrentLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString(getCurrentLocale(), {
      hour: '2-digit',
      minute: '2-digit',
    });
  const settingFallback = t('reservation.equipment.settingLoading');

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
    // 과거 날짜는 예약 금지
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
      Alert.alert(t('reservation.notice'), t('reservation.pastDateAlert'));
      return;
    }

    if (!phone.trim()) {
      Alert.alert(t('reservation.notice'), t('reservation.form.phoneRequired'));
      return;
    }
    if (!title.trim()) {
      Alert.alert(t('reservation.notice'), t('reservation.form.titleRequired'));
      return;
    }
    if (!desc.trim()) {
      Alert.alert(
        t('reservation.notice'),
        t('reservation.form.descriptionRequired'),
      );
      return;
    }
    if (selectedEquipments.length === 0) {
      Alert.alert(
        t('reservation.notice'),
        t('reservation.equipment.selectRequired'),
      );
      return;
    }

    // 0분 예약 방지. 안드로이드 시각 피커는 minimumDate를 무시하므로 여기서도 확인한다
    if (endTime.getTime() - startTime.getTime() < MIN_RESERVATION_DURATION_MS) {
      Alert.alert(t('reservation.notice'), t('reservation.form.minDuration'));
      return;
    }

    // 예약된 장비가 선택되었는지 확인
    const hasReservedEquipment = selectedEquipments.some(equipment =>
      reservedEquipments.includes(equipment.uuid),
    );

    if (hasReservedEquipment) {
      Alert.alert(
        t('reservation.notice'),
        t('reservation.equipment.alreadyReserved'),
      );
      return;
    }

    // 예약 정보 확인 팝업
    Alert.alert(
      '',
      [
        t('reservation.form.confirmEquipment', {
          names: selectedEquipments
            .map(e => getLocalizedField(e, 'name', getCurrentLocale()))
            .join(', '),
        }),
        t('reservation.form.confirmDate', {date: formatDate(date)}),
        t('reservation.form.confirmTime', {
          start: formatTime(startTime),
          end: formatTime(endTime),
        }),
        '',
        t('reservation.form.confirmQuestion'),
      ].join('\n'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('reservation.confirmReserve'),
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
                startTime: startTimeStr,
                endTime: endTimeStr,
              });

              Alert.alert(
                t('common.success'),
                t('reservation.equipment.created'),
                [
                  {
                    text: t('common.confirm'),
                    onPress: () => navigation.goBack(),
                  },
                ],
              );
            } catch (error) {
              console.error('예약 생성 실패:', error);
              Alert.alert(
                t('common.error'),
                t('reservation.equipment.createFailed'),
              );
            }
          },
        },
      ],
    );
  };

  // 버튼 비활성화 조건: 필수값/장비 누락 또는 과거 날짜
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
    !phone.trim() ||
    !title.trim() ||
    !desc.trim() ||
    selectedEquipments.length === 0 ||
    isPastSelectedDate;

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
            {removeEmoji(getLocalizedField(item, 'name', getCurrentLocale()))}
          </Text>
          {selected && <Text style={styles.checkIcon}>✔</Text>}
          {isReserved && !selected && (
            <Text style={[styles.reservedText, {color: subTextColor}]}>
              {t('reservation.equipment.reserved')}
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
      t,
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
          <Text style={[styles.backButtonText, {color: textColor}]}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>
          {t('reservation.equipment.applyTitle', {
            owner: t(
              association === 'dormunion'
                ? 'reservation.equipment.owners.dormunion'
                : 'reservation.equipment.owners.dongyeon',
            ),
          })}
        </Text>
        <View style={styles.placeholderButton} />
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        bottomOffset={association === 'dormunion' ? 180 : 200}>
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
            {t('reservation.equipment.noticeTitle')}
          </Text>
          {association === 'dormunion' ? (
            <View style={styles.noticeContent}>
              <Text style={[styles.noticeText, {color: textColor}]}>
                {t('reservation.equipment.dormunionPickup')}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                {t('reservation.equipment.penalty')}
              </Text>
            </View>
          ) : (
            <View style={styles.noticeContent}>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>
                  {t('reservation.equipment.dongyeon.process')}
                </Text>{' '}
                {t('reservation.equipment.dongyeon.processSteps')}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>
                  {t('reservation.equipment.dongyeon.bankLabel')}
                </Text>{' '}
                {getSettingValue(dongyeonBank, settingFallback)}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                {t('reservation.equipment.dongyeon.bankNameHint')}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                {t('reservation.equipment.dongyeon.afterPayment')}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>
                  {t('reservation.equipment.dongyeon.kakaoLinkLabel')}
                </Text>{' '}
                <Text style={styles.noticeLink} onPress={openClubUnionChannel}>
                  {t('reservation.equipment.dongyeon.kakaoChannel')}
                </Text>
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>
                  {t('reservation.equipment.dongyeon.example')}
                </Text>
                {'\n'}
                {t('reservation.equipment.dongyeon.exampleBody')}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>
                  {t('reservation.equipment.dongyeon.serviceHours')}
                </Text>{' '}
                {getSettingValue(dongyeonServiceTime, settingFallback)}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                {t('reservation.equipment.dongyeon.serviceHoursHint')}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>
                  {t('reservation.equipment.dongyeon.pickupLabel')}
                </Text>{' '}
                {t('reservation.equipment.dongyeon.pickupLocation')}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                {t('reservation.equipment.dongyeon.liability')}
              </Text>
              <Text style={[styles.noticeText, {color: textColor}]}>
                <Text style={styles.noticeBold}>
                  {t('reservation.equipment.dongyeon.contact')}
                </Text>{' '}
                {getSettingValue(dongyeonContact, settingFallback)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, {color: textColor}]}>
            {t('reservation.form.user')}{' '}
            <Text style={styles.requiredText}>*</Text>
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
                placeholder={t('reservation.form.namePlaceholder')}
                placeholderTextColor={subTextColor}
              />
            )}
          </View>
          <Text style={[styles.label, {color: textColor}]}>
            {t('reservation.form.phone')}{' '}
            <Text style={styles.requiredText}>*</Text>
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
            {t('reservation.form.title')}{' '}
            <Text style={styles.requiredText}>*</Text>
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
            placeholder={t('reservation.form.titlePlaceholder')}
            placeholderTextColor={subTextColor}
            maxLength={50}
          />
          <Text style={[styles.charCount, {color: subTextColor}]}>
            {title.length}/50
          </Text>
          <Text style={[styles.label, {color: textColor}]}>
            {t('reservation.form.description')}{' '}
            <Text style={styles.requiredText}>*</Text>
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
            placeholder={t('reservation.equipment.descPlaceholder')}
            placeholderTextColor={subTextColor}
            multiline
            maxLength={200}
          />
          <Text style={[styles.charCount, {color: subTextColor}]}>
            {desc.length}/200
          </Text>
          <Text style={[styles.label, {color: textColor}]}>
            {t('reservation.equipment.select')}{' '}
            <Text style={styles.requiredText}>*</Text>
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
                    {getLocalizedField(equip, 'name', getCurrentLocale())}
                  </Text>
                  <TouchableOpacity onPress={() => toggleEquipment(equip)}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={[styles.placeholderText, {color: subTextColor}]}>
                {t('reservation.equipment.selectPlaceholder')}
              </Text>
            )}
          </TouchableOpacity>

          {/* 날짜/시간 선택 */}
          <View style={styles.dateTimePickerContainer}>
            <View style={styles.datePickerWrapper}>
              <Text
                style={[styles.label, styles.pickerLabel, {color: textColor}]}>
                {t('reservation.form.date')}{' '}
                <Text style={styles.requiredText}>*</Text>
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
                {t('reservation.form.startTime')}{' '}
                <Text style={styles.requiredText}>*</Text>
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
                  {formatTime(startTime)}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timePickerWrapper}>
              <Text
                style={[styles.label, styles.pickerLabel, {color: textColor}]}>
                {t('reservation.form.endTime')}{' '}
                <Text style={styles.requiredText}>*</Text>
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
                  {formatTime(endTime)}
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
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale={getCurrentLocale()}
            confirmTextIOS={t('common.confirm')}
            cancelTextIOS={t('common.cancel')}
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
                  t('reservation.notice'),
                  t('reservation.form.startAfterNow'),
                );
              }
            }}
            onCancel={() => setShowStartPicker(false)}
            is24Hour
            minuteInterval={30}
            date={startTime}
            minimumDate={minimumDate}
            confirmTextIOS={t('common.confirm')}
            cancelTextIOS={t('common.cancel')}
          />
        )}
        {showEndPicker && (
          <DateTimePickerModal
            isVisible={showEndPicker}
            mode="time"
            onConfirm={time => {
              setShowEndPicker(false);
              const rounded = roundUpToNearest30Minutes(time);
              if (rounded < earliestEndTime) {
                Alert.alert(
                  t('reservation.notice'),
                  t('reservation.form.endAfterStart'),
                );
                return;
              }
              setEndTime(rounded);
            }}
            onCancel={() => setShowEndPicker(false)}
            is24Hour
            minuteInterval={30}
            date={endTime}
            minimumDate={earliestEndTime}
            confirmTextIOS={t('common.confirm')}
            cancelTextIOS={t('common.cancel')}
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
                  {t('reservation.equipment.totalFee')}
                </Text>
                <Text style={styles.totalPriceValue}>
                  {t('reservation.equipment.fee', {
                    fee: totalPrice.toLocaleString(),
                  })}
                </Text>
              </View>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.reservationButton,
              {
                backgroundColor: disabledCreate
                  ? '#666' // 다크/라이트 섞여도 무난한 중립색
                  : '#222',
              },
            ]}
            onPress={handleReservation}
            disabled={disabledCreate}
            accessibilityState={{disabled: disabledCreate}}
            activeOpacity={disabledCreate ? 1 : 0.85}>
            {/* TODO: 장소 예약이랑 색깔 및 단어 통일 */}
            <Text style={styles.reservationButtonText}>
              {t('reservation.equipment.create')}
            </Text>
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
                {t('reservation.equipment.select')}
              </Text>
              <TouchableOpacity
                style={styles.popupCompleteButton}
                onPress={() => setShowEquipmentModal(false)}>
                <Text style={styles.popupCompleteText}>
                  {t('common.confirm')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 팝업 바디 */}
            <View style={styles.popupBody}>
              {/* 장비 개수 표시 */}
              <Text style={[styles.popupInfoText, {color: textColor}]}>
                {t('reservation.equipment.available', {
                  count: equipmentList.length,
                })}
              </Text>

              {/* 로딩 상태 표시 */}
              {loadingReservations && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={subTextColor} />
                  <Text style={[styles.loadingText, {color: subTextColor}]}>
                    {t('reservation.equipment.checking')}
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
  noticeLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
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
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default EquipmentReservationApplyScreen;
