import {
  Modal,
  Pressable,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  Text,
  Image,
  Alert,
} from 'react-native';

import {MessageData} from '@interfaces/paxi';
import {backgroundColor, textColor} from '@styles/default';
import {getColor} from '@utils/userchat-background';
import paxi_api from '@utils/paxi_api';

interface UserInfoModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  msgData: MessageData;
  roomUuid: string;
  isOwner: boolean;
}

const UserInfoModal = ({
  modalVisible,
  setModalVisible,
  msgData,
  roomUuid,
  isOwner,
}: UserInfoModalProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleReport = async () => {
    const res = await paxi_api.post('/report', {
      targetRoomUuid: roomUuid,
      targetUserUuid: msgData.senderUuid,
      reason: '메시지 작성: ' + msgData.message,
    });
    if (res.status !== 201) {
      Alert.alert('실패', '메시지 신고에 실패했습니다.');
      return;
    } else {
      handleClose();
      Alert.alert('성공', '성공적으로 메시지를 신고했습니다.');
    }
  };

  const handleBan = async () => {
    if (!isOwner) {
      return;
    }
    const res = await paxi_api.put(`/room/kick/${roomUuid}`, {
      kickedUserUuid: msgData.senderUuid,
      reason: '메시지 작성: ' + msgData.message,
    });
    if (res.status !== 200) {
      Alert.alert('실패', '유저 강퇴에 실패했습니다.');
      return;
    } else {
      handleClose();
      Alert.alert('성공', '성공적으로 유저를 강퇴했습니다.');
    }
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: backgroundColor(isDarkMode),
            },
          ]}>
          <SafeAreaView style={styles.modalContent}>
            <Pressable style={styles.innerContent} onPress={() => {}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}>
                <Image
                  source={require('../../../assets/baby_phonix.png')}
                  style={[
                    styles.profileImg,
                    {backgroundColor: getColor(msgData.senderNickname ?? '')},
                  ]}
                  resizeMode="contain"
                />

                <Text
                  style={[styles.userNameText, {color: textColor(isDarkMode)}]}>
                  {msgData.senderNickname}
                </Text>
                <Text
                  style={{
                    color: textColor(isDarkMode),
                    textAlign: 'left',
                    width: '100%',
                    paddingHorizontal: 5,
                    fontSize: 15,
                    marginBottom: 5,
                    fontWeight: '400',
                  }}>
                  선택된 메시지
                </Text>
                <Text
                  numberOfLines={3}
                  ellipsizeMode={'tail'}
                  style={[
                    styles.msgText,
                    {
                      backgroundColor: isDarkMode ? '#222' : '#eee',
                      color: textColor(isDarkMode),
                    },
                  ]}>
                  {msgData.message}
                </Text>

                <View
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 5,
                  }}>
                  <TouchableOpacity
                    onPress={handleReport}
                    style={[
                      styles.button,
                      {
                        backgroundColor: isDarkMode ? '#333' : 'black',
                      },
                    ]}>
                    <Text style={styles.buttonText}>신고하기</Text>
                  </TouchableOpacity>
                  {isOwner && (
                    <TouchableOpacity
                      onPress={handleBan}
                      style={[
                        styles.button,
                        {
                          backgroundColor: isDarkMode ? '#333' : 'black',
                        },
                      ]}>
                      <Text style={styles.buttonText}>추방하기</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Pressable>
          </SafeAreaView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    height: 280,
    borderRadius: 5,
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
  userNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  msgText: {
    width: '100%',
    height: 70,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserInfoModal;
