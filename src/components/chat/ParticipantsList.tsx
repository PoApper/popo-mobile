import {
  Alert,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {UserData} from '@interfaces/paxi';

interface ParticipantsListProps {
  users: UserData[];
}

const renderMemberItem = ({item}: ListRenderItemInfo<UserData>) => {
  const banUser = () => {
    Alert.alert('추방', `유저 ${item.nickname}를 추방하시겠습니까?`, [
      {
        text: '아니오',
        style: 'cancel',
      },
      {
        text: '추방',
        onPress: () => {
          // TODO: 추방 요청 보내기
          Alert.alert('처리 완료', '요청이 처리되었습니다.');
        },
      },
    ]);
  };

  const reportUser = () => {
    Alert.alert('신고', `유저 ${item.nickname}를 신고하시겠습니까?`, [
      {
        text: '아니오',
        style: 'cancel',
      },
      {
        text: '신고',
        onPress: () => {
          // TODO: 신고 요청 보내기
          Alert.alert('처리 완료', '요청이 처리되었습니다.');
        },
      },
    ]);
  };
  return (
    <View style={styles.userRow}>
      <View style={styles.rowCenter}>
        {/* 프로필 사진 대체 원 */}
        <View style={styles.avatarCircle}>
          <View style={{width: 36, height: 36, position: 'relative'}}>
            {item.isPaid && (
              <Icon
                name="check-circle-outline"
                style={{position: 'absolute', bottom: 0, right: 0}}
                size={20}
                color="green"
              />
            )}
            {item.isOwner && (
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
            <Text style={styles.nameText}>{item.nickname}</Text>
          </View>
          {item.isOwner && !item.isPaid && (
            <Text style={styles.subText}>방장</Text>
          )}
          {item.isPaid && !item.isOwner && (
            <Text style={styles.subText}>송금 완료</Text>
          )}
          {item.isPaid && item.isOwner && (
            <Text style={styles.subText}>방장 & 송금 완료</Text>
          )}
        </View>
      </View>
      <View style={styles.rowCenter}>
        <TouchableOpacity style={styles.grayButton} onPress={banUser}>
          <Text>추방</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.grayButton} onPress={reportUser}>
          <Text>신고</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ParticipantsList = ({users}: ParticipantsListProps) => {
  console.log('participants list', users);

  return (
    <FlatList
      style={{width: '100%', paddingHorizontal: 0}}
      data={users}
      keyExtractor={item => item.userUuid}
      renderItem={renderMemberItem}
    />
  );
};

export default ParticipantsList;

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
