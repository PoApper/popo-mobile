import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '@navigation/types';
import PoPoAxios from '../../utils/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {format} from 'date-fns';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

interface IEquipment {
  uuid: string;
  name: string;
  description: string;
  fee: number;
  image_url?: string;
  max_minutes: number;
}

type EquipmentReservationApplyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EquipmentReservationApply'
>;
type EquipmentReservationApplyScreenRouteProp = RouteProp<
  RootStackParamList,
  'EquipmentReservationApply'
>;

type Props = {
  navigation: EquipmentReservationApplyScreenNavigationProp;
  route: EquipmentReservationApplyScreenRouteProp;
};

const EquipmentReservationApplyScreen = ({navigation, route}: Props) => {
  const {association} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const [title, setTitle] = useState('');
  const [selectedEquipments, setSelectedEquipments] = useState<IEquipment[]>(
    [],
  );
  const [equipmentList, setEquipmentList] = useState<IEquipment[]>([]);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loadingEquipments, setLoadingEquipments] = useState(false);

  const viewBackgroundColor = isDarkMode ? '#1A1A1A' : '#F9FAFB';
  const textColor = isDarkMode ? '#fff' : '#000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const labelColor = isDarkMode ? '#FFFFFF' : '#000000';
  const inputBackgroundColor = isDarkMode ? '#1A1A1A' : '#F9FAFB';

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoadingEquipments(true);
        const res = await PoPoAxios.get<IEquipment[]>(
          `equip/owner/${association}`,
        );
        const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
        setEquipmentList(sorted);
      } catch (e) {
        setEquipmentList([]);
      } finally {
        setLoadingEquipments(false);
      }
    };
    fetchEquipment();
  }, [association]);

  const toggleEquipment = (equipment: IEquipment) => {
    setSelectedEquipments(prev => {
      const isSelected = prev.find(e => e.uuid === equipment.uuid);
      if (isSelected) {
        return prev.filter(e => e.uuid !== equipment.uuid);
      } else {
        return [...prev, equipment];
      }
    });
  };

  const totalFee = selectedEquipments.reduce(
    (acc, equipment) => acc + equipment.fee,
    0,
  );

  const handleSubmit = async () => {
    if (!title || selectedEquipments.length === 0) {
      Alert.alert('알림', '필수 항목을 모두 입력해주세요.');
      return;
    }
    setLoading(true);

    const reservationData = {
      title: title,
      description: '',
      equip_uuids: selectedEquipments.map(e => e.uuid),
      booker_name: '', // Updated based on actual user data if available
      phone_number: '', // Updated based on actual user data if available
      date: format(date, 'yyyyMMdd'),
      start_time: format(startTime, 'HHmm'),
      end_time: format(endTime, 'HHmm'),
      status: 'waiting',
      owner: association,
    };

    try {
      await PoPoAxios.post('/reservation-equip', reservationData);
      Alert.alert('성공', '예약 신청이 완료되었습니다.');
      navigation.goBack();
    } catch (error) {
      console.error('Reservation failed:', error);
      Alert.alert('오류', '예약 신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const roundUpToNearest30Minutes = (time: Date) => {
    const minutes = time.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    const newTime = new Date(time);
    newTime.setMinutes(roundedMinutes);
    newTime.setSeconds(0);
    newTime.setMilliseconds(0);
    return newTime;
  };

  const isTimeAfterNow = (checkDate: Date, checkTime: Date) => {
    const now = new Date();
    const selectedDateTime = new Date(checkDate);
    selectedDateTime.setHours(checkTime.getHours(), checkTime.getMinutes());
    return selectedDateTime > now;
  };

  const handleToggleEquipment = (equipment: IEquipment) => {
    toggleEquipment(equipment);
  };

  const handleDateConfirm = (confirmedDate: Date) => {
    setDate(confirmedDate);
    setShowDatePicker(false);
  };

  const handleStartTimeConfirm = (time: Date) => {
    const roundedTime = roundUpToNearest30Minutes(time);
    if (isTimeAfterNow(date, roundedTime)) {
      setStartTime(roundedTime);
      const newEndTime = new Date(roundedTime);
      newEndTime.setMinutes(newEndTime.getMinutes() + 30);
      setEndTime(newEndTime);
    } else {
      Alert.alert('알림', '현재 시간보다 이후의 시간을 선택해주세요.');
    }
    setShowStartPicker(false);
  };

  const handleEndTimeConfirm = (time: Date) => {
    const roundedTime = roundUpToNearest30Minutes(time);
    setEndTime(roundedTime);
    setShowEndPicker(false);
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safeArea, {backgroundColor: viewBackgroundColor}]}>
      <StatusBar
        barStyle={isDarkMode ? 'dark-content' : 'dark-content'}
        backgroundColor={viewBackgroundColor}
      />
      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, {color: textColor}]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>장비 예약</Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleSubmit}
          disabled={loading}>
          <Text
            style={[
              styles.applyButtonText,
              {color: loading ? '#888' : '#FB5353'},
            ]}>
            신청
          </Text>
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView
        style={[styles.container, {backgroundColor: viewBackgroundColor}]}
        resetScrollToCoords={{x: 0, y: 0}}
        scrollEnabled={true}>
        <View style={styles.contentContainer}>
          <View style={styles.introContainer}>
            <Text style={[styles.introTitle, {color: textColor}]}>
              어떤 목적으로 장비를 사용하시나요?
            </Text>
            <Text style={styles.requiredText}>* 필수</Text>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, {color: labelColor}]}>
                사용 목적
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: textColor,
                    backgroundColor: inputBackgroundColor,
                    borderColor: borderColor,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="예: 밴드부 합주"
                placeholderTextColor={isDarkMode ? '#888888' : '#AAA'}
              />
            </View>
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              어떤 장비를 예약하시겠어요?
            </Text>
            <Text style={styles.requiredText}>* 필수</Text>
            <View
              style={[
                styles.equipmentSelectContainer,
                {backgroundColor: inputBackgroundColor},
              ]}>
              <TouchableOpacity
                style={styles.equipmentSelectButton}
                onPress={() => setModalVisible(true)}>
                <Text style={styles.equipmentSelectPlaceholder}>
                  여기를 눌러 장비를 선택하세요
                </Text>
                <Text style={styles.equipmentSelectIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.selectedEquipmentsContainer}>
              {selectedEquipments.map(equip => (
                <View key={equip.uuid} style={styles.selectedEquipment}>
                  <Text style={styles.selectedEquipmentText}>{equip.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleToggleEquipment(equip)}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            {selectedEquipments.length > 0 && (
              <Text style={[styles.totalFeeText, {color: textColor}]}>
                총 금액: {totalFee.toLocaleString()}원
              </Text>
            )}
          </View>
          <View style={styles.dateTimeSection}>
            <View style={styles.dateTimeRow}>
              <View style={styles.datePickerContainer}>
                <Text
                  style={[
                    styles.datePickerLabel,
                    {color: showDatePicker ? '#FB5353' : labelColor},
                  ]}>
                  날짜 *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerInput,
                    {
                      backgroundColor: inputBackgroundColor,
                      borderColor: showDatePicker ? '#FB5353' : borderColor,
                    },
                  ]}
                  onPress={() => {
                    setShowDatePicker(true);
                  }}>
                  <Text style={[styles.datePickerText, {color: textColor}]}>
                    {format(date, 'yyyy-MM-dd')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timePickerContainer}>
                <Text
                  style={[
                    styles.datePickerLabel,
                    {color: showStartPicker ? '#FB5353' : labelColor},
                  ]}>
                  시작시간 *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerInput,
                    {
                      backgroundColor: inputBackgroundColor,
                      borderColor: showStartPicker ? '#FB5353' : borderColor,
                    },
                  ]}
                  onPress={() => setShowStartPicker(true)}>
                  <Text style={[styles.datePickerText, {color: textColor}]}>
                    {format(startTime, 'HH:mm')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timePickerContainer}>
                <Text
                  style={[
                    styles.datePickerLabel,
                    {color: showEndPicker ? '#FB5353' : labelColor},
                  ]}>
                  종료시간 *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerInput,
                    {
                      backgroundColor: inputBackgroundColor,
                      borderColor: showEndPicker ? '#FB5353' : borderColor,
                    },
                  ]}
                  onPress={() => setShowEndPicker(true)}>
                  <Text style={[styles.datePickerText, {color: textColor}]}>
                    {format(endTime, 'HH:mm')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        date={date}
        locale="ko_KR"
        confirmTextIOS="확인"
        cancelTextIOS="취소"
        title="날짜를 선택하세요"
        textColor={textColor}
      />
      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="time"
        onConfirm={handleStartTimeConfirm}
        onCancel={() => setShowStartPicker(false)}
        date={startTime}
        locale="ko_KR"
        minuteInterval={10}
        confirmTextIOS="확인"
        cancelTextIOS="취소"
        title="시작 시간을 선택하세요"
        textColor={textColor}
      />
      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="time"
        onConfirm={handleEndTimeConfirm}
        onCancel={() => setShowEndPicker(false)}
        date={endTime}
        locale="ko_KR"
        minuteInterval={10}
        confirmTextIOS="확인"
        cancelTextIOS="취소"
        title="종료 시간을 선택하세요"
        textColor={textColor}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              {backgroundColor: isDarkMode ? '#121212' : '#fff'},
            ]}>
            <FlatList
              data={equipmentList}
              keyExtractor={item => item.uuid}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>
                  {loadingEquipments ? '불러오는 중...' : '장비가 없습니다.'}
                </Text>
              }
              renderItem={({item}) => {
                const isSelected = selectedEquipments.some(
                  e => e.uuid === item.uuid,
                );
                return (
                  <TouchableOpacity
                    style={[
                      styles.equipmentItem,
                      {
                        backgroundColor: isSelected ? '#F3F4F6' : '#fff',
                        opacity: isSelected ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => handleToggleEquipment(item)}
                    disabled={isSelected}>
                    <Text style={styles.equipmentName}>{item.name}</Text>
                    <Text style={styles.equipmentFee}>
                      {item.fee.toLocaleString()}원
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={styles.equipmentList}
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  applyButton: {
    padding: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
  },
  introContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  requiredText: {
    color: '#FB5353',
    fontSize: 14,
  },
  inputContainer: {
    marginTop: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  equipmentSelectContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  equipmentSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  equipmentSelectPlaceholder: {
    fontSize: 16,
    color: '#6B7280',
  },
  equipmentSelectIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  selectedEquipmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  selectedEquipment: {
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
  totalFeeText: {
    fontSize: 16,
    paddingLeft: 4,
    lineHeight: 24,
    marginTop: 4,
  },
  dateTimeSection: {
    marginTop: 24,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  datePickerContainer: {
    flex: 1.5,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 13,
  },
  datePickerInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  datePickerText: {
    textAlign: 'center',
    fontSize: 16,
  },
  timePickerContainer: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  equipmentList: {
    maxHeight: 220,
    marginTop: 4,
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
  equipmentName: {
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
  equipmentFee: {
    color: '#FB5353',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeModalButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#FB5353',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  closeModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EquipmentReservationApplyScreen;
