import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TextStyle,
  TouchableOpacity
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

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <Text
        style={{
          fontSize: 25,
          letterSpacing: -0.7,
          fontWeight: "600",
          fontFamily: "Pretendard",
          textAlign: 'center',
          color: '#3E3E40',
          marginTop: 5,
          marginBottom: 10,
        }}
      >방 생성하기</Text>

      <View style={styles.separator} />

      <View
        style={styles.container}
      >
        <Text style={styles.titleText}>방 제목</Text>
        <TextInput
          style={[styles.roomInput, { marginBottom: 10 }]}
          placeholder="제목을 입력해주세요."
          placeholderTextColor='#d0d0d0'
          value={roomName}
          onChangeText={setRoomName}
        />

        <View
          style={{
            width: '100%',
          }}
        >
          <Text style={styles.titleText}>위치 지정</Text>
          <View style={[styles.inputWrapper, { marginBottom: 10 }]}>
            <View style={styles.inputWithDot}>
              <View style={styles.dotBlack} />
              <TextInput
                style={{
                  width: '90%',
                }}
                placeholder="어디서 출발하시나요?"
                placeholderTextColor="#d0d0d0"
                value={departureName}
                onChangeText={setDepartureName}
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.inputWithDot}>
              <View style={styles.dotRed} />
              <TextInput
                style={{
                  width: '90%',
                }}
                placeholder="어디로 떠나시나요?"
                placeholderTextColor="#d0d0d0"
                value={arrivalName}
                onChangeText={setArrivalName}
              />
            </View>
          </View>
        </View>

        <View
          style={{
            width: '100%',
            marginBottom: 0,
            paddingBottom: 0,
          }}
        >
          <Text style={[styles.titleText, {marginBottom: 0}]}>일정 선택</Text>
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
        theme={calendarTheme}
        horizontal={true}
        pagingEnabled={true}
        style={{
          marginTop: 0,
          paddingTop: 0,
          transform: [{ scale: 0.9 }],
          borderStyle: "solid",
          borderWidth: 1,
          borderRadius: 6,
          borderColor: "#D0D0D0",
        }}
      />
      
      <View
        style={styles.container}
      >
        <Text style={styles.titleText}>상세내용</Text>
        <TextInput
          style={[styles.roomInput]}
          placeholder="세부사항을 입력해주세요."
          placeholderTextColor='#d0d0d0'
          value={roomDetails}
          onChangeText={setRoomDetails}
        />
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {}}
      >
        <Text style={styles.nextButtonText}>방 등록하기</Text>
      </TouchableOpacity>
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
  backgroundStyle: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
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
