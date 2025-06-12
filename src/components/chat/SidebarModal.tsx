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
} from 'react-native';
import {useEffect, useRef} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {ChatRoomInfo} from '@interfaces/paxi';
import RoomInfoBox from '@components/chat/RoomInfoBox';
import ParticipantItem from '@components/chat/ParticipantsItem';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';

interface SidebarModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  roomData: ChatRoomInfo;
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewChat'>;
  // leaveRoom?: () => void;
}

const SidebarModal = ({
  modalVisible,
  setModalVisible,
  roomData,
  navigation,
}: // leaveRoom,
SidebarModalProps) => {
  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(screenWidth * 0.8)).current;

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenWidth * 0.8,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  useEffect(() => {
    if (modalVisible) {
      // 모달이 열릴 때 애니메이션 값을 초기 위치로 설정 후 슬라이드
      slideAnim.setValue(screenWidth * 0.8);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible, slideAnim, screenWidth]);

  console.log('modal', roomData);

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{translateX: slideAnim}],
            },
          ]}>
          <SafeAreaView style={styles.modalContent}>
            <Pressable style={styles.innerContent} onPress={() => {}}>
              <RoomInfoBox roomData={roomData} />

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
              </View>

              {/* 참여자 목록 */}
              <View style={{flex: 1, width: '100%'}}>
                {roomData?.room_users?.map(user => (
                  <ParticipantItem userInfo={user} key={user.userUuid} />
                ))}
              </View>

              {/* 정산 요청 버튼 */}
              <View style={styles.rowCenter}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Settlement', {
                      roomUuid: roomData.uuid,
                    });
                  }}>
                  <Text style={styles.buttonText}>정산 요청하기</Text>
                </TouchableOpacity>
              </View>

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
                  onPress={() => {}}>
                  <Icon name="logout" size={30} color="black" />
                </TouchableOpacity>
              </View>
            </Pressable>
          </SafeAreaView>
        </Animated.View>
      </Pressable>
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
    backgroundColor: '#000',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    width: '100%',
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
