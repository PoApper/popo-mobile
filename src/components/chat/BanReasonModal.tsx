import {
  Modal,
  Pressable,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  View,
  Text,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MyRoomData, UserData} from '@interfaces/paxi';
import {backgroundColor, textColor} from '@styles/default';
import {useEffect, useState} from 'react';
import paxi_api from '@utils/paxi_api';

interface BanReasonModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  roomData: MyRoomData;
  userData: UserData | undefined;
}

const BanReasonModal = ({
  modalVisible,
  setModalVisible,
  roomData,
  userData,
}: BanReasonModalProps) => {
  const modalWidth = Dimensions.get('window').width * 0.75;

  const isDarkMode = useColorScheme() === 'dark';
  const roomUuid = roomData.uuid;

  const [isVisible, setIsVisible] = useState(false);
  const [reportText, setReportText] = useState<string>('');

  const handleClose = () => {
    setReportText('');
    setModalVisible(false);
  };

  const handleReverseReport = (reason: string) => {
    if (userData === undefined) {
      return;
    }
    paxi_api
      .post('/report', {
        targetRoomUuid: roomUuid,
        targetUserUuid: roomData.ownerUuid,
        reason: `추방된 유저의 신고: ${reason}`,
      })
      .then(_ => {
        Alert.alert(
          '처리 완료',
          '이의 제기 요청이 정상적으로 처리되었습니다. 관리자가 신속히 대응한 후 메일로 알려드리겠습니다.',
        );
      })
      .catch(e => {
        Alert.alert('신고 실패', e.response.data.message);
      });
  };

  useEffect(() => {
    if (modalVisible) {
      const timeout = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [modalVisible]);

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === 'android'}
      hardwareAccelerated>
      {/* TODO: nested pressable onStartShouldSetResponder 옵션 사용으로 변경 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <Pressable style={styles.overlay} onPress={handleClose}>
          <SafeAreaView style={styles.modalContent}>
            {isVisible && (
              <Pressable
                style={[
                  {
                    width: modalWidth,
                    backgroundColor: backgroundColor(isDarkMode),
                  },
                  styles.innerContent,
                ]}
                onPress={() => {}}>
                <View style={{width: '100%', marginBottom: 20}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignContent: 'center',
                      marginBottom: 10,
                    }}>
                    <Text
                      style={[
                        styles.modalTitle,
                        {color: textColor(isDarkMode)},
                      ]}>
                      추방 사유
                    </Text>
                  </View>
                  <Text
                    style={{marginBottom: 10, color: textColor(isDarkMode)}}>
                    추방 사유는 다음과 같습니다:
                  </Text>
                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={[
                      styles.kickedReasonText,
                      {
                        backgroundColor: isDarkMode ? '#555' : '#eee',
                        color: textColor(isDarkMode),
                      },
                    ]}>
                    {roomData.kickedReason}
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: textColor(isDarkMode),
                        borderColor: isDarkMode ? '#999' : '#e0e0e0',
                      },
                    ]}
                    value={reportText}
                    onChangeText={setReportText}
                    placeholder="추방 이의 신고 사유를 입력해주세요. 신고는 현재 방장을 기준으로 이루어집니다. (200자 이내)"
                    placeholderTextColor="#999"
                    multiline={true}
                    maxLength={200}
                    scrollEnabled={true}
                  />
                </View>

                {/* 추방 요청 버튼 */}
                <View style={styles.buttonView}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      {backgroundColor: isDarkMode ? '#222' : '#f2f2f2'},
                    ]}
                    onPress={handleClose}>
                    <Text
                      style={[
                        styles.cancelButtonText,
                        {color: textColor(isDarkMode)},
                      ]}>
                      닫기
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.banButton,
                      {backgroundColor: isDarkMode ? '#333' : 'black'},
                    ]}
                    disabled={reportText.length === 0}
                    onPress={() => {
                      handleReverseReport(reportText);
                      handleClose();
                    }}>
                    <Text style={styles.banButtonText}>이의 제기하기</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            )}
          </SafeAreaView>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContent: {
    borderRadius: 10,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  kickedReasonText: {
    maxHeight: 70,
    textAlignVertical: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  textInput: {
    width: '100%',
    height: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 12,
  },
  buttonView: {
    flexDirection: 'row',
    gap: 10,
  },
  banButton: {
    paddingHorizontal: 20,
    flex: 1,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
  },
  banButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingHorizontal: 20,
    flex: 1,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
});

export default BanReasonModal;
