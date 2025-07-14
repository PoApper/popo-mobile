import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {UserData} from '@interfaces/paxi';
import {textColor, backgroundColor} from '@styles/default';
import {getColor} from '@utils/userchat-background';

interface ParticipantItemProps {
  userInfo: UserData;
  myUuid: string;
  ownerUuid: string;
  setReportModal: (visible: boolean) => void;
  setBanModal: (visible: boolean) => void;
  setSelectedUserData: (userData: UserData) => void;
}

const ParticipantItem = ({
  userInfo,
  myUuid,
  ownerUuid,
  setReportModal,
  setBanModal,
  setSelectedUserData,
}: ParticipantItemProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const isOwner = ownerUuid === userInfo.userUuid;
  const isMe = myUuid === userInfo.userUuid;
  const isMeOwner = myUuid === ownerUuid;

  const reportUser = () => {
    setReportModal(true);
    setSelectedUserData(userInfo);
  };

  const banUser = () => {
    setBanModal(true);
    setSelectedUserData(userInfo);
  };

  return (
    <View
      style={[styles.userRow, {backgroundColor: backgroundColor(isDarkMode)}]}>
      <View style={styles.rowCenter}>
        <View style={styles.avatarCircle}>
          <View style={{width: 36, height: 36, position: 'relative'}}>
            <Image
              source={require('../../../assets/baby_phonix.png')}
              style={[
                styles.profileImg,
                {backgroundColor: getColor(userInfo.nickname)},
              ]}
              resizeMode="contain"
            />
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
        {isMe && (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 15,
              marginRight: 10,
              backgroundColor: isDarkMode ? '#222' : '#eee',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{fontSize: 11, color: textColor(isDarkMode)}}>나</Text>
          </View>
        )}
        <View>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, {color: textColor(isDarkMode)}]}>
              {userInfo.nickname}
            </Text>
          </View>
          {(userInfo.isPaid || isOwner) && (
            <Text
              style={[styles.subText, {color: isDarkMode ? '#999' : '#666'}]}>
              {isOwner && userInfo.isPaid
                ? '방장 & 송금 완료'
                : isOwner
                ? '방장'
                : '송금 완료'}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rowCenter}>
        {!isMe && isMeOwner ? (
          <TouchableOpacity
            style={[
              styles.grayButton,
              {backgroundColor: isDarkMode ? '#333' : '#eee'},
            ]}
            onPress={banUser}
            disabled={isMe}>
            <Text style={{color: textColor(isDarkMode)}}>추방</Text>
          </TouchableOpacity>
        ) : null}
        {!isMe ? (
          <TouchableOpacity
            style={[
              styles.grayButton,
              {backgroundColor: isDarkMode ? '#333' : '#eee'},
            ]}
            onPress={reportUser}
            disabled={isMe}>
            <Text style={{color: textColor(isDarkMode)}}>신고</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default ParticipantItem;

const styles = StyleSheet.create({
  userRow: {
    paddingVertical: 12,
    borderRadius: 10,
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
    borderRadius: 18,
    marginRight: 10,
  },
  profileImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 10,
  },
  grayButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
});
