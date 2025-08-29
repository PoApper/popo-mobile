import {
  Modal,
  Pressable,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {backgroundColor, textColor} from '@styles/default';
import {useEffect, useState} from 'react';
import {ReportData} from './ReportDataCard';

interface ReportProgressModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  reportData: ReportData;
}

const InfoRow = ({
  isDarkMode,
  label,
  value,
}: {
  isDarkMode: boolean;
  label: string;
  value: string;
}) => (
  <View style={{flexDirection: 'row', marginBottom: 6}}>
    <Text
      numberOfLines={3}
      ellipsizeMode="tail"
      style={{fontWeight: 'bold', color: textColor(isDarkMode), width: 50}}>
      {label}
    </Text>
    <Text style={{color: textColor(isDarkMode), flex: 1}}>{value}</Text>
  </View>
);

const ReportProgressModal = ({
  modalVisible,
  setModalVisible,
  reportData,
}: ReportProgressModalProps) => {
  const modalWidth = Dimensions.get('window').width * 0.85;
  const isDarkMode = useColorScheme() === 'dark';

  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setModalVisible(false);
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
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{flex: 1}}
          keyboardVerticalOffset={0}>
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
                <View style={{width: '100%'}}>
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
                      신고 정보
                    </Text>
                  </View>
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label="ID"
                    value={reportData.id.toString()}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label="방"
                    value={reportData.targetRoomName}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label="대상"
                    value={reportData.targetUserNickname}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label="사유"
                    value={reportData.reason}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label="날짜"
                    value={new Date(reportData.createdAt).toLocaleString()}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label="상태"
                    value={
                      reportData.status === 'PENDING' ? '처리 중' : '처리 완료'
                    }
                  />
                  {reportData.status === 'COMPLETED' && (
                    <>
                      <View style={styles.divider} />
                      <InfoRow
                        isDarkMode={isDarkMode}
                        label="처리자"
                        value={reportData.resolverName}
                      />
                      <InfoRow
                        isDarkMode={isDarkMode}
                        label="의견"
                        value={reportData.resolutionMessage}
                      />
                    </>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.closeButton,
                      {backgroundColor: isDarkMode ? '#222' : '#f2f2f2'},
                    ]}
                    onPress={handleClose}>
                    <Text
                      style={[
                        styles.closeButtonText,
                        {color: textColor(isDarkMode)},
                      ]}>
                      닫기
                    </Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Pressable>
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
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  closeButtonText: {
    fontWeight: 'bold',
  },
});

export default ReportProgressModal;
