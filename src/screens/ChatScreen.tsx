import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import { io, Socket } from 'socket.io-client';
import EncryptedStorage from 'react-native-encrypted-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useRoute } from '@react-navigation/native';
import paxi_api from '../utils/paxi_api';

interface MessageData {
  uuid: string;
  senderUuid: string;
  senderName: string;
  message: string;
  messageType: string;
  createdAt: any;
  updatedAt: any;
  avatar: any;
  isMe: boolean;
}

interface UserData {
  userUuid: string;
  nickname: string;
  isPaid: boolean;
  isOwner: boolean;
  status: string;
}

interface RoomData {
  uuid: string,
  title: string,
  ownerUuid: string,
  departureLocation: string,
  destinationLocation: string,
  maxParticipant: number,
  currentParticipant: number,
  departureTime: string,
  status: string,
  description: string,
  payerUuid: string,
  payAmount: number,
  roomUser: UserData[],
}

interface SettlementData {
  payAmount: number;
  currentParticipant: number;
  payerBankName: string;
  payerAccountNumber: string;
  payerAccountHolderName: string;
  updateAccount: boolean;
  roomUuid: string;
}

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const renderMemberItem = ({ item }: ListRenderItemInfo<UserData>) => {
  const banUser = () => {
    Alert.alert('추방', `유저 ${item.nickname}를 추방하시겠습니까?`, [
      {
        text: '아니오',
        style: 'cancel',
      },
      {
        text: '추방',
        onPress: () => {
          Alert.alert('처리 완료', '요청이 처리되었습니다.');
        },
      },
    ]);
  };

  const reportUser = () => {
    Alert.alert('신고', `유저 ${item.nickname}를 신고하시겠습니까?`, [
      {
        text: '아니오',
        style: 'cancel',
      },
      {
        text: '신고',
        onPress: () => {
          Alert.alert('처리 완료', '요청이 처리되었습니다.');
        },
      },
    ]);
  };

  return (
    <View style={styles.userRow}>
      <View style={styles.rowCenter}>
        {/* 프로필 사진 대체 원 */}
        <View style={styles.avatarCircle} >
          <View style={{width: 36, height: 36, position: 'relative'}}>
              {item.isPaid &&
              <Icon name="check-circle-outline" style={{ position: 'absolute', bottom: 0, right: 0 }} size={20} color="green" />
              }
              {item.isOwner &&
              <Icon name="verified" style={{ position: 'absolute', top: 0, left: 0 }} size={20} color="gold" />
              }
          </View>
        </View>
        <View>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{item.nickname}</Text>
          </View>
          {item.isOwner && !item.isPaid && <Text style={styles.subText}>방장</Text>}
          {item.isPaid && !item.isOwner && <Text style={styles.subText}>송금 완료</Text>}
          {item.isPaid && item.isOwner && <Text style={styles.subText}>방장 & 송금 완료</Text>}
        </View>
      </View>
      <View style={styles.rowCenter}>
        <TouchableOpacity
          style={styles.grayButton}
          onPress={banUser}
        >
          <Text>추방</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.grayButton}
          onPress={reportUser}
        >
          <Text>신고</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const renderItem = ({ item }: ListRenderItemInfo<MessageData>) => {
  const alignment = item.isMe ? 'flex-end' : 'flex-start';
  const createdTime = item.createdAt.slice(11,16);
  const isSystemMsg = item.senderUuid == null;
  return (
    <View style={{ alignSelf: alignment }}>
      {!item.isMe && !isSystemMsg &&
        <View style={[styles.messageContainer]}>
          <Icon name="face" size={35} color="black" />
          {/* <Image source={item.avatar} style={styles.avatar} /> */}
          <View>
            <Text style={{
              fontSize: 13,
              letterSpacing: -0.4,
              color: '#000',
              marginBottom: 4,
            }}>{item.senderName}</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 5,
            }}>
              <View style={styles.messageBubble}>
                <Text style={{
                  fontSize: 14,
                  letterSpacing: -0.4,
                  color: '#000',
                  marginBottom: 4,
                }}>{item.message}</Text>
              </View>
              <Text style={{
                color: '#9b9b9b',
                fontSize: 12,
                letterSpacing: -0.3,
                fontWeight: 'bold',
              }}>{createdTime}</Text>
            </View>
          </View>
        </View>
      }
      {item.isMe &&
        <View style={[styles.messageContainer, {
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 5,
        }]}>
          <Text style={{
            color: '#9b9b9b',
            fontSize: 12,
            letterSpacing: -0.3,
            fontWeight: 'bold',
          }}>{createdTime}</Text>
          <View style={styles.messageBubble}>
            <Text style={{
              fontSize: 14,
              letterSpacing: -0.4,
              color: '#000',
              marginBottom: 4,
            }}>{item.message}</Text>
          </View>
        </View>
      }
      {isSystemMsg &&
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}>
          <View style={styles.systemMessageBubble}>
            <Text style={{
              fontSize: 12,
              color: '#000',
            }}>
              {item.message}
            </Text>
          </View>
        </View>
      }
    </View>
  );
};

async function deligateUser(roomUuid: string, userUuid: string) {
  try {
    const res = await paxi_api.post(`/room/deligate2/${roomUuid}`, {
      userUuid: userUuid,
    });
    console.log(res);

    return res.status;
  } catch (error: string | any) {
    console.error('Error:', error);
  }
}

async function completeSettlement(settlementData: SettlementData) {
  try {
    const res = await paxi_api.patch(`/room/${settlementData.roomUuid}/pay2`, {
      isPaid: true,
    });

    return res.status;
  } catch (error: string | any) {
    console.error('Error:', error);
  }
}

const SettlementRequest = ({ settlementData }: { settlementData: SettlementData }) => {
  const settlementSend = () => {
    Alert.alert('송금 확인', '송금을 완료하셨습니까?', [
      {
        text: '아니오',
        style: 'cancel',
      },
      {
        text: '네',
        onPress: () => {
          completeSettlement(settlementData).then(result => {
            if (result !== 200) {
              Alert.alert('실패', 'response: ' + result?.toString());
            } else {
              Alert.alert('전송 완료', '송금 완료 알림을 전송했습니다.');
            }
          }).catch(error => {
            Alert.alert('실패', '송금 완료 알림 전송에 실패했습니다: ' + error.message);
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.settlementRequest}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        <Text style={{
          fontSize: 22,
          letterSpacing: -0.7,
          fontWeight: '600',
          color: 'black',
        }}>정산 요청 안내</Text>
        <Text style={{
          fontSize: 22,
          letterSpacing: -0.7,
          fontWeight: '600',
          color: 'black',
        }}>{settlementData.payAmount}원</Text>
      </View>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}>
        <View style={{marginTop: 10}}>
          <Text style={{
            fontSize: 13,
            letterSpacing: -0.4,
            color: '#4f4f4f',
          }}>{settlementData.payerAccountHolderName}</Text>
          <Text style={{
            fontSize: 13,
            letterSpacing: -0.4,
            color: '#4f4f4f',
          }}>{settlementData.payerBankName} {settlementData.payerAccountNumber}</Text>
        </View>
        <Text style={{
          fontSize: 16,
          letterSpacing: -0.4,
          fontWeight: 'bold',
          color: '#e45b63',
        }}>???/{settlementData.currentParticipant}</Text>
      </View>
      <Text style={{
        fontSize: 12,
        letterSpacing: -0.4,
        fontWeight: '600',
        marginTop: 10,
        color: '#9b9b9b',
      }}>꼭! 송금 후 완료 버튼을 눌러 주세요!</Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#000',
          width: 250,
          alignItems: 'center',
          paddingVertical: 8,
          borderRadius: 6,
          marginTop: 5,
          justifyContent: 'center',
        }}
        onPress={() => settlementSend()}
      >
        <Text style={{
          fontSize: 14,
          letterSpacing: -0.4,
          color: '#f6f7f9',
          alignItems: 'center',
        }}>송금 완료 알림을 보냅니다</Text>
      </TouchableOpacity>
    </View>
  );
};

const ChatScreen = ({navigation}: ChatScreenProps) => {
  const route = useRoute<ChatScreenRouteProp>();
  const { roomUuid } = route.params;
  const [users, setUsers] = useState<UserData[]>([]);
  const [message, setMessage] = useState<string>('');
  const [inputHeight, setInputHeight] = useState<number>(40);
  const [modalVisible, setModalVisible] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [roomData, setRoomData] = useState<RoomData>();
  const [settlementData, setSettlementData] = useState<SettlementData>({
    payAmount: 0,
    currentParticipant: 0,
    payerBankName: '',
    payerAccountNumber: '',
    payerAccountHolderName: '',
    updateAccount: false,
    roomUuid: '',
  });
  const [chatData, setChatData] = useState<MessageData[]>([]);
  const [myUuid, setMyUuid] = useState<string>('');

  const flatListRef = useRef<FlatList>(null);
  const [isLoadingOld, setIsLoadingOld] = useState(false);
  const [isLeaveRoom, setIsLeaveRoom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isSettlementModal, setIsSettlementModal] = useState(false);

  const fetchChatRoomDataRef = useRef<() => Promise<void>>(null);

  async function sendMessage(msg: string) {
    if (!socketRef.current) {
      console.error('소켓이 아직 연결되지 않았습니다.');
      return;
    }

    await paxi_api.post(`/chat/${roomUuid}`, {
      message: msg,
    });
  }

  const fetchPrevChatData = async () => {
    if (isLoadingOld) {
      return;
    }
    setIsLoadingOld(true);
    try {
      const response = await paxi_api.get(`/chat/${roomUuid}?before=${chatData[chatData.length - 1].uuid}`);
      const newChatData: MessageData[] = response.data.map((item: MessageData) => ({
        ...item,
        avatar: require('../../assets/popo.png'), // 임시 이미지
        senderName: users?.find(user => user.userUuid === item.senderUuid)?.nickname ?? '알 수 없음',
        isMe: item.senderUuid === myUuid,
      }));
      setChatData(prev => [...prev, ...newChatData]);
    } catch (error) {
      console.error('Error fetching previous chat data:', error);
    } finally {
      setIsLoadingOld(false);
    }
  };

  const addChatData = (data: MessageData, myUuid: string) => {
    const newChatData = {
      ...data,
      avatar: require('../../assets/popo.png'), // 임시 이미지
      senderName: users?.find(user => user.userUuid === data.senderUuid)?.nickname ?? '알 수 없음',
      isMe: data.senderUuid === myUuid,
    };
    setChatData(prev => [newChatData, ...prev]);
    if (isAtBottom) {
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
    }
  };

  const updateChatData = (newData: MessageData) => {
    deleteChatData(newData.uuid);
    addChatData(newData, myUuid);
  };

  const deleteChatData = (uuid: string) => {
    const removedChatData = chatData.filter(item =>item.uuid !== uuid);
    setChatData(removedChatData);
    if (isAtBottom) {
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
    }
  };

  const connectSocket = async (tempMyUuid: string) => {
    const token = (await EncryptedStorage.getItem('auth_token')) ?? '';
    const socket = io(`https://api.paxi-dev.popo.poapper.club?Authentication=${token}`, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: true,
    });

    console.log('웹소켓 연결 중...');

    socket.on('connect', () => {
      console.log('웹소켓 연결 완료');
    });

    socket.off('newMessage');
    socket.on('newMessage', (data) => {
      console.log('메시지 수신:', data);
      addChatData(data, tempMyUuid);
    });

    socket.on('updatedMessage', (data) => {
      console.log('갱신될 메시지:', data);
      updateChatData(data);
    });

    socket.on('deletedMessage', (data) => {
      console.log('삭제될 메시지:', data);
      deleteChatData(data);
    });

    socket.on('connect_error', (error) => {
      console.error('연결 에러 발생:', error);
    });

    socket.on('error', (error) => {
      console.error('에러 발생:', error);
    });

    socket.on('disconnect', () => {
      console.log('웹소켓 연결 종료');
    });

    return socket;
  };

  const initSocket = async (tempMyUuid: string) => {
    const ws = await connectSocket(tempMyUuid);
    socketRef.current = ws;
  };

  const leaveRoomWithDeligate = async (userUuid: string) => {
    try {
      const response = await deligateUser(roomUuid, userUuid);
      if (response === 201) {
        setIsLeaveRoom(false);
        setModalVisible(false);
        navigation.goBack();

        const leaveResponse = await paxi_api.put(`/room/leave2/${roomUuid}`);
        console.log(leaveResponse);
      } else {
        Alert.alert('실패', '권한을 위임하는데 실패했습니다.');
      }
      return response;
    } catch (error) {
      console.error('Error while leaving room:', error);
      Alert.alert('실패', '방을 나가는데   실패했습니다.');
    }
  };

  const renderDeligateItem = ({ item }: ListRenderItemInfo<UserData>) => {
    const deligateCheck = () => {
      Alert.alert('권한 위임', `유저 ${item.nickname}에게 방장 권한을 위임하시겠습니까?`, [
        {
          text: '아니오',
          style: 'cancel',
        },
        {
          text: '위임하고 나가기',
          onPress: () => {
            leaveRoomWithDeligate(item.userUuid).then( response => {
              console.log('success in deligate', response);
              Alert.alert('처리 완료', '요청이 처리되었습니다.');
            }).catch(error => {
              console.error('error while deligate', error);
            });
          },
        },
      ]);
    };

    console.log(item.isOwner);

    return (
        <View style={styles.userRow}>
          <View style={styles.rowCenter}>
            {/* 프로필 사진 대체 원 */}
            <View style={styles.avatarCircle} />
            <View>
              <View style={styles.nameRow}>
                {item.isOwner}
                <Text style={styles.nameText}>{item.nickname}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rowCenter}>
            <TouchableOpacity
              style={styles.grayButton}
              onPress={deligateCheck}
            >
              <Text>권한 위임</Text>
            </TouchableOpacity>
          </View>
        </View>
    );
  };

  const leaveRoomWithDelete = async () => {
    try {
      setIsLeaveRoom(false);
      setModalVisible(false);
      navigation.goBack();
      const leaveWithDeleteResponse = await paxi_api.delete(`/room/${roomUuid}`);
      console.log(leaveWithDeleteResponse.data);
    } catch (error) {
      console.error('Error while deleting room:', error);
      Alert.alert('Error', 'Failed to deleting room. Please try again later.');
    }
  };

  const leaveRoom = () => {
    if (users.length === 1) {
      Alert.alert('방 삭제', '현재 참여하신 방을 삭제하시겠습니까?', [
        {
          text: '아니오',
          style: 'cancel',
        },
        {
          text: '삭제하고 나가기',
          onPress: leaveRoomWithDelete,
        },
      ]);
    } else {
      setIsLeaveRoom(true);
    }
  };

  const fetchChatRoomData = async () => {
    try {
      const roomResponse = await paxi_api.post(`/room/join2/${roomUuid}`);
      const myResponse = await paxi_api.get('/auth/me');
      roomResponse.data.departureTime = roomResponse.data.departureTime.slice(0,10) + ' ' + roomResponse.data.departureTime.slice(11,16);
      console.log(roomResponse.data);

      const payerUuid = roomResponse.data.payerUuid;
      if (payerUuid) {
        console.log(roomUuid);
        const settlementResponse = await paxi_api.get(`/room/${roomUuid}/settlement`);
        console.log('Settlement Data:', settlementResponse.data);

        setSettlementData({
          payAmount: Number(settlementResponse.data.payAmountPerPerson),
          payerBankName: settlementResponse.data.payerBankName,
          payerAccountNumber: settlementResponse.data.payerAccountNumber,
          payerAccountHolderName: settlementResponse.data.payerAccountHolderName,
          currentParticipant: Number(settlementResponse.data.currentParticipant),
          updateAccount: false, // TODO: 이 변수의 활용처를 정확하게 알아서 나중에 업데이트하기
          roomUuid: roomUuid,
        });
      }
      setIsSettlementModal(payerUuid !== null);
      setRoomData(roomResponse.data);
      initSocket(myResponse.data.uuid);
      setMyUuid(myResponse.data.uuid);

      const chatResponse = await paxi_api.get(`/chat/${roomUuid}`);
      const getChatData: MessageData[] = chatResponse.data.map((item: MessageData) => ({
        ...item,
        avatar: require('../../assets/popo.png'), // 임시 이미지
        senderName: roomResponse.data.room_users[item.senderUuid] ?? '알 수 없음',
        isMe: item.senderUuid === myResponse.data.uuid,
      }));

      const userData = roomResponse.data.room_users.map((item: any) => ({
        ...item,
        isOwner: item.userUuid === roomResponse.data.ownerUuid,
      }));
      setUsers(userData);
      setChatData(getChatData);
    } catch (error) {
      console.error('Error fetching room data:', error);
      Alert.alert('Error', 'Failed to fetch data. Please try again later.');
    }
  };

  fetchChatRoomDataRef.current = fetchChatRoomData;

  useEffect(() => {
    const run = async () => {
      await fetchChatRoomDataRef.current?.();
    };
    run();

    // 컴포넌트 언마운트될 때 소켓 닫기
    return () => {
      socketRef.current?.close();
    };
  }, []);

  const msgSend = () => {
    if (!message.trim()) {
      return;
    }

    const msg = message;
    setMessage('');
    sendMessage(msg);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{
          fontSize: 25,
          letterSpacing: -1,
          color: '#000',
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
        }}>{roomData?.title}</Text>

        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-ios-new" size={25} color={'black'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="menu" size={30} color={'black'} />
        </TouchableOpacity>
      </View>

      { isSettlementModal &&
        <SettlementRequest
          settlementData={settlementData}
        />
      }

      <Modal
        transparent={true}
        visible={isLeaveRoom}
        onRequestClose={() => setIsLeaveRoom(false)}
      >
        <Pressable style={styles.overlay2} onPress={() => setIsLeaveRoom(false)}>
          <Pressable style={styles.modalContainer2} onPress={() => { /* 내부 터치 무시 */ }}>
            <Text>방을 나가시려면 방장 권한을 위임해야 합니다.</Text>
            <FlatList
              style={{ width: '100%', paddingHorizontal: 0 }}
              data={users.filter(item => !item.isOwner)}
              keyExtractor={(item) => item.userUuid}
              renderItem={renderDeligateItem}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContainer} onPress={() => { /* 내부 터치 무시 */ }}>
            <View style={styles.infoBox}>
              <TouchableOpacity onPress={() => {}}>
                <Text style={{
                  color: '#999',
                  fontSize: 13,
                  marginLeft: 4,
                  marginBottom: 8,
                }}>✎ 수정하기</Text>
              </TouchableOpacity>

              <View style={styles.routeInfo}>
                <View style={styles.locationBlock}>
                  <Text style={styles.label}>출발지</Text>
                  <Text style={styles.location}>{roomData?.departureLocation}</Text>
                  <Text style={styles.subText}>{roomData?.departureTime}</Text>
                </View>
                <Text style={styles.arrow}>〉</Text>
                <View style={styles.locationBlock}>
                  <Text style={styles.label}>도착지</Text>
                  <Text style={styles.location}>{roomData?.destinationLocation}</Text>
                  <Text style={styles.subText} />
                </View>
              </View>
              <View style={{
                borderBottomWidth: 1,
                borderColor: '#ddd',
                borderStyle: 'dotted',
                marginTop: 12,
              }}/>
              <Text style={styles.extraInfo}>{roomData?.description}</Text>
            </View>

            <View style={styles.rowBetween}>
              <View style={styles.rowCenter}>
                <Icon name="person" size={30} color="black" />
                <Text style={styles.countText}>{roomData?.currentParticipant}</Text>
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Settlement', { roomUuid: roomUuid });
                }}
              >
                <Text style={styles.buttonText}>정산 요청하기</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              style={{ width: '100%', paddingHorizontal: 0 }}
              data={users}
              keyExtractor={(item) => item.userUuid}
              renderItem={renderMemberItem}
            />

            <View style={{
              width: '100%',
              height: 50,
              justifyContent: 'center',
            }}>
              <TouchableOpacity
                style={styles.leaveRoomButton}
                onPress={leaveRoom}
              >
                <Icon name="logout" size={30} color="black" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <FlatList
        ref={flatListRef}
        style={styles.chatList}
        data={chatData}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
        inverted={true}
        onScroll ={(event) => {
          setIsAtBottom(event.nativeEvent.contentOffset.y > 300);
        }}
        onEndReached={() => {
          fetchPrevChatData();
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, {height: inputHeight}]}
          value={message}
          onChangeText={setMessage}
          multiline={true}
          onContentSizeChange={(e) =>
            setInputHeight(Math.max(40, Math.min(120, e.nativeEvent.contentSize.height)))
          }
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={msgSend}
        >
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

        {isAtBottom && (
          <TouchableOpacity
            style={styles.goDownButton}
            onPress={() => flatListRef.current?.scrollToIndex({ index: 0, animated: false })}
          >
            <Icon name="arrow-drop-down" size={40} color="white" />
          </TouchableOpacity>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    height: '100%',
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlay2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer2: {
    width: '80%',
    height: '60%',
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  leaveRoomButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
  },
  settlementRequest: {
    backgroundColor: '#f2f3f5',
    padding: 25,
    margin: 15,
    paddingBottom: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  messageBubble: {
    backgroundColor: '#f2f3f5',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    maxWidth: 250,
  },
  systemMessageBubble: {
    paddingVertical: 7,
    width: '100%',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    backgroundColor: '#ddd',
    borderRadius: 18,
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    textAlignVertical: 'top',
    borderWidth: 0.5,
    backgroundColor: '#f2f3f5',
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  goDownButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: 'black',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
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
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#f2f3f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#999',
  },
  locationBlock: {
    width: '42%',
    alignItems: 'center',
  },
  location: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginVertical: 4,
  },
  subText: {
    fontSize: 10,
    color: '#666',
  },
  arrow: {
    fontSize: 18,
    color: '#333',
  },
  extraInfo: {
    fontSize: 12,
    color: '#444',
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 18,
    letterSpacing: -0.6,
    color: 'black',
    textAlign: 'left',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  primaryButton: {
    backgroundColor: '#000',
    width: 150,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userRow: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  grayButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
});

export default ChatScreen;
