import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useRoute, useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Socket} from 'socket.io-client';

import {
  UserData,
  ChatRoomInfo,
  MessageData,
  PaxiUser,
  SettlementInfoData,
} from '@interfaces/paxi';
import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import {textColor, borderColor, backgroundColor, common} from '@styles/default';
import {socketFactory} from '@utils/socket-factory';
import ChatMessage from '@components/chat/ChatMessage';
import SidebarModal from '@components/chat/SidebarModal';
import SettlementInfoBox from '@components/chat/SettlementInfoBox';
import MsgModifyModal from '@components/chat/MsgModifyModal';
import UserInfoModal from '@components/chat/UserInfoModal';
import {ChatEvent} from '../../constants/socket-events';
import {updateMuteStatus} from '@utils/mute';

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
  const socketRef = useRef<Socket | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  const [settlementData, setSettlementData] = useState<SettlementInfoData>(
    {} as SettlementInfoData,
  );
  const [isSettlement, setIsSettlement] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined);
  const [isPaidEnd, setIsPaidEnd] = useState<boolean>(false);
  const [showMyChatOptions, setShowMyChatOptions] = useState<boolean>(false);
  const [selectedMsgData, setSelectedMsgData] = useState<MessageData>(
    {} as MessageData,
  );
  const [showUserInfo, setShowUserInfo] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const getRoomInfo = async () => {
    paxi_api
      .get(`/room/${roomUuid}`)
      .then(res => {
        setRoomInfo(res.data);
        setIsMuted(res.data.myRoomUser?.isMuted ?? false);
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Error', err.response.data.message, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]);
      });
  };

  const handleToggleMute = async () => {
    const newMuted = !isMuted;
    try {
      await updateMuteStatus(roomUuid, newMuted);
      setIsMuted(newMuted);
    } catch (err) {
      console.error('음소거 상태 변경 실패:', err);
      Alert.alert('오류', '알림 설정 변경에 실패했습니다.');
    }
  };

  const getSettlementInfo = async () => {
    paxi_api
      .get(`/room/${roomUuid}/settlement`)
      .then(res => {
        console.log(res);
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

  const releaseCurrentSocket = () => {
    if (socketRef.current) {
      console.debug('웹소켓 삭제 중...');
      socketRef.current.offAny();
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      console.debug('웹소켓 삭제 완료');
    }
  };

  const onSocketConnected = async () => {
    setSocketConnected(true);
    setReconnectAttempt(0);
    paxi_api.post(`/room/join/${roomUuid}`);
  };

  const onSocketDisconnected = () => {
    setSocketConnected(false);
    setReconnectAttempt(prevNum => prevNum + 1);
  };

  const initSocket = async () => {
    console.debug('새 웹소켓 생성 중...');
    const newSocket = await socketFactory(
      onSocketConnected,
      onSocketDisconnected,
    );

    newSocket.on(ChatEvent.NEW_MESSAGE, data => {
      console.debug('메시지 수신:', data);
      appendChat(data);
      if (data.senderUuid == null) {
        getRoomInfo();
      }
    });

    newSocket.on(ChatEvent.UPDATED_MESSAGE, data => {
      console.debug('갱신될 메시지:', data);
      updateChatData(data);
    });

    newSocket.on(ChatEvent.DELETED_MESSAGE, data => {
      console.debug('삭제될 메시지:', data);
      markChatAsDeleted(data);
    });

    newSocket.on(ChatEvent.NEW_SETTLEMENT, data => {
      console.debug('새 정산 요청:', data);
      setIsSettlement(true);
      setSettlementData(data);
    });

    newSocket.on(ChatEvent.DELETED_SETTLEMENT, data => {
      console.debug('정산 요청 삭제:', data);
      setIsSettlement(false);
    });

    newSocket.on(ChatEvent.UPDATED_IS_PAID, data => {
      console.debug('개별 정산 완료 업데이트:', data);

      // 내 정산 상태 업데이트
      if (data.userUuid === myInfo.uuid) {
        setIsPaid(data.isPaid);
      }

      // 방 정보의 해당 유저 정산 상태 업데이트
      setRoomInfo(prevRoomInfo => {
        if (!prevRoomInfo.roomUsers) return prevRoomInfo;

        const updatedRoomUsers = prevRoomInfo.roomUsers.map((user: any) => {
          if (user.userUuid === data.userUuid) {
            return {
              ...user,
              isPaid: data.isPaid,
            };
          }
          return user;
        });

        return {
          ...prevRoomInfo,
          roomUsers: updatedRoomUsers,
        };
      });
    });

    socketRef.current = newSocket;
  };

  useEffect(() => {
    if (socketRef.current?.connected) {
      getRoomInfo();
      getSettlementInfo();
      getMyInfo();
      getChatList();
    }
  }, [reconnectAttempt]);

  useEffect(() => {
    if (!myInfo?.uuid || !Array.isArray(roomInfo?.roomUsers)) {
      return;
    }

    const matchedUser = roomInfo.roomUsers.find(
      (user: UserData) => user.userUuid === myInfo.uuid,
    );

    setIsPaid(matchedUser?.isPaid);
    setIsPaidEnd(roomInfo.status === 'COMPLETED');
  }, [roomInfo, myInfo]);

  useFocusEffect(
    useCallback(() => {
      getRoomInfo();
      getMyInfo();
      getChatList();
      getSettlementInfo();
      initSocket();

      return () => {
        releaseCurrentSocket();
      };
    }, []),
  );

  const updateChatData = (data: MessageData) => {
    setChatList(prev =>
      prev.map(chat => (chat.uuid === data.uuid ? {...chat, ...data} : chat)),
    );
  };

  const markChatAsDeleted = (data: MessageData) => {
    setChatList(prev =>
      prev.map(chat =>
        chat.uuid === data.uuid ? {...chat, isDeleted: true} : chat,
      ),
    );
  };

  const sendChat = async () => {
    if (!socketRef.current || !socketRef.current?.connected) {
      Alert.alert('에러', '서버 연결이 불안정하여 메시지를 보낼 수 없습니다.');
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
    const newChatData = {
      ...data,
    };
    setChatList(prev => [newChatData, ...prev]);
  };

  const handleUserClick = useCallback((msgData: MessageData) => {
    setSelectedMsgData(msgData);
    setShowUserInfo(_ => true);
  }, []);

  const handleMyMsgClick = useCallback((msgData: MessageData) => {
    setSelectedMsgData(msgData);
    setShowMyChatOptions(_ => true);
  }, []);

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
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Main',
                    params: {tab: 'MyReservation', prevTab: 'NewChat'},
                  },
                ],
              });
            }
          }}>
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
          <Icon name="menu" size={30} color={textColor(isDarkMode)} />
        </TouchableOpacity>
      </View>

      {!socketConnected && reconnectAttempt !== 0 && (
        <View style={styles.socketConnection}>
          <View
            style={[
              styles.socketConnectionInner,
              {backgroundColor: isDarkMode ? '#333' : '#eee'},
            ]}>
            <Icon
              name="link-off"
              size={18}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
            <Text style={{color: textColor(isDarkMode)}}>
              서버와 접속이 끊어졌습니다. 재연결 시도 {reconnectAttempt}회
            </Text>
          </View>
        </View>
      )}

      <SidebarModal
        modalVisible={sidebarVisible}
        setModalVisible={setSidebarVisible}
        roomData={roomInfo}
        myUuid={myInfo.uuid}
        navigation={navigation}
        isPaidEnd={isPaidEnd}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      <MsgModifyModal
        modalVisible={showMyChatOptions}
        setModalVisible={setShowMyChatOptions}
        msgData={selectedMsgData}
      />

      <UserInfoModal
        modalVisible={showUserInfo}
        setModalVisible={setShowUserInfo}
        msgData={selectedMsgData}
        roomUuid={roomUuid}
        isOwner={roomInfo.ownerUuid === myInfo.uuid}
      />

      {isSettlement && settlementData && (
        <View
          style={{
            width: '100%',
            marginTop: 20,
            paddingHorizontal: 10,
            zIndex: 999,
          }}>
          <SettlementInfoBox
            isPaid={isPaid}
            isPaidEnd={isPaidEnd}
            settlementData={settlementData}
          />
        </View>
      )}

      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <FlatList
          data={chatList}
          renderItem={({item}) => (
            <ChatMessage
              message={item}
              userUuid={myInfo.uuid}
              handleUserClick={handleUserClick}
              handleMyMsgClick={handleMyMsgClick}
            />
          )}
          keyExtractor={item => item.uuid}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          inverted
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: backgroundColor(isDarkMode),
            },
          ]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDarkMode ? '#444' : '#eee',
                color: backgroundColor(!isDarkMode),
              },
            ]}
            value={newChat}
            editable={socketConnected}
            onChangeText={setNewChat}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={backgroundColor(!isDarkMode)}
            multiline={true}
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                opacity: newChat.trim() ? 1 : 0.5,
                backgroundColor: isDarkMode ? 'white' : 'black',
              },
            ]}
            onPress={sendChat}
            disabled={!newChat.trim()}>
            <Icon name="send" size={20} color={backgroundColor(isDarkMode)} />
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
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'flex-end',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'top',
    borderRadius: 20,
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
  socketConnection: {
    paddingHorizontal: 10,
    marginTop: 10,
    position: 'absolute',
    zIndex: 1000,
    width: '100%',
    height: 50,
    top: 60,
  },
  socketConnectionInner: {
    borderRadius: 5,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
});
