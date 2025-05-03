import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import paxi_api from '../utils/paxi_api';
import CalendarKoreanLocales from '../utils/calendar-locales';
import DateTimePicker from '@react-native-community/datetimepicker';
import EditableTextInput from '../components/AlertableTextInput';
import DropdownFilter from '../components/DropdownFilter';
import DropdownMenu from '../components/DropdownMenu';

LocaleConfig.locales.kr = CalendarKoreanLocales;
LocaleConfig.defaultLocale = 'kr';

type NewPaxiRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewPaxiRoom'>;
};

interface NewRoomData {
  title: string;
  description: string;
  departureTime: string;
  departureLocation: string;
  destinationLocation: string;
  maxParticipant: number;
}

async function createNewRoom(roomData: NewRoomData) {
  try {
    const res = await paxi_api.post('/room', roomData);
    return res.status;
  } catch (error: string | any) {
    console.error('Error:', error);
  }
}

const NewPaxiRoomScreen = ({navigation}: NewPaxiRoomScreenProps) => {
  const [roomName, setRoomName] = useState('');
  const [roomDetails, setRoomDetails] = useState('');
  const [departureName, setDepartureName] = useState('');
  const [arrivalName, setArrivalName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDatePicked = (event: any, selectedDate?: Date) => {
    selectedDate = selectedDate || new Date();
    setSelectedDateTime(prev => new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      prev.getHours(),
      prev.getMinutes(),
      prev.getSeconds()
    ));
    setShowDatePicker(false);
  };
  
  const onTimePicked = (event: any, selectedTime?: Date) => {
    selectedTime = selectedTime || new Date();
    setSelectedDateTime(prev => new Date(
      prev.getFullYear(),
      prev.getMonth(),
      prev.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      selectedTime.getSeconds()
    ));
    setShowTimePicker(false);
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
      createNewRoom({
        title: roomName,
        description: roomDetails,
        destinationLocation: arrivalName,
        maxParticipant: 4,
        departureTime: selectedDateTime.toISOString(),
        departureLocation: departureName,
      })
        .then(result => {
          if (result == 201) {
            Alert.alert('성공', '방을 성공적으로 생성했습니다.');
            navigation.goBack();
          } else {
            Alert.alert('실패', 'response: ' + result?.toString());
          }
        })
        .catch(error => {
          Alert.alert('실패', '방을 생성하는데 실패했습니다: ' + error.message);
        });
    }
  };

  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const dropdownStyle = [
    {
      borderColor: isDarkMode ? '#2C2C2C' : '#f4f4f6',
      backgroundColor: isDarkMode ? '#1A1A1A' : 'white',
    },
  ]

  const locations = [
    { name: '지곡회관' },
    { name: '학생회관' },
    { name: '체인지업그라운드' },
    { name: '포항역' },
    { name: '터미널' },
    { name: '테스트1' },
    { name: '테스트2' },
    { name: '테스트3' },
    { name: '테스트4' },
    { name: '테스트5' },
    { name: '테스트6' },
  ]

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
          방 생성하기
        </Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView>
        <View style={styles.container}>
          <View style={{width: '100%', marginBottom: 8}}>
            <Text style={[styles.titleText, {color: textColor}]}>방 제목</Text>
            <TextInput
              style={[
                styles.roomInput,
                {
                  marginBottom: 10,
                  borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                  color: textColor,
                },
              ]}
              placeholder="제목을 입력해주세요."
              placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
              value={roomName}
              onChangeText={setRoomName}
            />
          </View>

          <View style={{width: '100%', marginBottom: 8}}>
            <Text style={[styles.titleText, {color: textColor}]}>
              위치 지정
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  marginBottom: 10,
                  borderColor: isDarkMode ? '#2C2C2C' : '#d0d0d0',
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#fff',
                },
              ]}>
              <View style={styles.inputWithDot}>
                <View style={styles.dotWhite} />

                <DropdownMenu
                  style={[{width: 300}, dropdownStyle]}
                  textStyle={{color: isDarkMode ? '#555' : '#d0d0d0'}}
                  textSelectedStyle={{color: isDarkMode ? 'white' : 'black'}}
                  defaultText='어디서 출발하시나요?'
                  categories={locations}
                  onSelect={(selected) => setDepartureName(selected ?? "출발지")}
                />

                {/*
                <EditableTextInput
                  placeholder="어디서 출발하시나요?"
                  placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
                  style={{width: '90%'}}
                  inputStyle={{color: textColor}}
                  value={departureName}
                  onChangeText={setDepartureName}
                />
                */}
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
                  style={[{width: 300}, dropdownStyle]}
                  textStyle={{color: isDarkMode ? '#555' : '#d0d0d0'}}
                  textSelectedStyle={{color: isDarkMode ? 'white' : 'black'}}
                  defaultText='어디로 떠나시나요?'
                  categories={locations}
                  onSelect={(selected) => setArrivalName(selected ?? "도착지")}
                />
                {/*
                <TextInput
                  style={{
                    width: '90%',
                    color: textColor,
                  }}
                  placeholder="어디로 떠나시나요?"
                  placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
                  value={arrivalName}
                  onChangeText={setArrivalName}
                />
                */}
              </View>
            </View>
          </View>

          <View style={{
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
                  borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                  borderRadius: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{color: textColor}}>{selectedDateTime.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDateTime}
                  mode="date"
                  display="default"
                  onChange={onDatePicked}
                />
              )}
            </View>
            <View style={{width: '48%'}}>
              <Text style={[styles.titleText, {color: textColor}]}>출발시각</Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                  borderRadius: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{color: textColor}}>
                  {selectedDateTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedDateTime}
                  mode="time"
                  display="default"
                  onChange={onTimePicked}
                />
              )}
            </View>
          </View>

          <Text style={[styles.titleText, {color: textColor}]}>상세내용</Text>
          <TextInput
            style={[
              styles.roomInput,
              {
                borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                color: textColor,
                height: 200,
                textAlignVertical: 'top',
                marginBottom: 12
              },
            ]}
            multiline={true}
            placeholder="세부사항을 입력해주세요."
            placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
            value={roomDetails}
            onChangeText={setRoomDetails}
          />

          <Text style={[styles.titleText, {color: textColor}]}>최대인원</Text>
          <View style={{
            alignItems: 'flex-start',
            width: '100%'
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
              borderRadius: 50,
              marginBottom: 10,
            }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
                onPress={() => setMaxParticipants(Math.max(1, maxParticipants - 1))}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 20,
                }}>-</Text>
              </TouchableOpacity>
              <Text style={{
                  color: 'white',
                  fontSize: 20,
              }}>{maxParticipants}</Text>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
                onPress={() => setMaxParticipants(Math.min(4, maxParticipants + 1))}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 20,
                }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: 'black',
              },
            ]}
            onPress={() => checkInputValid()}
            disabled={!roomName || !departureName || !arrivalName}>
            <Text style={styles.nextButtonText}>방 생성하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NewPaxiRoomScreen;

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
    flex: 1,
    textAlign: 'center',
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
    width: '100%',
    marginBottom: 10,
  },
  nextButton: {
    borderRadius: 6,
    backgroundColor: '#FB5353',
    width: '100%',
    marginTop: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#ffffff',
    textAlign: 'center',
  },
  roomInput: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#D0D0D0',
    width: '100%',
    backgroundColor: '#FFFFFF',
    height: 42,
    paddingHorizontal: 16,
    fontSize: 13,
    textAlignVertical: 'center',
  },
  container: {
    alignItems: 'center',
    paddingRight: '5%',
    paddingLeft: '5%',
    paddingTop: '5%',
    marginBottom: 0,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#fff',
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
  },
  separator: {
    height: 1,
    marginLeft: '2.5%',
    width: '95%',
    backgroundColor: '#d0d0d0',
  },
  dotWhite: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'white',
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
});
