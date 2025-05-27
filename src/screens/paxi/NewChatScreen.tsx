import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  StatusBar,
  FlatList,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Socket} from 'socket.io-client';

import {ChatRoomInfo, MessageData, PaxiUser} from '@interfaces/paxi';
import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import {textColor, borderColor, backgroundColor, common} from '@styles/default';
import {socketFactory} from '@utils/socket-factory';
import ChatMessage from '@components/chat/chatMessage';

type NewChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Benefits'>;
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const NewChatScreen: React.FC<NewChatScreenProps> = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const route = useRoute<ChatScreenRouteProp>();
  const {roomUuid} = route.params;

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [roomInfo, setRoomInfo] = useState<ChatRoomInfo>({} as ChatRoomInfo);
  const [myInfo, setMyInfo] = useState<PaxiUser>({} as PaxiUser);
  const [chatList, setChatList] = useState<MessageData[]>([]);
  const [newChat, setNewChat] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const getRoomInfo = async () => {
    paxi_api
      .get(`/room/${roomUuid}`)
      .then(res => {
        setRoomInfo(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const getMyInfo = async () => {
    paxi_api
      .get('/auth/verifyToken')
      .then(res => {
        setMyInfo(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const getChatList = async () => {
    paxi_api
      .get(`/chat/${roomUuid}`)
      .then(res => {
        setChatList(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const initSocket = async () => {
    const socket = await socketFactory();
    socket.on('newMessage', data => {
      console.debug('메시지 수신:', data);
      appendChat(data);
    });

    socket.on('updatedMessage', data => {
      console.debug('갱신될 메시지:', data);
      // updateChatData(data);
    });

    socket.on('deletedMessage', data => {
      console.debug('삭제될 메시지:', data);
      // deleteChatData(data);
    });
    setSocket(socket);
  };

  console.log('myinfo', myInfo);

  useEffect(() => {
    getRoomInfo();
    getMyInfo();
    getChatList();
    initSocket();
  }, []);

  const sendChat = async () => {
    if (!socket) {
      console.error('소켓이 아직 연결되지 않았습니다.');
      return;
    }

    paxi_api
      .post(`/chat/${roomUuid}`, {
        message: newChat,
      })
      .then(res => {
        setNewChat('');
        console.debug('메시지 전송 성공:', res.data);
      })
      .catch(err => {
        console.error('메시지 전송 실패:', err);
      });
  };

  const appendChat = (data: MessageData) => {
    // TODO: myUuid는 상수값으로 설정.
    const newChatData = {
      ...data,
      senderName: 'senderName',
      isMe: data.senderUuid === myInfo.uuid,
    };
    setChatList(prev => [newChatData, ...prev]);
  };

  return (
    <SafeAreaView
      style={{backgroundColor: backgroundColor(isDarkMode), flex: 1}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor(isDarkMode)}
      />
      <View
        style={[common.header, {borderBottomColor: borderColor(isDarkMode)}]}>
        <TouchableOpacity
          style={common.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[common.backButtonText, {color: textColor(isDarkMode)}]}>
            뒤로
          </Text>
        </TouchableOpacity>
        <Text style={[common.headerTitle, {color: textColor(isDarkMode)}]}>
          {roomInfo?.title}
        </Text>
        <TouchableOpacity
          style={{marginRight: 10}}
          onPress={() => setSidebarVisible(!sidebarVisible)}>
          <Icon name="menu" size={30} color={'black'} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chatList}
        renderItem={({item}) => <ChatMessage message={item} />}
        keyExtractor={item => item.uuid}
        style={{flex: 1, padding: 10}}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput]}
          value={newChat}
          onChangeText={setNewChat}
          multiline={true}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendChat}>
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NewChatScreen;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    textAlignVertical: 'top',
    borderWidth: 0.5,
    backgroundColor: '#f2f3f5',
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  sendButton: {
    marginLeft: 5,
    height: 40,
    width: 40,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});
