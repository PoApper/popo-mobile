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
  const [transferModalVisible, setTransferModalVisible] =
    useState<boolean>(false);
  const [selectedNewOwnerUuid, setSelectedNewOwnerUuid] = useState<
    string | undefined
  >(undefined);

  const isIamOwner = myUuid === roomData.ownerUuid;
  const roomPeopleCnt = roomData.currentParticipant;
  const isSettlementRequestExist =
    roomData.payerUuid != null && roomData.payerUuid.length > 0;
  const isIamPayer = roomData.payerUuid === myUuid;

  const eligibleNextOwners: UserData[] =
    roomData?.room_users?.filter(
      user => user.status === 'JOINED' && user.userUuid !== myUuid,
    ) || [];

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
          navigation.navigate('Home');
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

  const handleConfirmTransferAndLeave = async () => {
    if (!selectedNewOwnerUuid) {
      Alert.alert('알림', '다음 방장을 선택해주세요.');
      return;
    }

    try {
      setTransferModalVisible(false);
      await paxi_api.post(`room/delegate/${roomData.uuid}`, {
        uuid: selectedNewOwnerUuid,
      });
      await performLeave(); // TODO: 문제 발생.
    } catch (err: any) {
      console.error('방장 위임 실패', err);
      Alert.alert(
        '방장 위임 실패',
        `방장 위임 중 오류가 발생했습니다.\n${
          err.response?.data?.message || ''
        }`,
      );
    }
  };

  const handleLeavePress = () => {
    // If owner and there are other participants, open transfer modal first
    if (isIamOwner && roomPeopleCnt > 1) {
      setSelectedNewOwnerUuid(undefined);
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
    <>
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
                          },
                        ]}
                        onPress={handleSettlementPress}>
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
                      onPress={handleLeavePress}>
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
      {/* Owner transfer modal */}
      <Modal
        transparent={true}
        visible={transferModalVisible}
        onRequestClose={() => setTransferModalVisible(false)}>
        <Pressable
          style={styles.overlay2}
          onPress={() => setTransferModalVisible(false)}>
          <Pressable
            style={[
              styles.modalContainer2,
              {backgroundColor: backgroundColor(isDarkMode)},
            ]}
            onPress={() => {}}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
                color: textColor(isDarkMode),
              }}>
              방장 위임
            </Text>
            <Text
              style={{
                fontSize: 12,
                marginBottom: 16,
                color: isDarkMode ? '#aaa' : '#666',
              }}>
              나가기 전에 다음 방장을 선택하세요.
            </Text>
            <View style={{width: '100%', gap: 8, flexGrow: 0, maxHeight: 300}}>
              {eligibleNextOwners.length === 0 ? (
                <Text style={{color: textColor(isDarkMode)}}>
                  위임할 수 있는 참여자가 없습니다.
                </Text>
              ) : (
                eligibleNextOwners.map(user => (
                  <TouchableOpacity
                    key={user.userUuid}
                    onPress={() => setSelectedNewOwnerUuid(user.userUuid)}
                    style={[
                      styles.userRow,
                      {
                        backgroundColor: backgroundColor(isDarkMode),
                        borderWidth: 1,
                        borderColor:
                          selectedNewOwnerUuid === user.userUuid
                            ? isDarkMode
                              ? '#666'
                              : '#ccc'
                            : 'transparent',
                        paddingHorizontal: 10,
                      },
                    ]}>
                    <View style={styles.rowCenter}>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          marginRight: 10,
                          borderWidth: 1,
                          borderColor: isDarkMode ? '#666' : '#ccc',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor:
                            selectedNewOwnerUuid === user.userUuid
                              ? isDarkMode
                                ? '#555'
                                : '#ddd'
                              : 'transparent',
                        }}>
                        {selectedNewOwnerUuid === user.userUuid ? (
                          <Icon
                            name="check"
                            size={14}
                            color={isDarkMode ? '#ddd' : '#333'}
                          />
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.nameText,
                          {color: textColor(isDarkMode)},
                        ]}>
                        {user.nickname}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={[styles.rowBetween]}>
              <TouchableOpacity
                style={[
                  styles.cancelTransferButton,
                  {backgroundColor: isDarkMode ? '#222' : '#f2f2f2'},
                ]}
                onPress={() => setTransferModalVisible(false)}>
                <Text
                  style={{color: textColor(isDarkMode), fontWeight: 'bold'}}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quitWithTransferButton,
                  {backgroundColor: isDarkMode ? '#333' : 'black'},
                ]}
                onPress={handleConfirmTransferAndLeave}
                disabled={eligibleNextOwners.length === 0}>
                <Text style={styles.buttonText}>위임 후 나가기</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
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
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
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
  cancelTransferButton: {
    paddingHorizontal: 10,
    width: '48%',
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  quitWithTransferButton: {
    paddingHorizontal: 10,
    width: '48%',
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
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
