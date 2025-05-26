import React, {useEffect, useState, useCallback} from 'react';
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

import {MainTabParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import DropdownFilter from '@components/DropdownFilter';
import {RoomDataType, ParsedRoomDataType} from '@interfaces/paxi';
import {RefreshButton} from '@components/room/RefreshButton';
import {RoomListCard} from '@components/room/RoomListCard';

type PaxiRoomListScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Paxi'>;
};

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
    console.log('selected', selected);
  };

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
  ];

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
          defaultText={'출발지'}
          categories={[
            {id: 'fruit', name: '과일'},
            {id: 'fruit2', name: '과일'},
          ]}
          onSelect={selected => filterDeparture(selected)}
        />

        <DropdownFilter
          style={dropdownStyle}
          defaultText={'도착지'}
          categories={[{id: 'fruit', name: '과일'}]}
          onSelect={selected => console.log('선택된 카테고리:', selected)}
        />

        <DropdownFilter
          style={dropdownStyle}
          defaultText={'날짜'}
          categories={[{id: 'fruit', name: '과일'}]}
          onSelect={selected => console.log('선택된 카테고리:', selected)}
        />

        <DropdownFilter
          style={dropdownStyle}
          defaultText={'시간'}
          categories={[{id: 'fruit', name: '과일'}]}
          onSelect={selected => console.log('선택된 카테고리:', selected)}
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
              <RoomListCard
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
