import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import moment from 'moment';

import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import {
  getPaxiDistanceInfo,
  getPaxiDurationInfo,
  PAXI_LOCATIONS,
} from '@utils/locations';
import CommonHeader from '@components/CommonHeader';
import DropdownMenu from '@components/room/DropdownMenu';

type CreatePaxiRoomScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'CreatePaxiRoomScreen'
  >;
};

interface NewRoomBody {
  title: string;
  description: string;
  departureTime: string;
  departureLocation: string;
  destinationLocation: string;
  maxParticipant: number;
}

// 10분 단위로 올림
function roundUpToNearest10Minutes(date: Date) {
  const ms = 1000 * 60 * 10;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

const CreatePaxiRoomScreen = ({navigation}: CreatePaxiRoomScreenProps) => {
  const [roomName, setRoomName] = useState('');
  const [roomDetails, setRoomDetails] = useState('');
  const [departureName, setDepartureName] = useState('');
  const [arrivalName, setArrivalName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [selectedDateTime, setSelectedDateTime] = useState(
    roundUpToNearest10Minutes(new Date()),
  );
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const isDarkMode = useColorScheme() === 'dark';

  // ---- Palette & tokens ----
  const C = {
    bg: isDarkMode ? '#0E0F10' : '#FFFFFF',
    card: isDarkMode ? '#161718' : '#F7F7F8',
    text: isDarkMode ? '#EDEDED' : '#101113',
    textSub: isDarkMode ? '#A7A7AD' : '#6B6F76',
    border: isDarkMode ? '#2A2C2F' : '#E5E7EB',
    borderStrong: isDarkMode ? '#3A3D41' : '#D1D5DB',
    inputText: isDarkMode ? '#D0D0D3' : '#1F2328',
    placeholder: isDarkMode ? '#5B6066' : '#B7BBC2',
    accent: '#FB5353',
    dotRed: '#FF5757',
    dotBlack: isDarkMode ? '#FFFFFF' : '#111111',
    press: isDarkMode ? '#1C1E22' : '#EFEFF1',
    disabled: isDarkMode ? '#2A2C2F' : '#ECEDEF',
  };

  async function createNewRoom() {
    const body: NewRoomBody = {
      title: roomName,
      description: roomDetails,
      destinationLocation: arrivalName,
      maxParticipant: maxParticipants,
      departureTime: selectedDateTime.toISOString(),
      departureLocation: departureName,
    };
    paxi_api
      .post('room', body)
      .then(res => {
        if (res.status === 201) {
          Alert.alert('성공', '방을 성공적으로 생성했습니다.', [
            {
              text: '확인',
              onPress: () => {
                navigation.navigate('NewChat', {
                  roomUuid: res.data.uuid as string,
                  from: 'roomList',
                });
              },
            },
          ]);
        }
      })
      .catch(error => {
        const message = error?.response?.data?.message ?? '알 수 없는 오류';
        Alert.alert('실패', `방을 생성하는데 실패했습니다:\n${message}`);
      });
  }

  const handleDateConfirm = (date: Date) => {
    const combined = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      selectedDateTime.getHours(),
      selectedDateTime.getMinutes(),
      selectedDateTime.getSeconds(),
    );

    const now = new Date();

    if (combined.getTime() < now.getTime()) {
      Alert.alert('오류', '현재 이후의 시각만 선택할 수 있습니다.');
      setSelectedDateTime(roundUpToNearest10Minutes(now));
    } else {
      setSelectedDateTime(combined);
    }

    setDatePickerVisible(false);
  };

  const handleTimeConfirm = (time: Date) => {
    const combined = new Date(
      selectedDateTime.getFullYear(),
      selectedDateTime.getMonth(),
      selectedDateTime.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
    );

    const now = new Date();

    if (combined.getTime() < now.getTime()) {
      Alert.alert('오류', '현재 이후의 시각만 선택할 수 있습니다.');
      setSelectedDateTime(roundUpToNearest10Minutes(now));
    } else {
      setSelectedDateTime(combined);
    }

    setTimePickerVisible(false);
  };

  const isToday = (date: Date) =>
    new Date().toDateString() === date.toDateString();

  const checkInputValid = () => {
    if (!roomName || !departureName || !arrivalName) {
      Alert.alert('오류', '모든 필수 필드를 입력해주세요.');
      return;
    } else if (roomName.length < 2 || roomName.length > 20) {
      Alert.alert('오류', '방 제목은 2자 이상 20자 이하로 입력해주세요.');
      return;
    } else if (departureName.length < 2 || departureName.length > 20) {
      Alert.alert('오류', '출발지는 2자 이상 20자 이하로 입력해주세요.');
      return;
    } else if (arrivalName.length < 2 || arrivalName.length > 20) {
      Alert.alert('오류', '도착지는 2자 이상 20자 이하로 입력해주세요.');
      return;
    } else if (roomDetails.length > 100) {
      Alert.alert('오류', '상세내용은 100자 이하로 입력해주세요.');
      return;
    } else {
      createNewRoom();
    }
  };

  const inputBase = {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    color: C.inputText,
    borderColor: C.border,
    backgroundColor: isDarkMode ? '#121315' : '#FFFFFF',
  } as const;

  const disabledCreate =
    !roomName || !departureName || !arrivalName || !selectedDateTime;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: C.bg}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />
      <CommonHeader navigation={navigation} title="방 생성하기" />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={[styles.container, {paddingHorizontal: 16}]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          {/* 방 제목 */}
          <View>
            <Text style={[styles.label, {color: C.text}]}>방 제목</Text>
            <TextInput
              style={[inputBase, {height: 45}]}
              placeholder="제목을 입력해주세요"
              placeholderTextColor={C.placeholder}
              value={roomName}
              onChangeText={setRoomName}
              accessibilityLabel="방 제목 입력"
              returnKeyType="done"
            />
          </View>

          {/* 위치 */}
          <View>
            <Text style={[styles.label, {color: C.text}]}>위치</Text>

            <View
              style={[
                styles.card,
                {borderColor: C.border, backgroundColor: C.card},
              ]}>
              <View style={styles.row}>
                <View style={[styles.dot, {backgroundColor: C.dotBlack}]} />
                <DropdownMenu
                  placeholderText={'어디서 출발하시나요?'}
                  options={PAXI_LOCATIONS.filter(
                    item => item.id !== arrivalName,
                  )}
                  onSelect={selected => setDepartureName(selected ?? '출발지')}
                  selected={departureName}
                />
              </View>

              <View style={[styles.divider, {backgroundColor: C.border}]} />

              <View style={styles.row}>
                <View style={[styles.dot, {backgroundColor: C.dotRed}]} />
                <DropdownMenu
                  placeholderText={'어디로 떠나시나요?'}
                  options={PAXI_LOCATIONS.filter(
                    item => item.id !== departureName,
                  )}
                  onSelect={selected => setArrivalName(selected ?? '도착지')}
                  selected={arrivalName}
                />
              </View>
            </View>

            {departureName && arrivalName ? (
              <View
                style={[
                  styles.infoChip,
                  {
                    backgroundColor: isDarkMode ? '#1B1C1F' : '#F4F5F6',
                    borderColor: C.border,
                  },
                ]}>
                <Text style={{color: C.text, fontSize: 13, fontWeight: '600'}}>
                  거리 {getPaxiDistanceInfo(departureName, arrivalName)} · 예상{' '}
                  {getPaxiDurationInfo(departureName, arrivalName)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* 날짜/시간 */}
          <View style={{flexDirection: 'row', gap: 12}}>
            <View style={{flex: 1}}>
              <Text style={[styles.label, {color: C.text}]}>날짜</Text>
              <TouchableOpacity
                style={[
                  styles.selector,
                  {
                    borderColor: isDatePickerVisible ? C.accent : C.border,
                    backgroundColor: isDarkMode ? '#121315' : '#FFFFFF',
                  },
                ]}
                onPress={() => setDatePickerVisible(true)}
                activeOpacity={0.7}>
                <Text style={{color: C.text, fontSize: 16, fontWeight: '600'}}>
                  {moment(selectedDateTime).format('YYYY.MM.DD')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{flex: 1}}>
              <Text style={[styles.label, {color: C.text}]}>출발 시각</Text>
              <TouchableOpacity
                style={[
                  styles.selector,
                  {
                    borderColor: isTimePickerVisible ? C.accent : C.border,
                    backgroundColor: isDarkMode ? '#121315' : '#FFFFFF',
                  },
                ]}
                onPress={() => setTimePickerVisible(true)}
                activeOpacity={0.7}>
                <Text style={{color: C.text, fontSize: 16, fontWeight: '600'}}>
                  {selectedDateTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={selectedDateTime}
            onConfirm={handleDateConfirm}
            onCancel={() => setDatePickerVisible(false)}
            minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
            maximumDate={
              new Date(new Date().setDate(new Date().getDate() + 30))
            }
            locale="ko-KR"
            confirmTextIOS="확인"
            cancelTextIOS="취소"
          />

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            date={selectedDateTime}
            onConfirm={handleTimeConfirm}
            onCancel={() => setTimePickerVisible(false)}
            is24Hour={true}
            confirmTextIOS="확인"
            cancelTextIOS="취소"
            minimumDate={roundUpToNearest10Minutes(
              isToday(selectedDateTime)
                ? new Date()
                : new Date(
                    selectedDateTime.getFullYear(),
                    selectedDateTime.getMonth(),
                    selectedDateTime.getDate(),
                    0,
                    0,
                    0,
                    0,
                  ),
            )}
            minuteInterval={10}
          />

          {/* 상세내용 */}
          <View>
            <Text style={[styles.label, {color: C.text}]}>
              상세내용{' '}
              <Text style={{color: C.textSub, fontSize: 12}}>(선택)</Text>
            </Text>
            <TextInput
              style={[inputBase, {height: 112}]}
              multiline
              placeholder="세부사항을 입력해주세요"
              placeholderTextColor={C.placeholder}
              value={roomDetails}
              onChangeText={setRoomDetails}
              textAlignVertical="top"
            />
            <Text style={{color: C.textSub, fontSize: 12, marginTop: 6}}>
              최대 100자
            </Text>
          </View>

          {/* 최대 인원 */}
          <View>
            <Text style={[styles.label, {color: C.text}]}>최대 인원</Text>
            <View
              style={[
                styles.counter,
                {
                  borderColor: C.border,
                  backgroundColor: C.card,
                },
              ]}>
              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  {opacity: maxParticipants === 2 ? 0.35 : 1},
                ]}
                disabled={maxParticipants === 2}
                onPress={() =>
                  setMaxParticipants(Math.max(2, maxParticipants - 1))
                }
                activeOpacity={0.6}>
                <Text style={[styles.counterSign, {color: C.text}]}>−</Text>
              </TouchableOpacity>

              <Text style={[styles.counterValue, {color: C.text}]}>
                {maxParticipants}
              </Text>

              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  {opacity: maxParticipants === 4 ? 0.35 : 1},
                ]}
                disabled={maxParticipants === 4}
                onPress={() =>
                  setMaxParticipants(Math.min(4, maxParticipants + 1))
                }
                activeOpacity={0.6}>
                <Text style={[styles.counterSign, {color: C.text}]}>＋</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 생성 버튼 */}
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              backgroundColor: disabledCreate ? C.disabled : C.accent,
              opacity: disabledCreate ? 0.7 : 1,
            },
          ]}
          onPress={checkInputValid}
          disabled={disabledCreate}
          activeOpacity={0.85}>
          <Text style={styles.createButtonText}>방 생성하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePaxiRoomScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 24,
  },
  formSection: {
    gap: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    height: 48,
    width: '100%',
    gap: 10,
  },
  divider: {
    height: 1,
    marginLeft: '3%',
    width: '94%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  infoChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  selector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    minHeight: 40,
  },
  createButton: {
    borderRadius: 12,
    width: '100%',
    marginTop: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    height: 48,
    minWidth: 172,
    borderRadius: 24,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
  },
  counterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  counterSign: {
    fontSize: 22,
    fontWeight: '700',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '800',
    minWidth: 40,
    textAlign: 'center',
  },
});
