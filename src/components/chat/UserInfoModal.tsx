import {
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
import {useTranslation} from 'react-i18next';

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
  const {t} = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleReport = async () => {
    // TODO: 바로 신고하지 말고 신고 사유를 받는 모달 하나 띄우기
    const res = await paxi_api.post('/report', {
      targetRoomUuid: roomUuid,
      targetUserUuid: msgData.senderUuid,
      reason: '메시지 작성: ' + msgData.message,
    });
    if (res.status !== 201) {
      Alert.alert(t('common.failure'), t('paxi.member.reportMessageFailed'));
      return;
    } else {
      handleClose();
      Alert.alert(t('common.success'), t('paxi.member.reportMessageDone'));
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
      Alert.alert(t('common.failure'), t('paxi.member.kickUserFailed'));
      return;
    } else {
      handleClose();
      Alert.alert(t('common.success'), t('paxi.member.kickUserDone'));
    }
  };

  if (!modalVisible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
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
                {t('paxi.member.selectedMessage')}
              </Text>
              <Text
                numberOfLines={3}
                ellipsizeMode={'tail'}
                style={[
                  styles.msgText,
                  {
                    backgroundColor: isDarkMode ? '#222' : '#eee',
                    color: msgData.isDeleted
                      ? '#9b9b9b'
                      : textColor(isDarkMode),
                    fontStyle: msgData.isDeleted ? 'italic' : 'normal',
                  },
                ]}>
                {msgData.isDeleted
                  ? t('paxi.member.deletedMessage')
                  : msgData.message}
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
                  <Text style={styles.buttonText}>
                    {t('paxi.member.reportTitle')}
                  </Text>
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
                    <Text style={styles.buttonText}>
                      {t('paxi.member.kickTitle')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Pressable>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
