import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  useColorScheme,
} from 'react-native';

import { UserData } from '@interfaces/paxi';
import { TextInput } from 'react-native-gesture-handler';
import paxi_api from '@utils/paxi_api';
import { backgroundColor, textColor } from '@styles/default';

interface ReportModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  roomUuid: string;
  userData: UserData | undefined;
}

const ReportModal = ({
  modalVisible,
  setModalVisible,
  roomUuid,
  userData,
}: ReportModalProps) => {
  const modalWidth = Dimensions.get('window').width * 0.75;
  const modalHeight = Dimensions.get('window').height * 0.3;
  const isDarkMode = useColorScheme() === 'dark';

  const [reportText, setReportText] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setReportText('');
    setModalVisible(false);
  };

  const handleReport = (reason: string) => {
    if (userData === undefined) {
      return;
    }
    paxi_api
      .post('report', {
        targetRoomUuid: roomUuid,
        targetUserUuid: userData?.userUuid,
        reason: reason,
      })
      .then(() => {
        Alert.alert('처리 완료', '요청이 처리되었습니다.');
      })
      .catch(() => {
        Alert.alert('신고 실패', '신고 요청에 실패했습니다.');
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
      onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <SafeAreaView style={styles.modalContent}>
          {isVisible && (
            <Pressable
              style={[
                {
                  width: modalWidth, height: modalHeight, backgroundColor: backgroundColor(isDarkMode),
                },
                styles.innerContent,
              ]}
              onPress={() => { }}>
              <View style={{ flex: 1, width: '100%', marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    marginBottom: 10,
                  }}>
                  <Text
                    style={[styles.modalTitle, { color: textColor(isDarkMode) }]}>
                    신고하기
                  </Text>
                </View>
                <Text style={{ marginBottom: 10, color: textColor(isDarkMode) }}>
                  <Text style={{ color: 'red' }}>{userData?.nickname}</Text>님을
                  {'\n'}
                  정말로 신고하실건가요?
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
                  placeholder="사유를 입력해주세요. (200자 이내)"
                  placeholderTextColor="#999"
                  multiline={true}
                  maxLength={200}
                  scrollEnabled={true}
                />
              </View>

              {/* 신고 요청 버튼 */}
              <View style={styles.buttonView}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { backgroundColor: isDarkMode ? '#222' : '#f2f2f2' },
                  ]}
                  onPress={() => handleClose()}>
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: textColor(isDarkMode) },
                    ]}>
                    취소
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.reportButton,
                    { backgroundColor: isDarkMode ? '#333' : 'black' },
                  ]}
                  disabled={reportText.length === 0}
                  onPress={() => {
                    handleReport(reportText);
                    handleClose();
                  }}>
                  <Text style={styles.reportButtonText}>신고</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          )}
        </SafeAreaView >
      </Pressable >
    </Modal >
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
    top: 150,
    alignItems: 'center',
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
  textInput: {
    flex: 1,
    width: '100%',
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
  reportButton: {
    paddingHorizontal: 20,
    flex: 1,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
  },
  reportButtonText: {
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

export default ReportModal;
