import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Modal,
} from 'react-native';

type PrivacyPolicyProps = {
  visible: boolean;
  onClose: () => void;
  onAgree: () => void;
};

const PaxiPrivacyPolicy = ({visible, onClose, onAgree}: PrivacyPolicyProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            },
          ]}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                {color: isDarkMode ? '#FFFFFF' : '#000000'},
              ]}>
              개인정보 처리 방침
            </Text>
          </View>
          <ScrollView style={styles.scrollView}>
            <Text
              style={[
                styles.content,
                {color: isDarkMode ? '#E0E0E0' : '#333333'},
              ]}>
              {'1. 서비스 이용약관 필수 동의 항목\n\n'}
              {'귀하는 Paxi 서비스 이용과 관련하여 다음 사항에 동의합니다:\n\n'}
              {
                '- 본인은 POSTECH 소속 학생임을 확인하며, 비상시를 대비하여 본인의 연락처, 탑승 이력, 정산 이력 등이 내부적으로 기록됨을 이해합니다.\n'
              }
              {
                '- 본인은 카풀 정산 편의를 위하여 타 사용자에게 이름 또는 닉네임이 공개될 수 있음에 동의합니다.\n\n'
              }
              {'2. 개인정보 처리방침 고지 및 동의\n\n'}
              {'Paxi는 다음 항목의 개인정보를 수집·이용합니다:\n\n'}

              {'- 필수 항목: 이메일, 닉네임, 계좌번호, 기기 푸시 토큰\n'}

              {
                '- 이용 목적: 탑승자 간 매칭, 정산 처리, 서비스 고지, 민원 응대\n'
              }

              {
                '- 계좌번호 정보는 사용자 편의성 제고를 위해 저장되며, 암호화된 방식으로 안전하게 보관됩니다.\n'
              }

              {
                '- 수집된 정보는 서비스 종료 또는 사용자 요청 시 안전하게 파기됩니다.\n\n'
              }

              {'3. 정산 방식에 대한 사전 안내 및 동의\n\n'}

              {
                'Paxi의 정산 시스템은 참여 인원 간 균등 분배를 원칙으로 하며, 소수점 처리의 일관성을 위해 올림 처리를 적용합니다.\n'
              }

              {
                '예: 총 1000원, 참여자 3명 → 각 334원으로 정산되며, 결제자는 2원을 초과 수령하게 됩니다.\n'
              }

              {
                '사용자는 이와 같은 형평적 정산 방식에 대해 사전에 인지하고 동의합니다.\n\n'
              }

              {'4. 알림(푸시) 기능 사용에 대한 동의\n\n'}

              {
                '앱 내 알림은 방 참여 시각, 채팅 메시지, 정산 요청 등 핵심 기능 제공을 위한 필수 기능이며, Firebase 기반의 기기 식별자 정보를 활용하여 발송됩니다.\n'
              }

              {'알림은 기기 설정에서 언제든지 수신 거부가 가능합니다.\n'}
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.disagreeButton]}
              onPress={onClose}>
              <Text style={styles.buttonText}>동의하지 않음</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.agreeButton]}
              onPress={onAgree}>
              <Text style={[styles.buttonText, styles.agreeButtonText]}>
                동의합니다
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disagreeButton: {
    backgroundColor: '#F3F4F6',
  },
  agreeButton: {
    backgroundColor: '#4F46E5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  agreeButtonText: {
    color: '#FFFFFF',
  },
});

export default PaxiPrivacyPolicy;
