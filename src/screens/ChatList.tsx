import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import paxi_api from '../utils/paxi_api';

interface RoomData {
  title: string;
  uuid: string;
}

type ChatListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChatList'>;
};

const ChatListScreen = ({navigation}: ChatListScreenProps) => {
  const [roomDatas, setRoomDatas] = useState<RoomData[]>([]);

  useEffect(() => {
    paxi_api.get('/room/my').then((response) => {
      const data = response.data;

      const filteredData: RoomData[] = data.map((room: any) => ({
        uuid: room.uuid,
        title: room.title,
      }));

      setRoomDatas(filteredData);
    }).catch((error) => {
      console.error('Error fetching chat rooms:', error);
      Alert.alert('Error', 'Failed to fetch chat rooms. Please try again later.');
    });
  }, []);

  const renderItem = ({ item }: ListRenderItemInfo<RoomData>) => {
    return (
      <View style={[styles.roomContainer]}>
        <TouchableOpacity style={{
            flex: 1,
            padding: 10,
            backgroundColor: '#f0f0f0',
            borderWidth: 1,
            borderRadius: 5
          }}
          onPress={() => navigation.navigate('Chat', { roomUuid: item.uuid })}
        >
            <Text style={styles.roomName}>{item.title}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButton}>나가기</Text>
        </TouchableOpacity>

        <Text style={{
          fontSize: 25,
          color: "#000",
          textAlign: 'center',
        }}>채팅창 목록(임시)</Text>
      </View>

      <FlatList
        style={styles.chatList}
        data={roomDatas}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roomName: {
    fontSize: 18,
    color: '#000',
  },
  roomContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
  },
});

export default ChatListScreen;