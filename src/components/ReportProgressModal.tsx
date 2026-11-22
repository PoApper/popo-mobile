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
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {backgroundColor, textColor} from '@styles/default';
import {getCurrentLocale} from '@utils/i18n';
import {useEffect, useState} from 'react';
import {ReportData} from './ReportDataCard';

interface ReportProgressModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  reportData: ReportData;
}

// 영어 라벨("Handled by")이 한 줄에 들어가는 폭
const LABEL_WIDTH = 90;

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
      style={{
        fontWeight: 'bold',
        color: textColor(isDarkMode),
        width: LABEL_WIDTH,
      }}>
      {label}
    </Text>
    <Text
      numberOfLines={3}
      ellipsizeMode="tail"
      style={{color: textColor(isDarkMode), flex: 1}}>
      {value}
    </Text>
  </View>
);

const ReportProgressModal = ({
  modalVisible,
  setModalVisible,
  reportData,
}: ReportProgressModalProps) => {
  const {t} = useTranslation();
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
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === 'android'}
      hardwareAccelerated>
      {/* TODO: nested pressable onStartShouldSetResponder 옵션 사용으로 변경 */}
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
                      {t('paxi.report.infoTitle')}
                    </Text>
                  </View>
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label="ID"
                    value={reportData.id.toString()}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label={t('paxi.report.room')}
                    value={reportData.targetRoomName}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label={t('paxi.report.target')}
                    value={reportData.targetUserNickname}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label={t('paxi.report.reason')}
                    value={reportData.reason}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label={t('paxi.date')}
                    value={new Date(reportData.createdAt).toLocaleString(
                      getCurrentLocale(),
                    )}
                  />
                  <InfoRow
                    isDarkMode={isDarkMode}
                    label={t('paxi.report.status')}
                    value={
                      reportData.status === 'PENDING'
                        ? t('paxi.report.pending')
                        : t('paxi.report.resolved')
                    }
                  />
                  {reportData.status === 'COMPLETED' && (
                    <>
                      <View
                        style={[
                          styles.divider,
                          {backgroundColor: isDarkMode ? 'white' : '#ccc'},
                        ]}
                      />
                      <InfoRow
                        isDarkMode={isDarkMode}
                        label={t('paxi.report.resolver')}
                        value={reportData.resolverName}
                      />
                      <InfoRow
                        isDarkMode={isDarkMode}
                        label={t('paxi.report.resolution')}
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
                      {t('common.close')}
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
