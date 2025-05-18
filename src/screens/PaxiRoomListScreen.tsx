import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainTabParamList} from '../navigation/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import paxi_api from '../utils/paxi_api';
import DropdownFilter from '../components/DropdownFilter';

type PaxiRoomListScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Paxi'>;
};

interface RoomContainerProps {
  uuid: string;
  title: string;
  departureTime: string;
  remain: number;
  total: number;
  departure: string;
  destination: string;
}

const RoomContainer: React.FC<RoomContainerProps> = ({
  uuid,
  title,
  departureTime,
  remain,
  total,
  departure,
  destination,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const backgroundColor = isDarkMode ? '#1A1A1A' : '#fff';
  const subTextColor = isDarkMode ? '#888' : '#666';

  const askJoinRoom = () => {
    Alert.alert('참여하기', '방에 참여하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: () => {
          console.log('방 참여 요청:', uuid);
          paxi_api.post(`/room/join/${uuid}`).then((response) => {
            console.log('response.data:', response.data);
            console.log('response.status', response.status);
            if (response.status === 201) {
              Alert.alert('성공', '방에 참여했습니다.');
            } else {
              Alert.alert('실패', '방 참여에 실패했습니다.');
            }
          }).catch((error) => {
            console.error('Error:', error);
            Alert.alert('실패', '방 참여에 실패했습니다: ' + error.message);
          });
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.roomContainer, {backgroundColor}]}
      onPress={() => askJoinRoom()}>
      <View style={styles.cardContent}>
        <View style={styles.mainInfo}>
          <View style={styles.titleContainer}>
            <Text style={remain < total ? styles.possible : styles.impossible}>
              {remain < total ? '참여 가능' : '마감'}
            </Text>
            <Text style={[styles.title, {color: textColor}]}>{title}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsText, {color: textColor}]}>
              {departure}
            </Text>
            <Text style={[styles.arrow, {color: textColor}]}>
              {'  - - - - >  '}
            </Text>
            <Text style={[styles.detailsText, {color: textColor}]}>
              {destination}
            </Text>
          </View>
          <Text style={[styles.departureTime, {color: subTextColor}]}>
            {departureTime}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RefreshButton = ({onPress}: {onPress: () => void}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <TouchableOpacity
      style={[
        styles.refreshButton,
        {
          backgroundColor: isDarkMode ? '#2C2C2C' : '#F4F4F6',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Icon
        name="refresh"
        size={24}
        color={isDarkMode ? '#FFFFFF' : '#000000'}
      />
    </TouchableOpacity>
  );
};

interface RoomDataType {
  uuid: string;
  title: string;
  ownerUuid: string;
  departureLocation: string;
  destinationLocation: string;
  maxParticipant: number;
  currentParticipant: number;
  departureTime: string;
  status: string;
  description: string;
  payerUuid: string;
  payAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface ParsedRoomDataType {
  uuid: string;
  title: string;
  departureTime: string;
  remain: number;
  total: number;
  departure: string;
  destination: string;
}

const PaxiRoomListScreen = ({navigation}: PaxiRoomListScreenProps) => {
  const [isChecked, setIsChecked] = useState(false);  

  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const [roomData, setRoomData] = useState<ParsedRoomDataType[]>([]);

  const getUserDataAndRequest = useCallback(async () => {
    try {
      const response = await paxi_api.get('/room');
      const parsedData = parseRoomData(response.data);
      setRoomData(parsedData);
    } catch (error: string | any) {
      console.error('Error:', error);
      Alert.alert('실패', '방을 불러오는데 실패했습니다: ' + error.message);
    }
  }, []); // 여기에 들어가는 의존성도 필요하면 추가

  useEffect(() => {
    getUserDataAndRequest();
  }, [getUserDataAndRequest]);

  const refreshRoomData = () => getUserDataAndRequest();

  const filterDeparture = (selected: string | null) => {
    console.log('selected', selected)
  }

  const parseRoomData = (items: RoomDataType[]) =>
    items.map((item: RoomDataType) => ({
      uuid: item.uuid,
      title: item.title,
      departureTime: new Date(item.departureTime).toLocaleString('ko-KR', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }),
      remain: item.maxParticipant - item.currentParticipant,
      total: item.maxParticipant,
      departure: item.departureLocation,
      destination: item.destinationLocation,
    }));

  const dropdownStyle = [
    styles.button,
    {
      borderColor: isDarkMode ? '#2C2C2C' : '#f4f4f6',
      backgroundColor: isDarkMode ? '#1A1A1A' : 'white',
    },
  ]

  return (
    <SafeAreaView style={[backgroundStyle]}>
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
        <Text style={[styles.headerTitle, {color: textColor}]}>Paxi</Text>
        <View style={styles.placeholderButton} />
      </View>

      <View style={[styles.conditionNavigator]}>
        <RefreshButton onPress={() => refreshRoomData()} />

        <DropdownFilter
          style={dropdownStyle}
          textStyle={{color: 'white'}}
          textSelectedStyle={{color: 'white'}}
          defaultText={'출발지'}
          categories={[
            { id: 'fruit', name: '과일' },
            { id: 'fruit2', name: '과일' },
          ]}
          onSelect={(selected) => filterDeparture(selected)}
        />

        <DropdownFilter
          style={dropdownStyle}
          textStyle={{color: 'white'}}
          defaultText={'도착지'}
          categories={[
            { id: 'fruit', name: '과일' },
          ]}
          onSelect={(selected) => console.log('선택된 카테고리:', selected)}
        />

        <DropdownFilter
          style={dropdownStyle}
          textStyle={{color: 'white'}}
          defaultText={'날짜'}
          categories={[
            { id: 'fruit', name: '과일' },
          ]}
          onSelect={(selected) => console.log('선택된 카테고리:', selected)}
        />

        <DropdownFilter
          style={dropdownStyle}
          textStyle={{color: 'white'}}
          defaultText={'시간'}
          categories={[
            { id: 'fruit', name: '과일' },
          ]}
          onSelect={(selected) => console.log('선택된 카테고리:', selected)}
        />
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setIsChecked(!isChecked)}>
        <View
          style={[
            styles.checkbox,
            {borderColor: isDarkMode ? '#555' : '#D0D0D0'},
            isChecked && {
              backgroundColor: isDarkMode ? '#FFFFFF' : 'black',
              borderColor: isDarkMode ? '#FFFFFF' : 'black',
            },
          ]}>
          {isChecked && (
            <Text
              style={[
                styles.checkmark,
                {color: isDarkMode ? '#000000' : '#FFFFFF'},
              ]}>
              ✓
            </Text>
          )}
        </View>
        <Text style={{fontSize: 15, color: textColor}}>빈 방만 보기</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{padding: 4}}
        showsVerticalScrollIndicator={false}>
        <View style={{padding: 16}}>
          {roomData.length > 0 ? (
            roomData.map((room, index) => (
              <RoomContainer
                uuid={room.uuid}
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
            <Text style={{fontSize: 16, textAlign: 'center', color: textColor}}>
              현재 등록된 카풀이 없습니다.
            </Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            backgroundColor: isDarkMode ? '#FFFFFF' : 'black',
          },
        ]}
        onPress={() => navigation.navigate('NewPaxiRoom')}>
        <Icon name="add" size={30} color={isDarkMode ? '#000000' : 'white'} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PaxiRoomListScreen;

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
  filterButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    width: 150,
  },
  filterModal: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  filterOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  conditionNavigator: {
    paddingLeft: 15,
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  roomContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    padding: 12,
  },
  cardContent: {
    flexDirection: 'column',
  },
  mainInfo: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  possible: {
    fontSize: 13,
    letterSpacing: -0.1,
    fontWeight: '700',
    color: '#fb5353',
    borderRadius: 3,
    backgroundColor: '#fff3f3',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  impossible: {
    fontSize: 13,
    letterSpacing: -0.1,
    fontWeight: '700',
    color: '#909090',
    borderRadius: 3,
    backgroundColor: 'rgba(217, 217, 217, 0.83)',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  departureTime: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 18,
  },
  arrow: {
    fontSize: 20,
  },
  button: {
    borderRadius: 20,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
