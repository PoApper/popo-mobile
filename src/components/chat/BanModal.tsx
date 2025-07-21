import {useState} from 'react';
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

import {UserData} from '@interfaces/paxi';
import {TextInput} from 'react-native-gesture-handler';
import paxi_api from '@utils/paxi_api';
import { backgroundColor, textColor } from '@styles/default';

interface BanModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  roomUuid: string;
  userData: UserData | undefined;
}

const BanModal = ({
  modalVisible,
  setModalVisible,
  roomUuid,
  userData,
}: BanModalProps) => {
  const modalWidth = Dimensions.get('window').width * 0.75;
  const modalHeight = Dimensions.get('window').height * 0.3;
  const isDarkMode = useColorScheme() === 'dark';

  const [banText, setBanText] = useState<string>('');

  const handleClose = () => {
    setBanText('');
    setModalVisible(false);
  };

  const handleBan = (reason: string) => {
    if (userData === undefined) {
      return;
    }
    paxi_api
      .put(`/room/kick/${roomUuid}`, {
        kickedUserUuid: userData.userUuid,
        reason: reason,
      })
      .then(data => {
        console.log('추방 성공: ', data);
        Alert.alert('처리 완료', '요청이 처리되었습니다.');
      })
      .catch(error => {
        Alert.alert('추방 실패', error.response.data.message);
        console.error('추방 실패. 사유: ', error.response);
      });
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <SafeAreaView style={styles.modalContent}>
          <Pressable
            style={[
              {width: modalWidth, height: modalHeight, backgroundColor: backgroundColor(isDarkMode)},
              styles.innerContent,
            ]}
            onPress={() => {}}>
            <View style={{flex: 1, width: '100%', marginBottom: 20}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignContent: 'center',
                  marginBottom: 10,
                }}>
                <Text style={[styles.modalTitle, {color: textColor(isDarkMode)}]}>추방하기</Text>
              </View>
              <Text style={{marginBottom: 10, color: textColor(isDarkMode)}}>
                <Text style={{color: 'red'}}>{userData?.nickname}</Text>님을
                {'\n'}
                정말로 추방하실건가요?
              </Text>
              <TextInput
                style={[styles.textInput, {color: textColor(isDarkMode), borderColor: isDarkMode ? '#999' : '#e0e0e0',}]}
                value={banText}
                onChangeText={setBanText}
                placeholder="사유를 입력해주세요. (200자 이내)"
                placeholderTextColor="#999"
                multiline={true}
                maxLength={200}
                scrollEnabled={true}
              />
            </View>

            {/* 추방 요청 버튼 */}
            <View style={styles.buttonView}>
              <TouchableOpacity
                style={[styles.cancelButton, {backgroundColor: isDarkMode ? '#222': '#f2f2f2'}]}
                onPress={() => handleClose()}>
                <Text style={[styles.cancelButtonText, {color: textColor(isDarkMode)}]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.banButton, {backgroundColor: isDarkMode ? '#333': 'black'}]}
                disabled={banText.length === 0}
                onPress={() => {
                  handleBan(banText);
                  handleClose();
                }}>
                <Text style={styles.banButtonText}>추방</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </SafeAreaView>
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

export default BanModal;
