import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Alert,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import api from '@utils/api';
import {PAXI_LOCATIONS} from '@utils/locations';
import {RoomDataType} from '@interfaces/paxi';
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

  const [hideFullRoom, setHideFullRoom] = useState(true);
  const [roomData, setRoomData] = useState<RoomDataType[]>([]);
  const [userUuid, setUserUuid] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

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

  const filteredRoomData = useMemo(() => {
    const optionIds = PAXI_LOCATIONS.map(o => o.id);
    const isOther = (v: string | null) => v === '__other__';

    return roomData
      .filter(room => {
        if (!selectedDeparture) return true;
        if (isOther(selectedDeparture)) {
          return !optionIds.includes(room.departureLocation);
        }
        return room.departureLocation === selectedDeparture;
      })
      .filter(room => {
        if (!selectedArrival) return true;
        if (isOther(selectedArrival)) {
          return !optionIds.includes(room.destinationLocation);
        }
        return room.destinationLocation === selectedArrival;
      })
      .filter(
        room =>
          !selectedDate ||
          moment(room.departureTime).format('YYYY-MM-DD') ===
            moment(selectedDate).format('YYYY-MM-DD'),
      )
      .filter(
        room => !hideFullRoom || room.currentParticipant < room.maxParticipant,
      );
  }, [
    roomData,
    selectedDeparture,
    selectedArrival,
    selectedDate,
    hideFullRoom,
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getRoomList();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
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
    <SafeAreaView style={[backgroundStyle]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Text
        style={{
          color: textColor,
          marginTop: 20,
          marginLeft: 20,
          marginBottom: 10,
          fontSize: 25,
          fontWeight: 'bold',
        }}>
        Paxi
      </Text>

      <ScrollView
        horizontal
        style={styles.conditionNavigatorScroll}
        contentContainerStyle={[styles.conditionNavigatorContent]}
        showsHorizontalScrollIndicator={false}>
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
      </ScrollView>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setHideFullRoom(!hideFullRoom)}>
        <View
          style={[
            styles.checkbox,
            {borderColor: isDarkMode ? '#555' : '#D0D0D0'},
            hideFullRoom && {
              backgroundColor: isDarkMode ? '#4F46E5' : 'black', // 다크모드에서 파란색 등으로
              borderColor: isDarkMode ? '#4F46E5' : 'black',
            },
          ]}>
          {hideFullRoom && (
            <Icon
              name="check"
              size={20}
              color="#FFFFFF" // 항상 흰색
              style={styles.checkmark}
            />
          )}
        </View>
        <Text style={{fontSize: 15, color: textColor}}>마감된 방 숨기기</Text>
      </TouchableOpacity>

      <FlatList
        style={{flex: 1}}
        data={filteredRoomData}
        keyExtractor={item => item.uuid}
        renderItem={({item}) => (
          <RoomListCard
            roomUuid={item.uuid}
            userUuid={userUuid}
            navigation={navigation as any}
          />
        )}
        contentContainerStyle={{padding: 16, paddingBottom: 100}}
        ListEmptyComponent={() => (
          <Text style={{fontSize: 16, textAlign: 'center', color: textColor}}>
            현재 등록된 카풀이 없습니다.
          </Text>
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000000']}
            tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        }
        initialNumToRender={10}
        windowSize={10}
        removeClippedSubviews
      />

      <View style={styles.floatingButtonWrapper}>
        <TouchableOpacity
          style={[
            styles.floatingButton,
            {
              backgroundColor: isDarkMode ? '#444444' : '#222222',
            },
          ]}
          onPress={() => navigation.navigate('CreatePaxiRoomScreen')}>
          <Icon
            name="add"
            size={30}
            color={isDarkMode ? '#cccccc' : '#ffffff'}
          />
        </TouchableOpacity>
      </View>
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
  conditionNavigatorScroll: {
    flexDirection: 'row',
    flexGrow: 0,
    height: 46,
    maxHeight: 46,
  },
  conditionNavigatorContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
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
  floatingButtonWrapper: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
  },
  floatingButton: {
    width: '100%',
    height: '100%',
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
