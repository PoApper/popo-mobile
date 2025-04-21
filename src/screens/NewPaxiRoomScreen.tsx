import React, {useState, useMemo, useCallback} from 'react';
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
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

LocaleConfig.locales.kr = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
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
    const authToken = await EncryptedStorage.getItem('auth_token');
    if (!authToken) return;

    const response = await axios.post('https://api.paxi-dev.popo.poapper.club/room', 
      {
        "description": roomData.description,
        "title": roomData.title,
        "departureTime": new Date(roomData.departureTime + 'T00:00:00Z').toISOString(),
        "departureLocation": roomData.departureLocation,
        "destinationLocation": roomData.destinationLocation,
        "maxParticipant": roomData.maxParticipant,
      },
      {
        headers: {
          'Cookie': `Authentication=${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.status;
  } catch (error: string | any) {
    console.error('Error:', error);
  }
}

const NewPaxiRoomScreen = ({ navigation }: NewPaxiRoomScreenProps) => {
  const [roomName, setRoomName] = useState("");
  const [roomDetails, setRoomDetails] = useState("");
  const [departureName, setDepartureName] = useState("");
  const [arrivalName, setArrivalName] = useState("");

  const [selected, setSelected] = useState(
    new Date().toISOString().split('T')[0],
  );
  const marked = useMemo(
    () => ({
      [selected]: {
        selected: true,
        selectedColor: '#FB5353',
        selectedTextColor: 'white',
      },
    }),
    [selected],
  );

  const onDayPress = useCallback((day: any) => {
    setSelected(day.dateString);
  }, []);

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
        departureTime: selected,
        departureLocation: departureName,
      }).then((result) => {
        if (result == 201) {
          Alert.alert('성공', '방을 성공적으로 생성했습니다.');
          navigation.goBack();
        } else {
          Alert.alert('실패', 'response: ' + result?.toString());
        }
      })
      .catch((error) => {
        Alert.alert('실패', '방을 생성하는데 실패했습니다: ' + error.message);
      });
    }
  }

  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
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
                <View style={styles.dotBlack} />
                <TextInput
                  style={{
                    width: '90%',
                    color: textColor,
                  }}
                  placeholder="어디서 출발하시나요?"
                  placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
                  value={departureName}
                  onChangeText={setDepartureName}
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
              </View>
            </View>
          </View>

          <View style={{width: '100%', marginBottom: 0, paddingBottom: 0}}>
            <Text
              style={[styles.titleText, {marginBottom: 0, color: textColor}]}>
              일정 선택
            </Text>
          </View>
        </View>

        <View
          style={{
            marginHorizontal: 16,
            marginVertical: 8,
            borderWidth: 1,
            borderRadius: 6,
            borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
            backgroundColor: isDarkMode ? '#1A1A1A' : '#fff',
            overflow: 'hidden',
            height: 370,
          }}>
          <Calendar
            current={selected}
            onDayPress={onDayPress}
            markedDates={marked}
            hideExtraDays={true}
            firstDay={0}
            monthFormat={'yyyy년 MM월'}
            theme={{
              calendarBackground: isDarkMode ? '#1A1A1A' : '#fff',
              textSectionTitleColor: isDarkMode ? '#FFFFFF' : '#000000',
              selectedDayBackgroundColor: '#FB5353',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#FB5353',
              dayTextColor: isDarkMode ? '#FFFFFF' : '#000000',
              textDisabledColor: isDarkMode ? '#555' : '#d0d0d0',
              monthTextColor: isDarkMode ? '#FFFFFF' : '#000000',
              textMonthFontSize: 16,
              textDayFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
            style={{
              height: 370,
            }}
          />
        </View>

        <View style={styles.container}>
          <Text style={[styles.titleText, {color: textColor}]}>상세내용</Text>
          <TextInput
            style={[
              styles.roomInput,
              {
                borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                color: textColor,
              },
            ]}
            placeholder="세부사항을 입력해주세요."
            placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
            value={roomDetails}
            onChangeText={setRoomDetails}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: 'black',
            },
          ]}
          onPress={() => checkInputValid()}
          disabled={!roomName || !departureName || !arrivalName}
        >
          <Text style={styles.nextButtonText}>방 생성하기</Text>
        </TouchableOpacity>
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
    width: '90%',
    marginLeft: '5%',
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
  dotBlack: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'black',
    marginRight: 10,
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginRight: 10,
  },
});
