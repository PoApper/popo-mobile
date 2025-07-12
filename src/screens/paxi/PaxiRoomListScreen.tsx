import React, {useEffect, useState} from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';

import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import api from '@utils/api';
import {PAXI_LOCATIONS} from '@utils/locations';
import {RoomDataType} from '@interfaces/paxi';
import CommonHeader from '@components/CommonHeader';
import DropdownFilter from '@components/room/DropdownFilter';
import {RefreshButton} from '@components/room/RefreshButton';
import RoomFilterDatePicker from '@components/room/RoomFilterDatePicker';
import {RoomListCard} from '@components/room/RoomListCard';
import moment from 'moment';

type PaxiRoomListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const PaxiRoomListScreen = ({navigation}: PaxiRoomListScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const [showEmptyRoom, setShowEmptyRoom] = useState(false);
  const [roomData, setRoomData] = useState<RoomDataType[]>([]);
  const [userUuid, setUserUuid] = useState<string>('');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [selectedDeparture, setSelectedDeparture] = useState<string | null>('');
  const [selectedArrival, setSelectedArrival] = useState<string | null>('');

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const getRoomList = async () => {
    paxi_api
      .get('/room')
      .then(res => {
        setRoomData(res.data);
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('실패', '방을 불러오는데 실패했습니다: ' + error.message);
      });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      paxi_api
        .get('/user/onboarding-status')
        .then(res => {
          if (res.data.onboardingStatus === false) {
            navigation.navigate('PaxiIntro');
          } else {
            api.get('/auth/myInfo').then(res => {
              setUserUuid(res.data.uuid);
            });
            getRoomList();
          }
        })
        .catch(err => {
          console.error('Error:', err);
          Alert.alert('실패', 'Paxi 유저 확인에 실패했습니다: ' + err.message);
        });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={[backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title="Paxi" isBackHome={true} />

      <View style={[styles.conditionNavigator]}>
        <RefreshButton onPress={() => getRoomList()} />

        <DropdownFilter
          placeholderText={'출발지'}
          options={PAXI_LOCATIONS.filter(item => item.id !== selectedArrival)}
          selected={selectedDeparture}
          onSelect={selected => setSelectedDeparture(selected)}
        />

        <DropdownFilter
          placeholderText={'도착지'}
          options={PAXI_LOCATIONS.filter(item => item.id !== selectedDeparture)}
          selected={selectedArrival}
          onSelect={selected => setSelectedArrival(selected)}
        />

        <RoomFilterDatePicker
          selectedDate={selectedDate}
          onDateChange={date => setSelectedDate(date)}
        />
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setShowEmptyRoom(!showEmptyRoom)}>
        <View
          style={[
            styles.checkbox,
            {borderColor: isDarkMode ? '#555' : '#D0D0D0'},
            showEmptyRoom && {
              backgroundColor: isDarkMode ? '#FFFFFF' : 'black',
              borderColor: isDarkMode ? '#FFFFFF' : 'black',
            },
          ]}>
          {showEmptyRoom && (
            <Icon
              name="check"
              size={20}
              color={isDarkMode ? '#000000' : '#FFFFFF'}
              style={styles.checkmark}
            />
          )}
        </View>
        <Text style={{fontSize: 15, color: textColor}}>빈 방만 보기</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{padding: 4}}
        showsVerticalScrollIndicator={false}>
        <View style={{padding: 16}}>
          {roomData.length > 0 ? (
            roomData
              .filter(
                room =>
                  !selectedDeparture ||
                  room.departureLocation === selectedDeparture,
              )
              .filter(
                room =>
                  !selectedArrival ||
                  room.destinationLocation === selectedArrival,
              )
              .filter(
                room =>
                  !selectedDate ||
                  moment(room.departureTime).format('YYYY-MM-DD') ===
                    moment(selectedDate).format('YYYY-MM-DD'),
              )
              .map((room, index) => (
                <RoomListCard
                  key={index}
                  roomData={room}
                  userUuid={userUuid}
                  navigation={navigation as any}
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
        onPress={() => navigation.navigate('CreatePaxiRoomScreen')}>
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
  conditionNavigator: {
    paddingLeft: 15,
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
    marginBottom: 10,
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
  button: {
    borderRadius: 20,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
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
