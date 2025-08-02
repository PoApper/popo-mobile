import {
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
  useColorScheme,
} from 'react-native';
import {useState, useEffect, useRef} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {ChatRoomInfo, UserData} from '@interfaces/paxi';
import RoomInfoBox from '@components/chat/RoomInfoBox';
import ParticipantItem from '@components/chat/ParticipantsItem';
import ReportModal from '@components/chat/ReportModal';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import BanModal from '@components/chat/BanModal';
import {backgroundColor, textColor} from '@styles/default';

interface SidebarModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  roomData: ChatRoomInfo;
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewChat'>;
  myUuid: string;
  // leaveRoom?: () => void;
}

const SidebarModal = ({
  modalVisible,
  setModalVisible,
  roomData,
  navigation,
  myUuid,
}: // leaveRoom,
SidebarModalProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(screenWidth * 0.8)).current;

  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [banModalVisible, setBanModalVisible] = useState<boolean>(false);
  const [selectedUserData, setSelectedUserData] = useState<UserData>();
  const [initialRenderDone, setInitialRenderDone] = useState(false);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  const isIamOwner = myUuid === roomData.ownerUuid;
  const roomPeopleCnt = roomData.currentParticipant;

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenWidth * 0.8,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      requestAnimationFrame(() => {
        setModalVisible(false);
      });
    });
  };

  useEffect(() => {
    if (modalVisible) {
      // 모달이 열릴 때 애니메이션 값을 초기 위치로 설정 후 슬라이드
      slideAnim.setValue(screenWidth * 0.8);
      opacityAnim.setValue(0);

      const timeout = setTimeout(() => setIsVisible(true), 10);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 10,
          useNativeDriver: true,
        }),
      ]).start();

      setInitialRenderDone(true);
      return () => clearTimeout(timeout);
    } else {
      setInitialRenderDone(false);
    }
  }, [modalVisible, slideAnim, screenWidth]);

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}>
      {initialRenderDone && isVisible && (
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{translateX: slideAnim}],
                opacity: opacityAnim,
                backgroundColor: backgroundColor(isDarkMode),
              },
            ]}>
            <SafeAreaView style={styles.modalContent}>
              <Pressable style={styles.innerContent} onPress={() => {}}>
                <RoomInfoBox
                  roomData={roomData}
                  navigation={navigation}
                  myUuid={myUuid}
                  setModalVisible={setModalVisible}
                />

                <View
                  style={[
                    styles.rowCenter,
                    {
                      marginBottom: 10,
                      justifyContent: 'flex-start',
                      width: '100%',
                    },
                  ]}>
                  <Icon name="person" size={16} color="gray" />
                  <Text style={styles.countText}>
                    {roomData?.currentParticipant}
                  </Text>

                  {/* 정산 요청 버튼 */}
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      {
                        marginLeft: 20,
                        backgroundColor: isDarkMode ? '#333' : '#000',
                      },
                    ]}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('Settlement', {
                        roomUuid: roomData.uuid,
                      });
                    }}>
                    <Text style={[styles.buttonText]}>정산 요청하기</Text>
                  </TouchableOpacity>
                </View>

                {/* 참여자 목록 */}
                <View
                  style={{flex: 1, width: '100%', gap: 10, marginBottom: 10}}>
                  {roomData?.room_users?.map(
                    user =>
                      user.status === 'JOINED' && (
                        <ParticipantItem
                          userInfo={user}
                          key={user.userUuid}
                          myUuid={myUuid}
                          ownerUuid={roomData.ownerUuid}
                          setReportModal={setReportModalVisible}
                          setBanModal={setBanModalVisible}
                          setSelectedUserData={setSelectedUserData}
                        />
                      ),
                  )}
                </View>

                <ReportModal
                  modalVisible={reportModalVisible}
                  setModalVisible={setReportModalVisible}
                  roomUuid={roomData.uuid}
                  userData={selectedUserData}
                />

                <BanModal
                  modalVisible={banModalVisible}
                  setModalVisible={setBanModalVisible}
                  roomUuid={roomData.uuid}
                  userData={selectedUserData}
                />

                {/* Spacer to push logout button to bottom */}
                <View style={{flex: 1}} />

                {/* 채팅방 나가기/공유하기 버튼 */}
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                  }}>
                  <TouchableOpacity
                    style={styles.leaveRoomButton}
                    onPress={() => {
                      Alert.alert('채팅방 나가기', '채팅방을 나가시겠습니까?', [
                        {text: '취소', style: 'cancel'},
                        {
                          text: '나가기',
                          onPress: () => {
                            if (isIamOwner && roomPeopleCnt == 1) {
                              paxi_api
                                .delete(`/room/${roomData.uuid}`)
                                .then(() => {
                                  setModalVisible(false);
                                  navigation.navigate('Main', {
                                    tab: 'MyReservation',
                                  });
                                })
                                .catch(err => {
                                  console.error(
                                    `자신이 소유한 채팅방(${roomData.uuid}) 나가기 실패`,
                                    err,
                                  );
                                  Alert.alert(
                                    '채팅방 나가기 실패',
                                    `채팅방 나가기에 실패했습니다.\n${err.response.data.message}`,
                                  );
                                });
                            } else {
                              paxi_api
                                .put(`/room/leave/${roomData.uuid}`)
                                .then(() => {
                                  setModalVisible(false);
                                  navigation.navigate('Home');
                                })
                                .catch(err => {
                                  console.error('채팅방 나가기 실패', err);
                                  Alert.alert(
                                    '채팅방 나가기 실패',
                                    `채팅방 나가기에 실패했습니다.\n${err.response.data.message}`,
                                  );
                                });
                            }
                          },
                        },
                      ]);
                    }}>
                    <Icon
                      name="logout"
                      size={30}
                      color={textColor(isDarkMode)}
                    />
                  </TouchableOpacity>
                </View>
              </Pressable>
            </SafeAreaView>
          </Animated.View>
        </Pressable>
      )}
    </Modal>
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
  },
  modalContent: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
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
    width: '100%',
  },
  countText: {
    fontSize: 14,
    color: 'gray',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#000',
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

export default SidebarModal;
