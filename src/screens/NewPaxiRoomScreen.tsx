import React, {useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import paxi_api from '../utils/paxi_api';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownMenu from '../components/DropdownMenu';

type NewPaxiRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewPaxiRoom'>;
};

interface NewRoomBody {
  title: string;
  description: string;
  departureTime: string;
  departureLocation: string;
  destinationLocation: string;
  maxParticipant: number;
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

  async function createNewRoom() {
    const body: NewRoomBody = {
      title: roomName,
      description: roomDetails,
      destinationLocation: arrivalName,
      maxParticipant: 4,
      departureTime: selectedDateTime.toISOString(),
      departureLocation: departureName,
    };
    paxi_api
      .post('room', body)
      .then(res => {
        if (res.status === 201) {
          Alert.alert('성공', '방을 성공적으로 생성했습니다.');
          navigation.goBack();
        }
      })
      .catch(error => {
        // const status = error.response.status;
        const message = error.response.data.message;
        Alert.alert('실패', `방을 생성하는데 실패했습니다:\n${message}`);
      });
  }

  const onDatePicked = (event: any, selectedDate?: Date) => {
    selectedDate = selectedDate || new Date();
    setSelectedDateTime(
      prev =>
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          prev.getHours(),
          prev.getMinutes(),
          prev.getSeconds(),
        ),
    );
    setShowDatePicker(false);
  };

  const onTimePicked = (event: any, selectedTime?: Date) => {
    selectedTime = selectedTime || new Date();
    setSelectedDateTime(
      prev =>
        new Date(
          prev.getFullYear(),
          prev.getMonth(),
          prev.getDate(),
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          selectedTime.getSeconds(),
        ),
    );
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
      createNewRoom();
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
      backgroundColor: isDarkMode ? '#2C2C2C' : '#F3F3F3',
    },
  ];

  const locations = [
    {name: '지곡회관'},
    {name: '학생회관'},
    {name: '체인지업그라운드'},
    {name: '포항역'},
    {name: '터미널'},
  ];

  const TextInputStyle = [
    {
      color: isDarkMode ? '#888888' : '#AAA',
      backgroundColor: isDarkMode ? '#2C2C2C' : '#F3F3F3',
      borderColor: borderColor,
    },
  ];

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

      <ScrollView contentContainerStyle={{padding: 20}}>
        <View style={styles.formSection}>
          <View>
            <Text style={[styles.label, {color: textColor}]}>방 제목</Text>
            <TextInput
              style={[styles.roomInput, TextInputStyle]}
              placeholder="제목을 입력해주세요."
              placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
              value={roomName}
              onChangeText={setRoomName}
            />
          </View>

          <View style={{marginBottom: 8}}>
            <Text style={[styles.label, {color: textColor}]}>위치</Text>
            <View style={[styles.inputWrapper, TextInputStyle]}>
              <View style={styles.inputWithDot}>
                <View style={styles.dotBlack} />

                <DropdownMenu
                  style={[{width: 300}, dropdownStyle]}
                  textStyle={{color: isDarkMode ? '#555' : '#d0d0d0'}}
                  textSelectedStyle={{color: isDarkMode ? 'white' : 'black'}}
                  defaultText={'어디서 출발하시나요?'}
                  categories={locations}
                  onSelect={selected => setDepartureName(selected ?? '출발지')}
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
                  style={[{width: 300}, dropdownStyle]}
                  textStyle={{color: isDarkMode ? '#555' : '#d0d0d0'}}
                  textSelectedStyle={{color: isDarkMode ? 'white' : 'black'}}
                  defaultText={'어디로 떠나시나요?'}
                  categories={locations}
                  onSelect={selected => setArrivalName(selected ?? '도착지')}
                />
              </View>
            </View>
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
                  borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                  borderRadius: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
                onPress={() => setShowDatePicker(true)}>
                <Text style={{color: textColor}}>
                  {selectedDateTime.toLocaleDateString()}
                </Text>
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
              <Text style={[styles.titleText, {color: textColor}]}>
                출발시각
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                  borderRadius: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
                onPress={() => setShowTimePicker(true)}>
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
                color: isDarkMode ? '#888888' : '#AAA',
                backgroundColor: isDarkMode ? '#2C2C2C' : '#F3F3F3',
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
          />

          <Text style={[styles.label, {color: textColor}]}>최대 인원</Text>
          <View
            style={{
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                borderRadius: 50,
                marginBottom: 10,
                backgroundColor: isDarkMode ? '#232323' : '#F3F3F3',
              }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
                onPress={() =>
                  setMaxParticipants(Math.max(1, maxParticipants - 1))
                }>
                <Text
                  style={{
                    color: isDarkMode ? '#fff' : '#222',
                    fontSize: 20,
                  }}>
                  -
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: isDarkMode ? '#fff' : '#222',
                  fontSize: 20,
                  fontWeight: 'bold',
                  minWidth: 32,
                  textAlign: 'center',
                }}>
                {maxParticipants}
              </Text>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
                onPress={() =>
                  setMaxParticipants(Math.min(4, maxParticipants + 1))
                }>
                <Text
                  style={{
                    color: isDarkMode ? '#fff' : '#222',
                    fontSize: 20,
                  }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: isDarkMode ? '#FB5353' : '#fff',
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
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 8,
  },
  formSection: {
    marginTop: 0,
    gap: 8,
  },
  roomInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  container: {
    alignItems: 'center',
    paddingRight: '5%',
    paddingLeft: '5%',
    paddingTop: '5%',
    marginBottom: 0,
  },
  inputWrapper: {
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
  dotBlack: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'black',
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
