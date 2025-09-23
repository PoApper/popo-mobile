import {useEffect, useState} from 'react';
import {
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';

import {ChatRoomInfo, UserData} from '@interfaces/paxi';
import paxi_api from '@utils/paxi_api';
import {backgroundColor, textColor} from '@styles/default';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '~/src/navigation/types';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OwnerTransferModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  roomData: ChatRoomInfo;
  myUuid: string;
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewChat'>;
}

const OwnerTransferModal = ({
  modalVisible,
  setModalVisible,
  roomData,
  myUuid,
  navigation,
}: OwnerTransferModalProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const [selectedNewOwnerUuid, setSelectedNewOwnerUuid] = useState<
    string | undefined
  >(undefined);

  const performLeave = async () => {
    return paxi_api
      .put(`/room/leave/${roomData.uuid}`)
      .then(() => {
        setModalVisible(false);
        navigation.navigate('Main', {tab: 'MyReservation', prevTab: 'NewChat'});
      })
      .catch(err => {
        console.error('채팅방 나가기 실패', err);
        Alert.alert(
          '채팅방 나가기 실패',
          `채팅방 나가기에 실패했습니다.\n${err.response?.data?.message || ''}`,
        );
      });
  };

  const eligibleNextOwners: UserData[] =
    roomData?.roomUsers?.filter(
      user => user.status === 'JOINED' && user.userUuid !== myUuid,
    ) || [];

  const handleConfirmTransferAndLeave = async () => {
    if (!selectedNewOwnerUuid) {
      Alert.alert('알림', '다음 방장을 선택해주세요.');
      return;
    }

    try {
      setModalVisible(false);
      await paxi_api.post(`room/delegate/${roomData.uuid}`, {
        userUuid: selectedNewOwnerUuid,
      });
      await performLeave();
    } catch (err: any) {
      console.error('방장 위임 실패', err);
      Alert.alert(
        '방장 위임 실패',
        `방장 위임 중 오류가 발생했습니다.\n${
          err.response?.data?.message || ''
        }`,
      );
    }
  };

  useEffect(() => {
    if (modalVisible) {
      setSelectedNewOwnerUuid(undefined);
    }
  }, [modalVisible]);

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
      statusBarTranslucent={Platform.OS === 'android'}
      hardwareAccelerated>
      {/* TODO: nested pressable onStartShouldSetResponder 옵션 사용으로 변경 */}
      <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
        <Pressable
          style={[
            styles.modalContainer,
            {backgroundColor: backgroundColor(isDarkMode)},
          ]}
          onPress={() => {}}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 10,
              color: textColor(isDarkMode),
            }}>
            방장 위임
          </Text>
          <Text
            style={{
              fontSize: 12,
              marginBottom: 16,
              color: isDarkMode ? '#aaa' : '#666',
            }}>
            나가기 전에 다음 방장을 선택하세요.
          </Text>
          <View style={{width: '100%', gap: 8, flexGrow: 0, maxHeight: 300}}>
            {eligibleNextOwners.length === 0 ? (
              <Text style={{color: textColor(isDarkMode)}}>
                위임할 수 있는 참여자가 없습니다.
              </Text>
            ) : (
              eligibleNextOwners.map(user => (
                <TouchableOpacity
                  key={user.userUuid}
                  onPress={() => setSelectedNewOwnerUuid(user.userUuid)}
                  style={[
                    styles.userRow,
                    {
                      backgroundColor: backgroundColor(isDarkMode),
                      borderWidth: 1,
                      borderColor:
                        selectedNewOwnerUuid === user.userUuid
                          ? isDarkMode
                            ? '#666'
                            : '#ccc'
                          : 'transparent',
                      paddingHorizontal: 10,
                    },
                  ]}>
                  <View style={styles.rowCenter}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        marginRight: 10,
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#666' : '#ccc',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          selectedNewOwnerUuid === user.userUuid
                            ? isDarkMode
                              ? '#555'
                              : '#ddd'
                            : 'transparent',
                      }}>
                      {selectedNewOwnerUuid === user.userUuid ? (
                        <Icon
                          name="check"
                          size={14}
                          color={isDarkMode ? '#ddd' : '#333'}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[styles.nameText, {color: textColor(isDarkMode)}]}>
                      {user.nickname}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={[styles.rowBetween]}>
            <TouchableOpacity
              style={[
                styles.cancelTransferButton,
                {backgroundColor: isDarkMode ? '#222' : '#f2f2f2'},
              ]}
              onPress={() => setModalVisible(false)}>
              <Text style={{color: textColor(isDarkMode), fontWeight: 'bold'}}>
                취소
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quitWithTransferButton,
                {backgroundColor: isDarkMode ? '#333' : 'black'},
              ]}
              onPress={handleConfirmTransferAndLeave}
              disabled={eligibleNextOwners.length === 0}>
              <Text style={styles.buttonText}>위임 후 나가기</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
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
  modalContainer: {
    width: '80%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  userRow: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelTransferButton: {
    paddingHorizontal: 10,
    width: '48%',
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  quitWithTransferButton: {
    paddingHorizontal: 10,
    width: '48%',
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OwnerTransferModal;
