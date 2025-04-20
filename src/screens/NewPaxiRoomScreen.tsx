import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ScrollView,
} from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NewPaxiRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewPaxiRoom'>;
};

const RANGE = 24;
const initialDate = '2025-03-31';
const nextWeekDate = '2022-07-14';

const NewPaxiRoomScreen = ({ navigation }: NewPaxiRoomScreenProps) => {
  const horizontalView = navigation;
  const [roomName, setRoomName] = useState("");
  const [roomDetails, setRoomDetails] = useState("");
  const [departureName, setDepartureName] = useState("");
  const [arrivalName, setArrivalName] = useState("");

  const [selected, setSelected] = useState(initialDate);
  const marked = useMemo(() => {
    return {
      [nextWeekDate]: {
        selected: selected === nextWeekDate,
        selectedTextColor: '#FB5353',
        marked: true
      },
      [selected]: {
        selected: true,
        disableTouchEvent: true,
        selectedColor: '#FB5353',
        selectedTextColor: 'white'
      }
    };
  }, [selected]);

  const onDayPress = useCallback((day: DateData) => {
    setSelected(day.dateString);
  }, []);

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
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: textColor }]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>방 생성하기</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView>
        <View style={styles.container}>
          <View style={{ width: '100%', marginBottom: 8 }}>
            <Text style={[styles.titleText, { color: textColor }]}>방 제목</Text>
            <TextInput
            style={[
              styles.roomInput,
              {
                marginBottom: 10,
                borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                color: textColor
              }
            ]}
            placeholder="제목을 입력해주세요."
            placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
              value={roomName}
              onChangeText={setRoomName}
            />
          </View>

          <View style={{ width: '100%', marginBottom: 8 }}>
            <Text style={[styles.titleText, { color: textColor }]}>위치 지정</Text>
            <View style={[
              styles.inputWrapper,
              {
                marginBottom: 10,
                borderColor: isDarkMode ? '#2C2C2C' : '#d0d0d0',
                backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'
              }
            ]}>
              <View style={styles.inputWithDot}>
                <View style={styles.dotBlack} />
                <TextInput
                  style={{
                    width: '90%',
                    color: textColor
                  }}
                  placeholder="어디서 출발하시나요?"
                  placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
                  value={departureName}
                  onChangeText={setDepartureName}
                />
              </View>
              <View style={[styles.separator, { backgroundColor: isDarkMode ? '#2C2C2C' : '#d0d0d0' }]} />
              <View style={styles.inputWithDot}>
                <View style={styles.dotRed} />
                <TextInput
                  style={{
                    width: '90%',
                    color: textColor
                  }}
                  placeholder="어디로 떠나시나요?"
                  placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
                  value={arrivalName}
                  onChangeText={setArrivalName}
                />
              </View>
            </View>
          </View>

          <View style={{ width: '100%', marginBottom: 0, paddingBottom: 0 }}>
            <Text style={[styles.titleText, { marginBottom: 0, color: textColor }]}>일정 선택</Text>
          </View>
        </View>

        <CalendarList
          current={initialDate}
          pastScrollRange={RANGE}
          futureScrollRange={RANGE}
          onDayPress={onDayPress}
          markedDates={marked}
          renderHeader={renderCustomHeader}
          calendarHeight={320}  // 수평 레이아웃에 맞게 달력 높이 설정
          theme={{
            ...calendarTheme,
            calendarBackground: isDarkMode ? '#1A1A1A' : '#fff',
            todayTextColor: textColor,
            monthTextColor: textColor,
            dayTextColor: textColor,
            textDisabledColor: isDarkMode ? '#555' : '#d0d0d0',
            selectedDayBackgroundColor: '#FB5353',
            selectedDayTextColor: '#FFFFFF',
          }}
          horizontal={true}
          pagingEnabled={true}
          style={{
            marginTop: 0,
            paddingTop: 0,
            paddingBottom: 8,
            transform: [{ scale: 0.9 }],
            borderStyle: "solid",
            borderWidth: 1,
            borderRadius: 6,
            borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
            backgroundColor: isDarkMode ? '#1A1A1A' : '#fff',
          }}
        />

        <View style={styles.container}>
          <Text style={[styles.titleText, { color: textColor }]}>상세내용</Text>
          <TextInput
            style={[
              styles.roomInput,
              {
                borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                color: textColor
              }
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
            { backgroundColor: isDarkMode ? '#FFFFFF' : '#0B0B0B' }
          ]}
          onPress={() => {}}
        >
          <Text style={[
            styles.nextButtonText,
            { color: isDarkMode ? '#0B0B0B' : '#ffffff' }
          ]}>방 등록하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const calendarTheme = {
  'stylesheet.calendar.main': {
    container: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    week: {
      marginTop: 0,
      marginBottom: 5,
      flexDirection: 'row',
    },
    day: {
      width: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  textDayFontSize: 18,
  textDayHeaderFontSize: 16,
};

// custom header를 "Month"와 "Year"만 나오도록 수정
function renderCustomHeader(date: any) {
  const header = date.toString('MMMM yyyy');
  const [month, year] = header.split(' ');
  const textStyle: TextStyle = {
    fontSize: 22,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 10,
    color: '#4a5660'
  };

  return (
    <View style={styles.header}>
      <Text style={[textStyle]}>{month}  {year}</Text>
    </View>
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
    fontWeight: "700",
    color: "#000",
    textAlign: 'left',
    width: '100%',
    marginBottom: 10,
  },
  nextButton: {
    borderRadius: 6,
    backgroundColor: '#0B0B0B',
    width: '90%',
    marginLeft: '5%',
    marginTop: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Pretendard",
    color: "#ffffff",
    textAlign: "center"
  },
  roomInput: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#D0D0D0",
    width: "100%",
    backgroundColor: '#FFFFFF',
    height: 42,
    paddingHorizontal: 16,
    fontSize: 13,
    textAlignVertical: 'center'
  },
  container: {
    alignItems: 'center',
    paddingRight: '5%',
    paddingLeft: '5%',
    paddingTop: '5%',
    marginBottom: 0
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
