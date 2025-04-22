import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  Modal,
  TextInput,
  StyleSheet,
  SectionList,
  FlatList,
  ListRenderItemInfo,
  Alert,
  ToastAndroid,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  avatar: any;
  isMe: boolean;
}

interface ChatSection {
  title: string;
  data: ChatMessage[];
}

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
};

const members = [
  { id: '1', name: '건방진 포닉스', paid: true, crown: true },
  { id: '2', name: '소심한 포닉스', paid: true, crown: false },
  { id: '3', name: '간절한 포닉스', paid: false, crown: false },
  { id: '4', name: '시니컬한 포닉스', paid: false, crown: false },
];

const messagesData: ChatSection[] = [
  {
    title: "2025-04-12",
    data: [
      {
        id: '1',
        user: '건방진 포닉스',
        text: '돈 빨리 보내세요',
        avatar: require('../../assets/popo.png'),
        isMe: false,
      },
      {
        id: '2',
        user: 'Me',
        text: 'ㄷㄷㄷ',
        avatar: require('../../assets/popo.png'),
        isMe: true,
      },
    ],
  },
];

const renderSettlementItem = () => {
  return (
    <View />
  );
}

const renderItem = ({ item }: ListRenderItemInfo<ChatMessage>) => {
  const alignment = item.isMe ? 'flex-end' : 'flex-start';
  return (
    <View style={{ alignSelf: alignment }}>
      {!item.isMe &&
        <View style={[styles.messageContainer]}>
          <Image source={item.avatar} style={styles.avatar} />
          <View>
            <Text style={{
              fontSize: 13,
              letterSpacing: -0.4,
              color: "#000",
              marginBottom: 4,
            }}>건방진 포닉스</Text>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 5,
            }}>
              <View style={styles.messageBubble}>
                <Text style={{
                  fontSize: 15,
                  letterSpacing: -0.4,
                  color: "#000",
                  marginBottom: 4,
                }}>{item.text}</Text>
              </View>

              <View>
                <Text style={{
                  color: '#4f4f4f',
                  fontSize: 12,
                  letterSpacing: -0.3,
                  fontWeight: "bold",
                }}>2</Text>
                <Text style={{
                  color: '#9b9b9b',
                  fontSize: 12,
                  letterSpacing: -0.3,
                  fontWeight: "bold",
                }}>오후 10:58</Text>
              </View>
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
          <View>
            <Text style={{
              color: '#4f4f4f',
              fontSize: 12,
              letterSpacing: -0.3,
              fontWeight: "bold",
            }}>2</Text>
            <Text style={{
              color: '#9b9b9b',
              fontSize: 12,
              letterSpacing: -0.3,
              fontWeight: "bold",
            }}>오후 10:58</Text>
          </View>

          <View style={styles.messageBubble}>
            <Text style={{
              fontSize: 15,
              letterSpacing: -0.4,
              color: "#000",
              marginBottom: 4,
            }}>{item.text}</Text>
          </View>
        </View>
      }
    </View>
  );
};

async function connectWebSocket(): Promise<WebSocket> {
  const token = (await EncryptedStorage.getItem('auth_token')) ?? '';

  const response = await axios.get('https://api.paxi-dev.popo.poapper.club/auth/me', {
    headers: {
      Authorization: `${token}`,
    },
    withCredentials: true, // 이거 중요
  });

  Alert.alert('웹소켓 연결', `${response.status}`);

  const socket = new WebSocket('ws://api.paxi-dev.popo.poapper.club:4001', '', {
    headers: {
      Authentication: token,
    },
  });

  socket.addEventListener('open', () => {
    console.log('웹소켓 연결 완료');
  });

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.event === 'newMessage') {
      console.log('새 메시지:', data.payload);
    }
  });

  socket.addEventListener('error', (error) => {
    console.error('웹소켓 에러 발생:', error);
  });

  socket.addEventListener('close', () => {
    console.log('웹소켓 연결 종료');
  });

  return socket;
}  

function joinRoom(socket: WebSocket, roomUuid: string) {
  const payload = {
    event: 'joinRoom',
    payload: {
      roomUuid: roomUuid,
    },
  };

  socket.send(JSON.stringify(payload));
}

function leaveRoom(socket: WebSocket, roomUuid: string) {
  const payload = {
    event: 'leaveRoom',
    payload: roomUuid,
  };

  socket.send(JSON.stringify(payload));
}

function sendMessage(socket: WebSocket | undefined, roomUuid: string, message: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('소켓이 아직 연결되지 않았습니다.');
    return;
  }

  const payload = {
    event: 'sendMessage',
    payload: {
      roomUuid,
      message,
    },
  };
  
  socket.send(JSON.stringify(payload));
}

const ChatScreen = ({navigation}: ChatScreenProps) => {
  const [message, setMessage] = useState<string>('');
  const [inputHeight, setInputHeight] = useState<Int32>(40);
  const [modalVisible, setModalVisible] = useState(false);
  const [socket, setSocket] = useState<WebSocket>();

  /* 웹 소켓을 설정하는 부분은 주석 처리했습니다.
  useEffect(() => {
    async function initSocket() {
      const ws = await connectWebSocket();
      setSocket(ws);
    }

    initSocket();

    // 컴포넌트 언마운트될 때 소켓 닫기
    return () => {
      socket?.close();
    };
  }, []);
  */
  
  const msgSend = () => {
    if (!message.trim()) return;
    sendMessage(socket, 'roomUuid', message);
    setMessage('');
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
          letterSpacing: -1,
          color: "#000",
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
        }}>방 제목</Text>

        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.headerButton}>채팅방 정보</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
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
                  <Text style={styles.location}>포항역</Text>
                  <Text style={styles.subText}>3월 14일 오전 7시 출발</Text>
                </View>
                <Text style={styles.arrow}>〉</Text>
                <View style={styles.locationBlock}>
                  <Text style={styles.label}>도착지</Text>
                  <Text style={styles.location}>지곡회관</Text>
                  <Text style={styles.subText}>3월 17일 오후 6시 도착</Text>
                </View>
              </View>
              <View style={{
                borderBottomWidth: 1,
                borderColor: '#ddd',
                borderStyle: 'dotted',
                marginTop: 12
              }}/>
              <Text style={styles.extraInfo}>짐이 많아 트렁크 사용에 제한이 있을 수 있습니다ㅜㅜ</Text>
            </View>

            <View style={styles.rowBetween}>
              <View style={styles.rowCenter}>
                <Text style={styles.countText}>👤 4</Text>
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Settlement', { roomUuid: 'va', payerUuid: 'va' })}
              >
                <Text style={styles.buttonText}>정산 요청하기</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              style={{ width: '100%', paddingHorizontal: 0 }}
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.userRow}>
                  <View style={styles.rowCenter}>
                    {/* 프로필 사진 대체 원 */}
                    <View style={styles.avatarCircle} />
                    <View>
                      <View style={styles.nameRow}>
                        {item.crown}
                        <Text style={styles.nameText}>{item.name}</Text>
                      </View>
                      {item.paid && <Text style={styles.subText}>송금 완료</Text>}
                    </View>
                  </View>
                  <View style={styles.rowCenter}>
                    <TouchableOpacity style={styles.grayButton}>
                      <Text>추방</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.grayButton}>
                      <Text>신고</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <SectionList
        style={styles.chatList}
        sections={messagesData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, {height: inputHeight,}]}
          value={message}
          onChangeText={setMessage}
          multiline={true}
          onContentSizeChange={(e) =>
            setInputHeight(Math.max(40, Math.min(120, e.nativeEvent.contentSize.height)))
          }
        />
        <TouchableOpacity style={styles.sendButton} onPress={msgSend}>
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
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
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    maxWidth: '70%',
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
    fontFamily: "Pretendard",
    color: "black",
    textAlign: "left",
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
