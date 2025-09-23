import React, {useEffect, useState, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import moment from 'moment';

import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import {
  PAXI_LOCATIONS,
  getPaxiDistanceInfo,
  getPaxiDurationInfo,
} from '@utils/locations';
import CommonHeader from '@components/CommonHeader';
import DropdownMenu from '@components/room/DropdownMenu';
import {RouteProp, useRoute} from '@react-navigation/native';

type ModifyPaxiRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ModifyPaxiRoom'>;
};

interface ModifyRoomBody {
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

type SettlementScreenRouteProp = RouteProp<
  RootStackParamList,
  'ModifyPaxiRoom'
>;

const ModifyPaxiRoomScreen = ({navigation}: ModifyPaxiRoomScreenProps) => {
  const route = useRoute<SettlementScreenRouteProp>();
  const {roomUuid} = route.params;

  const [roomName, setRoomName] = useState('');
  const [roomDetails, setRoomDetails] = useState('');
  const [departureName, setDepartureName] = useState('');
  const [arrivalName, setArrivalName] = useState('');
  const [maxParticipant, setMaxParticipant] = useState(4);
  const [selectedDateTime, setSelectedDateTime] = useState(
    roundUpToNearest10Minutes(new Date()),
  );
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  // 날짜 범위 계산 (컴포넌트 마운트 시 1회)
  const {minimumDate, maximumDate} = useMemo(() => {
    const today = new Date();
    const minDate = new Date(today.setHours(0, 0, 0, 0));
    const maxDate = new Date(today.setDate(today.getDate() + 30));
    return {minimumDate: minDate, maximumDate: maxDate};
  }, []);

  useEffect(() => {
    paxi_api
      .get(`/room/${roomUuid}`)
      .then(res => {
        const roomInfo = res.data;
        setRoomName(roomInfo.title);
        setRoomDetails(roomInfo.description);
        setDepartureName(roomInfo.departureLocation);
        setArrivalName(roomInfo.destinationLocation);
        setSelectedDateTime(
          roundUpToNearest10Minutes(new Date(roomInfo.departureTime)),
        );
        setMaxParticipant(roomInfo.maxParticipant);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  async function modifyRoom() {
    const body: ModifyRoomBody = {
      title: roomName,
      description: roomDetails,
      destinationLocation: arrivalName,
      maxParticipant: maxParticipant,
      departureTime: selectedDateTime.toISOString(),
      departureLocation: departureName,
    };
    paxi_api
      .patch(`room/${roomUuid}`, body)
      .then(res => {
        if (res.status === 200) {
          Alert.alert(
            '성공',
            '성공적으로 방의 정보를 변경했습니다.',
            [
              {
                text: '확인',
                onPress: () => navigation.goBack(),
              },
            ],
            {cancelable: false},
          );
        }
      })
      .catch(error => {
        // const status = error.response.status;
        const message = error.response.data.message;
        Alert.alert('실패', `방의 정보를 변경하는데 실패했습니다:\n${message}`);
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

  // 커스텀 입력인지 확인하는 함수
  const isCustomLocation = (location: string) => {
    return !PAXI_LOCATIONS.some(loc => loc.id === location);
  };

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
      modifyRoom();
    }
  };

  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

  const TextInputStyle = [
    {
      color: isDarkMode ? '#888888' : '#AAA',
      borderColor: borderColor,
    },
  ];

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: isDarkMode ? '#121212' : '#fff'}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#121212' : '#fff'}
      />
      <CommonHeader navigation={navigation} title="방 수정하기" />
      <KeyboardAwareScrollView
        style={{flex: 1, paddingHorizontal: 10}}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={180}>
        <View style={styles.formSection}>
          <View>
            <Text style={[styles.label, {color: textColor}]}>방 제목</Text>
            <TextInput
              style={[styles.roomInput, TextInputStyle]}
              placeholder="제목을 입력해주세요."
              placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
              value={roomName}
              onChangeText={setRoomName}
              maxLength={20}
            />
            <Text
              style={[
                styles.charCount,
                {color: isDarkMode ? '#555' : '#d0d0d0'},
              ]}>
              {roomName.length}/20
            </Text>
          </View>

          <View style={{marginBottom: 8}}>
            <Text style={[styles.label, {color: textColor}]}>위치</Text>
            <View style={[styles.inputWrapper, TextInputStyle]}>
              <View style={styles.inputWithDot}>
                <View
                  style={[
                    styles.dotBlack,
                    {backgroundColor: isDarkMode ? 'white' : 'black'},
                  ]}
                />

                <DropdownMenu
                  placeholderText={'어디서 출발하시나요?'}
                  options={PAXI_LOCATIONS.filter(
                    item => item.id !== arrivalName,
                  )}
                  onSelect={selected => setDepartureName(selected ?? '출발지')}
                  selected={departureName}
                  onCustomModeChange={() => {}}
                />
              </View>
              <View
                style={[
                  styles.separator,
                  {backgroundColor: isDarkMode ? '#2C2C2C' : '#d0d0d0'},
                ]}
              />
              <View style={styles.inputWithDot}>
                <View style={styles.dotRed} />

                <DropdownMenu
                  placeholderText={'어디로 떠나시나요?'}
                  options={PAXI_LOCATIONS.filter(
                    item => item.id !== departureName,
                  )}
                  onSelect={selected => setArrivalName(selected ?? '도착지')}
                  selected={arrivalName}
                  onCustomModeChange={() => {}}
                />
              </View>
            </View>
            {departureName &&
            arrivalName &&
            !isCustomLocation(departureName) &&
            !isCustomLocation(arrivalName) ? (
              <View
                style={{
                  backgroundColor: isDarkMode ? '#232323' : '#F0F0F0',
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 8,
                  marginBottom: 8,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 13,
                      fontWeight: '500',
                      marginRight: 4,
                    }}>
                    거리: {getPaxiDistanceInfo(departureName, arrivalName)} |
                    예상 소요시간:{' '}
                    {getPaxiDurationInfo(departureName, arrivalName)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              marginBottom: 12,
            }}>
            <View style={{width: '48%'}}>
              <Text style={[styles.titleText, {color: textColor}]}>날짜</Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: isDatePickerVisible
                    ? '#FB5353'
                    : isDarkMode
                    ? '#2C2C2C'
                    : '#D0D0D0',
                  borderRadius: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
                onPress={() => setDatePickerVisible(true)}>
                <Text style={{color: textColor}}>
                  {moment(selectedDateTime).format('YYYY년 MM월 DD일')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{width: '48%'}}>
              <Text style={[styles.titleText, {color: textColor}]}>
                출발시각
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: isTimePickerVisible
                    ? '#FB5353'
                    : isDarkMode
                    ? '#2C2C2C'
                    : '#D0D0D0',
                  borderRadius: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
                onPress={() => setTimePickerVisible(true)}>
                <Text style={{color: textColor}}>
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
            minimumDate={minimumDate}
            maximumDate={maximumDate}
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

          <Text
            style={[
              styles.titleText,
              {color: textColor, flexDirection: 'row', alignItems: 'center'},
            ]}>
            상세내용{' '}
            <Text style={{color: textColor, fontSize: 12, opacity: 0.5}}>
              (선택)
            </Text>
          </Text>
          <TextInput
            style={[
              styles.roomInput,
              {
                color: isDarkMode ? '#888888' : '#AAA',
                borderColor: borderColor,
              },
              {
                height: 100,
              },
            ]}
            multiline={true}
            placeholder="세부사항을 입력해주세요."
            placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
            value={roomDetails}
            onChangeText={setRoomDetails}
            maxLength={100}
          />
          <Text
            style={[
              styles.charCount,
              {color: isDarkMode ? '#555' : '#d0d0d0'},
            ]}>
            {roomDetails.length}/100
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton]}
          onPress={() => checkInputValid()}
          disabled={
            !roomName || !departureName || !arrivalName || !selectedDateTime
          }>
          <Text style={styles.createButtonText}>수정하기</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ModifyPaxiRoomScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 5,
  },
  placeholderButton: {
    width: 40,
  },
  backgroundStyle: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  titleText: {
    fontSize: 15,
    letterSpacing: -0.5,
    fontWeight: '700',
    color: '#000',
    textAlign: 'left',
    marginBottom: 10,
  },
  createButton: {
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
    width: '100%',
    marginTop: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#ffffff',
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 8,
  },
  formSection: {
    gap: 10,
    width: '100%',
  },
  roomInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  inputWrapper: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    overflow: 'hidden',
  },
  inputWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    height: 42,
    width: '100%',
  },
  separator: {
    height: 1,
    marginLeft: '2.5%',
    width: '95%',
    backgroundColor: '#d0d0d0',
  },
  dotBlack: {
    width: 5,
    height: 5,
    borderRadius: 4,
    marginLeft: 5,
    marginRight: 10,
  },
  dotRed: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'red',
    marginLeft: 5,
    marginRight: 10,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});
