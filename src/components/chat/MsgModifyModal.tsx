import {
  Modal,
  Pressable,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import {MessageData} from '@interfaces/paxi';
import {Text, TextInput} from 'react-native-gesture-handler';
import {useEffect, useState} from 'react';

interface MsgModifyModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  msgData: MessageData;
}

const MsgModifyModal = ({
  modalVisible,
  setModalVisible,
  msgData,
}: MsgModifyModalProps) => {
  // const isDarkMode = useColorScheme() === 'dark';
  const [currentMsg, setCurrentMsg] = useState<string>('');

  const handleModifyMsg = () => {};

  const handleDeleteMsg = () => {};

  const handleClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    setCurrentMsg(msgData.message);
  }, [msgData]);

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalContent}>
            <Pressable style={styles.innerContent} onPress={() => {}}>
              <View style={styles.rowLeft}>
                <Text style={styles.modalTitle}>메시지 수정하기</Text>

                <TextInput
                  style={styles.input}
                  value={currentMsg}
                  onChangeText={setCurrentMsg}
                  placeholder="텍스트를 입력해주세요."
                  multiline={true}
                  placeholderTextColor="#999"
                  scrollEnabled={true}
                />

                <Text>마지막 수정시각: {msgData.updatedAt}</Text>

                <Text>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleModifyMsg}>
                    <Text style={styles.buttonText}>수정하기</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleDeleteMsg}>
                    <Text style={styles.buttonText}>삭제하기</Text>
                  </TouchableOpacity>
                </Text>
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
    height: 200,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 80,
    width: '100%',
    borderWidth: 1,
    padding: 10,
    textAlign: 'left',
    textAlignVertical: 'top',
  },
  rowLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MsgModifyModal;
