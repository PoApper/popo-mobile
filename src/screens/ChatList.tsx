import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  Alert,
  SafeAreaView,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import paxi_api from '../utils/paxi_api';

interface RoomData {
  title: string;
  uuid: string;
  status: string;
  departureTime: string;
  departureLocation: string;
  destinationLocation: string;
}

type ChatListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChatList'>;
};

const ChatListScreen = ({navigation}: ChatListScreenProps) => {
  const [roomDatas, setRoomDatas] = useState<RoomData[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('현재 채팅방');
  const [textWidths, setTextWidths] = useState<{[key: string]: number}>({});

  useFocusEffect(
    useCallback(() => {
      paxi_api
        .get('/room/my')
        .then(response => {
          const data = response.data;

          const filteredData: RoomData[] = data.map((room: any) => ({
            uuid: room.uuid,
            title: room.title,
            departureTime: room.departureTime,
            departureLocation: room.departureLocation,
            destinationLocation: room.destinationLocation,
            status: room.status,
          }));

          setRoomDatas(filteredData);
        })
        .catch(error => {
          console.error('Error fetching chat rooms:', error);
          Alert.alert(
            'Error',
            'Failed to fetch chat rooms. Please try again later.',
          );
        });
      return () => {
        // console.log('ChatList 화면 이탈');
      };
    }, []),
  );

  const renderItem = ({item}: ListRenderItemInfo<RoomData>) => {
    if (item.status === 'DELETED') {
      return null;
    } else {
      return (
        <View style={[styles.roomContainer]}>
          <TouchableOpacity
            style={styles.roomItem}
            onPress={() => navigation.navigate('Chat', {roomUuid: item.uuid})}>
            <View style={{width: '85%', marginRight: 10}}>
              <Text style={styles.roomName}>
                {item.title} | {item.departureLocation} →{' '}
                {item.destinationLocation}
              </Text>
              <Text style={styles.departureTimeText}>{item.departureTime}</Text>
            </View>
            <View style={styles.chatBox} />
          </TouchableOpacity>
        </View>
      );
    }
  };

  const options = ['현재 채팅방', '과거 채팅방'];
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={{marginLeft: 10}}
          onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>나가기</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Paxi 채팅방 목록 (임시)</Text>
      </View>

      <View style={styles.optionListNav}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => setSelectedOption(option)}
            style={styles.optionTabWrapper}>
            <View style={styles.optionTabInner}>
              <View style={styles.textWithUnderline}>
                <Text
                  style={[
                    styles.optionTab,
                    selectedOption === option && [
                      styles.selectedOptionText,
                      {color: '#000000'},
                    ],
                  ]}
                  onLayout={e => {
                    const width = e.nativeEvent.layout.width;
                    setTextWidths(prev => ({...prev, [option]: width}));
                  }}>
                  {option}
                </Text>
                {selectedOption === option && (
                  <View
                    style={[
                      styles.underline,
                      {width: (textWidths[option] || 0) + 8},
                    ]}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        style={styles.chatList}
        data={roomDatas}
        keyExtractor={item => item.uuid}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  optionListNav: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 20,
    height: 30,
  },
  header: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  chatList: {
    paddingVertical: 5,
  },
  roomName: {
    fontSize: 16,
    color: '#393a3f',
    letterSpacing: -0.2,
    fontWeight: 'bold',
    fontFamily: 'Pretendard',
  },
  roomItem: {
    flex: 1,
    padding: 15,
    paddingHorizontal: 40,
    borderBottomWidth: 0.7,
    borderColor: '#D9D9D98F',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  departureTimeText: {
    fontSize: 12,
    color: '#909090',
    letterSpacing: -0.2,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    marginTop: 10,
  },
  chatBox: {
    borderRadius: 6,
    backgroundColor: '#f2f3f5',
    width: 44,
    height: 44,
  },
  roomContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  optionTabWrapper: {
    alignItems: 'center',
    margin: 2,
  },
  optionTabInner: {
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  textWithUnderline: {
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  optionTab: {
    fontSize: 16,
    color: '#999',
    lineHeight: 20,
  },
  selectedOptionText: {
    color: '#000',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  underline: {
    marginTop: 4,
    height: 2,
    borderRadius: 1,
    alignSelf: 'center',
    backgroundColor: '#000000',
  },
});

export default ChatListScreen;
