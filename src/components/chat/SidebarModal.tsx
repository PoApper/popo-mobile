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
import OwnerTransferModal from './OwnerTransferModal';
import SettlementCompleteConfirmModal from '@components/chat/SettlementCompleteConfirmModal';

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
  const [transferModalVisible, setTransferModalVisible] =
    useState<boolean>(false);
  const [settlementConfirmVisible, setSettlementConfirmVisible] =
    useState<boolean>(false);

  const isIamOwner = myUuid === roomData.ownerUuid;
  const roomPeopleCnt = roomData.currentParticipant;
  const isSettlementRequestExist =
    roomData.payerUuid != null && roomData.payerUuid.length > 0;
  const isIamPayer = roomData.payerUuid === myUuid;

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
  }, [modalVisible, slideAnim, screenWidth, opacityAnim]);

  const handleSettlementPress = () => {
    if (isIamPayer || !roomData.payerUuid) {
      setModalVisible(false);
      navigation.navigate('Settlement', {
        roomUuid: roomData.uuid,
      });
    }
  };

  const handleSettlementDeletePress = () => {
    Alert.alert('정산 삭제', '정산 요청을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: () => {
          paxi_api.delete(`/room/${roomData.uuid}/settlement`).then(res => {
            if (res.status !== 200) {
              Alert.alert('실패', `response: ${res.status}`);
            } else {
              Alert.alert('성공', '정산 요청을 삭제했습니다.');
            }
          });
        },
      },
    ]);
  };

  const performLeave = async () => {
    if (roomPeopleCnt === 1) {
      // Last participant -> delete room
      return paxi_api
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
            `채팅방 나가기에 실패했습니다.\n${
              err.response?.data?.message || ''
            }`,
          );
        });
    } else {
      // Not a last participant -> leave
      return paxi_api
        .put(`/room/leave/${roomData.uuid}`)
        .then(() => {
          setModalVisible(false);
          navigation.navigate('Main', {tab: 'MyReservation'});
        })
        .catch(err => {
          console.error('채팅방 나가기 실패', err);
          Alert.alert(
            '채팅방 나가기 실패',
            `채팅방 나가기에 실패했습니다.\n${
              err.response?.data?.message || ''
            }`,
          );
        });
    }
  };

  const onSettlementEnd = () => {
    paxi_api
      .patch(`/room/${roomData.uuid}/complete`)
      .then(() => {
        Alert.alert('정산 완료', '정산이 완료되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              setModalVisible(false);
              navigation.navigate('Main', {
                tab: 'MyReservation',
              });
            },
          },
        ]);
      })
      .catch(err => {
        console.error('정산 완료 실패', err);
        Alert.alert(
          '정산 완료 실패',
          `정산 완료에 실패했습니다.\n${err.response?.data?.message || ''}`,
        );
      });
  };

  const handleLeavePress = () => {
    // If owner and there are other participants, open transfer modal first
    if (isIamOwner && roomPeopleCnt > 1) {
      setTransferModalVisible(true);
      return;
    }

    Alert.alert('채팅방 나가기', '채팅방을 나가시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '나가기',
        onPress: () => {
          performLeave();
        },
      },
    ]);
  };

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
                  {(roomData.payerUuid?.length ?? 0) === 0 && (
                    <TouchableOpacity
                      style={[
                        styles.settlementButton,
                        {
                          marginLeft: 20,
                          backgroundColor: isDarkMode ? '#333' : '#000',
                          opacity: roomData.currentParticipant === 1 ? 0.5 : 1,
                        },
                      ]}
                      onPress={() => {
                        if (roomData.currentParticipant === 1) {
                          Alert.alert(
                            '혼자 있는 채팅방',
                            '혼자 있는 채팅방은 정산 요청이 불가능합니다.',
                          );
                        } else {
                          handleSettlementPress();
                        }
                      }}>
                      <Text style={[styles.buttonText]}>정산 요청하기</Text>
                    </TouchableOpacity>
                  )}
                  {(roomData.payerUuid?.length ?? 0) > 0 && (
                    <>
                      {roomData.payerUuid === myUuid && (
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 5,
                            flex: 1,
                            marginLeft: 20,
                          }}>
                          <TouchableOpacity
                            style={[
                              styles.settlementButton,
                              {backgroundColor: isDarkMode ? '#333' : '#000'},
                            ]}
                            onPress={handleSettlementPress}>
                            <Text style={[styles.buttonText]}>정산 수정</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.settlementButton,
                              {backgroundColor: isDarkMode ? '#333' : '#000'},
                            ]}
                            onPress={handleSettlementDeletePress}>
                            <Text style={[styles.buttonText]}>정산 삭제</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {roomData.payerUuid !== myUuid && (
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 5,
                            flex: 1,
                            marginLeft: 20,
                          }}>
                          <View
                            style={[
                              styles.settlementButton,
                              {backgroundColor: isDarkMode ? '#333' : '#000'},
                            ]}>
                            <Text style={[styles.buttonText]}>
                              정산을 진행 중입니다
                            </Text>
                          </View>
                        </View>
                      )}
                    </>
                  )}
                </View>

                {/* 참여자 목록 */}
                <View
                  style={{flex: 1, width: '100%', gap: 10, marginBottom: 10}}>
                  {roomData?.roomUsers?.map(
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

                {/* 채팅방 나가기/완료하기 버튼 */}
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    style={[
                      styles.leaveRoomButton,
                      {opacity: isSettlementRequestExist ? 0.5 : 1},
                    ]}
                    onPress={() => {
                      if (isSettlementRequestExist) {
                        Alert.alert(
                          '생성된 정산 요청이 있습니다.',
                          '정산 요청이 있는 채팅방은 나갈 수 없습니다.\n정산이 완료된 후, 정산자가 채팅방을 직접 마감해주세요.',
                        );
                      } else {
                        handleLeavePress();
                      }
                    }}>
                    <Icon
                      name="logout"
                      size={30}
                      color={textColor(isDarkMode)}
                    />
                  </TouchableOpacity>

                  {/* 정산 완료 버튼 */}
                  {isIamPayer && (
                    <TouchableOpacity
                      style={[
                        styles.completeSettlementButton,
                        {backgroundColor: isDarkMode ? '#333' : '#000'},
                      ]}
                      onPress={() => setSettlementConfirmVisible(true)}>
                      <Text style={styles.completeSettlementButtonText}>
                        정산 완료
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <OwnerTransferModal
                  modalVisible={transferModalVisible}
                  setModalVisible={setTransferModalVisible}
                  roomData={roomData}
                  myUuid={myUuid}
                  navigation={navigation}
                />
                <SettlementCompleteConfirmModal
                  visible={settlementConfirmVisible}
                  onClose={() => setSettlementConfirmVisible(false)}
                  onConfirm={() => {
                    setSettlementConfirmVisible(false);
                    onSettlementEnd();
                  }}
                />
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
  settlementButton: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  completeSettlementButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeSettlementButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SidebarModal;
