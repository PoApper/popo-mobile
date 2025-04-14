import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';


type PaxiRoomListScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Paxi'>;
};

interface RoomContainerProps {
  title: string;
  departureTime: string;
  remain: number;
  total: number;
  departure: string;
  destination: string;
}

const RoomContainer: React.FC<RoomContainerProps> = ({ title, departureTime, remain, total, departure, destination }) => {
  return (
    <View style={styles.roomContainer}>
      <View style={{
        marginTop: 7,
        marginLeft: 7,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
      }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={remain < total ? styles.possible : styles.impossible}>{remain < total ? "참여 가능" : "마감"}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detailsText}>{departure}</Text>
        <Text style={{fontSize: 25,}}>{"  - - - - >  "}</Text>
        <Text style={styles.detailsText}>{destination}</Text>
      </View>
      <Text style={styles.departureTime}>{departureTime}</Text>
    </View>
  );
};

const RefreshButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F4F6',
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{
        fontSize: 30,
        lineHeight: 30,
        fontWeight: "bold",
        textAlign: 'center',
        color: "black",
        includeFontPadding: false,
      }}>↺</Text>
    </TouchableOpacity>
  );
};


const PaxiRoomListScreen = ({ navigation }: PaxiRoomListScreenProps) => {
  const [isChecked, setIsChecked] = useState(false);

  const clicking = () => {}

  const roomData = [
    {
      title: '포항역 카풀',
      departureTime: '3월 14일 오전 7시 출발',
      remain: 2,
      total: 4,
      departure: '포항역',
      destination: '지곡회관',
    },
    {
      title: '서울역 카풀',
      departureTime: '3월 15일 오후 5시 출발',
      remain: 1,
      total: 3,
      departure: '서울역',
      destination: '강남역',
    },
    {
      title: '포항역 카풀',
      departureTime: '3월 14일 오전 7시 출발',
      remain: 2,
      total: 4,
      departure: '포항역',
      destination: '지곡회관',
    },
    {
      title: '포항역 카풀',
      departureTime: '3월 14일 오전 7시 출발',
      remain: 2,
      total: 4,
      departure: '포항역',
      destination: '지곡회관',
    },
    {
      title: '포항역 카풀',
      departureTime: '3월 14일 오전 7시 출발',
      remain: 2,
      total: 4,
      departure: '포항역',
      destination: '지곡회관',
    },
  ];

  return (
    <SafeAreaView style={[styles.backgroundStyle]}>
      <Text style={{
        margin: 20,
        marginLeft: 30,
        fontSize: 30,
        fontWeight: "bold",
        fontFamily: "Pretendard",
        color: 'black'
      }}>Paxi</Text>

      <View style={[styles.conditionNavigator]}>
        <RefreshButton
          onPress={() => {}} />

        <TouchableOpacity
          style={[styles.button]}
          onPress={clicking}
        >
          <Text>출발지</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={clicking}
        >
          <Text>도착지</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={clicking}
        >
          <Text>날짜</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={clicking}
        >
          <Text>시간</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setIsChecked(!isChecked)}
      >
        <View style={[
          styles.checkbox,
          isChecked && styles.checked
        ]}>
          {isChecked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={{fontSize: 15}}>빈 방만 보기</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{padding: 8}}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 16 }}>
          {roomData.length > 0 ? (
            roomData.map((room, index) => (
              <RoomContainer
                key={index}
                title={room.title}
                departureTime={room.departureTime}
                remain={room.remain}
                total={room.total}
                departure={room.departure}
                destination={room.destination}
              />
            ))
          ) : (
            <Text style={{ fontSize: 16, textAlign: 'center' }}>
              현재 등록된 카풀이 없습니다.
            </Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('NewPaxiRoom')}>
        <Text style={{ color: 'white', fontSize: 35, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PaxiRoomListScreen;

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: 'black',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 100,
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: '#f4f4f6',
    backgroundColor: 'white',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "flex-start",
    paddingLeft: 20,
    paddingRight: 20,
  },
  conditionNavigator: {
    paddingLeft: 15,
    flexDirection: "row",
    gap: 5
  },
  roomContainer: {
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 7,
    elevation: 7,
    shadowOpacity: 2,
    borderRadius: 15,
    backgroundColor: "#fff",
    padding: 5,
    marginTop: 10,
    paddingBottom: 20,
    marginLeft: "5%",
    width: "90%",
    height: "auto",
    flexDirection: "column",
  },
  title: {
    fontSize: 14,
    letterSpacing: -0.4,
    fontWeight: "500",
    fontFamily: "Pretendard",
    color: "#9b9b9b",
    textAlign: "left",
    lineHeight: 20,
  },
  possible: {
    fontSize: 13,
    letterSpacing: -0.1,
    fontWeight: "700",
    fontFamily: "Pretendard",
    color: "#fb5353",
    borderRadius: 3,
    backgroundColor: "#fff3f3",
    textAlign: "center",
    paddingLeft: 5,
    paddingRight: 5,
    lineHeight: 20,
  },
  impossible: {
    fontSize: 13,
    letterSpacing: -0.1,
    fontWeight: "700",
    fontFamily: "Pretendard",
    color: "#909090",
    borderRadius: 3,
    backgroundColor: "rgba(217, 217, 217, 0.83)",
    textAlign: "center",
    paddingLeft: 5,
    paddingRight: 5,
    lineHeight: 20,
  },
  departureTime: {
    fontSize: 14,
    textAlign: "center",
    letterSpacing: -0.4,
    fontWeight: "500",
    fontFamily: "Pretendard",
    color: "#4f4f4f",
  },
  details: {
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "row",
  },
  detailsText: {
    fontSize: 20,
    color: "#333",
    alignSelf: 'flex-start',
  },
  checkboxContainer: {
    flexDirection: 'row',
    margin: "5%",
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checked: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
  },
});

