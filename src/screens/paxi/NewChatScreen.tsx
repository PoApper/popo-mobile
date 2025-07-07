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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Socket} from 'socket.io-client';

import {ChatRoomInfo, MessageData, PaxiUser, SettlementData} from '@interfaces/paxi';
import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import {textColor, borderColor, backgroundColor, common} from '@styles/default';
import {socketFactory} from '@utils/socket-factory';
import ChatMessage from '@components/chat/ChatMessage';
import SidebarModal from '@components/chat/SidebarModal';
import SettlementInfoBox from '@components/chat/SettlementInfoBox';

type NewChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewChat'>;
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'NewChat'>;

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

  const [settlementData, setSettlementData] = useState<SettlementData>({} as SettlementData);
  const [isSettlement, setIsSettlement] = useState<boolean>(false);

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

  const getSettlementInfo = async () => {
    paxi_api
      .get(`/room/${roomUuid}/settlement`)
      .then(res => {
        setIsSettlement(true);
        setSettlementData(res.data);
      })
      .catch(err => {
        console.log(err);
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

    socket.on('newSettlement', data => {
      console.debug('새 정산 요청:', data);
      setIsSettlement(true);
      setSettlementData(data);
    });
    setSocket(socket);
  };

  useEffect(() => {
    getRoomInfo();
    getSettlementInfo();
    getMyInfo();
    getChatList();
    initSocket();
  }, []);

  const sendChat = async () => {
    if (!socket) {
      console.error('소켓이 아직 연결되지 않았습니다.');
      initSocket();
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

      <SidebarModal
        modalVisible={sidebarVisible}
        setModalVisible={setSidebarVisible}
        roomData={roomInfo}
        myUuid={myInfo.uuid}
        navigation={navigation}
      />

      {isSettlement &&
        <View
          style={{
            position: 'absolute',
            width: '100%',
            marginTop: 70,
            paddingHorizontal: 10,
            zIndex: 999,
        }}>
          <SettlementInfoBox settlementData={settlementData} />
        </View>
      }

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <FlatList
          data={chatList}
          renderItem={({item}) => (
            <ChatMessage message={item} user_uuid={myInfo.uuid} />
          )}
          keyExtractor={item => item.uuid}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          inverted
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput]}
            value={newChat}
            onChangeText={setNewChat}
            placeholder="메시지를 입력하세요..."
            multiline={true}
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, {opacity: newChat.trim() ? 1 : 0.5}]}
            onPress={sendChat}
            disabled={!newChat.trim()}>
            <Icon name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesContainer: {
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
    backgroundColor: 'white',
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    backgroundColor: '#f8f9fa',
    borderColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    height: 40,
    width: 40,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});
