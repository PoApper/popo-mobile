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
} from 'react-native';

import {UserData} from '@interfaces/paxi';
import {TextInput} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import paxi_api from '@utils/paxi_api';

interface BanModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  roomUuid: string,
  userData: UserData | undefined,
}

const BanModal = ({
  modalVisible,
  setModalVisible,
  roomUuid,
  userData,
}:
BanModalProps) => {
  const modalWidth = Dimensions.get('window').width * 0.7;
  const modalHeight = Dimensions.get('window').height * 0.5;

  const [banText, setBanText] = useState<string>('');

  const handleClose = () => {
    setBanText('');
    setModalVisible(false);
  };

  const handleBan = (reason: string) => {
    if (userData === undefined) {
      return;
    }
    paxi_api.put(`/room/kick/${roomUuid}`, {
      userUuid: userData.userUuid,
      reason: reason,
    })
    .then(() => {
      Alert.alert('처리 완료', '요청이 처리되었습니다.');
    })
    .catch(() => {
      Alert.alert('추방 실패', '추방 요청에 실패했습니다.');
    });
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <SafeAreaView style={styles.modalContent}>
          <Pressable style={[{width: modalWidth, height: modalHeight}, styles.innerContent]} onPress={() => {}}>
            <View style={{flex: 1, width: '100%', marginBottom: 20}}>
              <View style={{flexDirection: 'row', alignContent: 'center', gap: 5}}>
                <Icon name="dangerous" size={30} color="black" />
                <Text style={styles.modalTitle}>추방하기</Text>
              </View>
              <Text style={{marginBottom: 10, fontWeight: 'bold'}}>정말로 <Text style={{color: 'darkred'}}>{userData?.nickname}</Text>님을 추방하실건가요?</Text>
              <TextInput
                style={[styles.textInput]}
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
                style={[styles.banButton, {backgroundColor: banText.length === 0 ? 'grey' : 'black'}]}
                disabled={banText.length === 0}
                onPress={() => {handleBan(banText); handleClose();}}>
                <Text style={styles.banButtonText}>추방하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleClose()}>
                <Text style={styles.cancelButtonText}>취소하기</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContent: {
    borderRadius: 10,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 25,
    letterSpacing: -0.4,
    fontWeight: 'bold',
    color: 'black',
  },
  textInput: {
    flex: 1,
    width: '100%',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  buttonView: {
    flexDirection: 'row',
    gap: 10,
  },
  banButton: {
    paddingHorizontal: 20,
    height: 40,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  banButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingHorizontal: 20,
    height: 40,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  cancelButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default BanModal;
