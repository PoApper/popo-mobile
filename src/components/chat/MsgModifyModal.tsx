import {
  Pressable,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  Text,
  TextInput,
  Alert,
} from 'react-native';

import {MessageData} from '@interfaces/paxi';
import {useEffect, useState} from 'react';
import {backgroundColor, textColor} from '@styles/default';
import paxi_api from '@utils/paxi_api';

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
  const isDarkMode = useColorScheme() === 'dark';
  const [currentMsg, setCurrentMsg] = useState<string>('');

  const handleModifyMsg = async () => {
    const res = await paxi_api.put(`/chat/${msgData.uuid}`, {
      message: currentMsg,
    });
    if (res.status !== 200) {
      Alert.alert('실패', '메시지 수정에 실패했습니다.');
      return;
    } else {
      handleClose();
    }
  };

  const handleDeleteMsg = async () => {
    const res = await paxi_api.delete(`/chat/${msgData.uuid}`);
    if (res.status !== 200) {
      Alert.alert('실패', '메시지 삭제에 실패했습니다.');
      return;
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    setCurrentMsg(msgData.message);
  }, [msgData]);

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
                  alignItems: 'flex-start',
                  width: '100%',
                }}>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: textColor(isDarkMode),
                    },
                  ]}>
                  메시지 수정하기
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: textColor(isDarkMode),
                      color: textColor(isDarkMode),
                    },
                  ]}
                  value={currentMsg}
                  onChangeText={setCurrentMsg}
                  placeholder="텍스트를 입력해주세요."
                  multiline={true}
                  placeholderTextColor="#999"
                  scrollEnabled={true}
                />

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 5,
                  }}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        backgroundColor: isDarkMode ? '#333' : 'black',
                      },
                    ]}
                    onPress={handleModifyMsg}>
                    <Text style={styles.buttonText}>수정하기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        backgroundColor: isDarkMode ? '#333' : 'black',
                      },
                    ]}
                    onPress={handleDeleteMsg}>
                    <Text style={styles.buttonText}>삭제하기</Text>
                  </TouchableOpacity>
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
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
    textAlign: 'left',
    textAlignVertical: 'top',
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

export default MsgModifyModal;
