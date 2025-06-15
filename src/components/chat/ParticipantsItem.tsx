import React from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {UserData} from '@interfaces/paxi';
import paxi_api from '@utils/paxi_api';

interface ParticipantItemProps {
  userInfo: UserData;
  roomUuid: string;
  myUuid: string;
  ownerUuid: string;
}

const ParticipantItem = ({
  userInfo,
  roomUuid,
  myUuid,
  ownerUuid,
}: ParticipantItemProps) => {
  const isOwner = ownerUuid === userInfo.userUuid;
  const isMe = myUuid === userInfo.userUuid;
  const isMeOwner = myUuid === ownerUuid;

  const banUser = () => {
    Alert.alert('추방', `유저 '${userInfo.nickname}'님을 추방하시겠습니까?`, [
      {
        text: '아니오',
        style: 'cancel',
      },
      {
        text: '추방',
        onPress: () => {
          paxi_api
            .put(`/room/kick/${roomUuid}`, {
              userUuid: userInfo.userUuid,
              reason: '추방 사유 (테스트 중)', // TODO: 추방 사유 입력 받기
            })
            .then(() => {
              Alert.alert('처리 완료', '요청이 처리되었습니다.');
            })
            .catch(() => {
              Alert.alert('추방 실패', '추방 요청에 실패했습니다.');
            });
        },
      },
    ]);
  };

  const reportUser = () => {
    Alert.alert('신고', `유저 '${userInfo.nickname}'님을 신고하시겠습니까?`, [
      {
        text: '아니오',
        style: 'cancel',
      },
      {
        text: '신고',
        onPress: () => {
          paxi_api
            .post('report', {
              targetRoomUuid: roomUuid,
              targetUserUuid: userInfo.userUuid,
              reason: '신고 사유 (테스트 중)', // TODO: 신고 사유 입력 받기
            })
            .then(() => {
              Alert.alert('처리 완료', '요청이 처리되었습니다.');
            })
            .catch(() => {
              Alert.alert('신고 실패', '신고 요청에 실패했습니다.');
            });
        },
      },
    ]);
  };
  return (
    <View style={styles.userRow}>
      <View style={styles.rowCenter}>
        {/* TODO: 프로필 사진 대체 */}
        <View style={styles.avatarCircle}>
          <View style={{width: 36, height: 36, position: 'relative'}}>
            {userInfo.isPaid && (
              <Icon
                name="check-circle-outline"
                style={{position: 'absolute', bottom: 0, right: 0}}
                size={20}
                color="green"
              />
            )}
            {isOwner && (
              <Icon
                name="verified"
                style={{position: 'absolute', top: 0, left: 0}}
                size={20}
                color="gold"
              />
            )}
          </View>
        </View>
        <View>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{userInfo.nickname}</Text>
          </View>
          {!userInfo.isPaid && isOwner && (
            <Text style={styles.subText}>방장</Text>
          )}
          {userInfo.isPaid && !isOwner && (
            <Text style={styles.subText}>송금 완료</Text>
          )}
          {userInfo.isPaid && isOwner && (
            <Text style={styles.subText}>방장 & 송금 완료</Text>
          )}
        </View>
      </View>
      <View style={styles.rowCenter}>
        {!isMe && isMeOwner ? (
          <TouchableOpacity
            style={styles.grayButton}
            onPress={banUser}
            disabled={isMe}>
            <Text>추방</Text>
          </TouchableOpacity>
        ) : null}
        {!isMe ? (
          <TouchableOpacity
            style={styles.grayButton}
            onPress={reportUser}
            disabled={isMe}>
            <Text>신고</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default ParticipantItem;

const styles = StyleSheet.create({
  userRow: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    backgroundColor: '#ddd',
    borderRadius: 18,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 10,
    color: '#666',
  },
  grayButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
});
