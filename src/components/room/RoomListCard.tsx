import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import moment from 'moment';

import paxi_api from '@utils/paxi_api';
import DottedArrow from './DottedArrow';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import {ChatRoomInfo} from '~/src/interfaces/paxi';

interface RoomContainerProps {
  roomUuid: string;
  userUuid: string;
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewChat'>;
}

export const RoomListCard: React.FC<RoomContainerProps> = ({
  roomUuid,
  userUuid,
  navigation,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#EDEDED' : '#222222';
  const backgroundColor = isDarkMode ? '#1A1A1A' : '#FFFFFF';
  const subTextColor = isDarkMode ? '#A3A3A3' : '#666666';
  const [roomData, setRoomData] = useState<ChatRoomInfo | null>(null);

  useEffect(() => {
    paxi_api
      .get(`/room/${roomUuid}`)
      .then(res => {
        setRoomData(res.data);
      })
      .catch(e => console.error(e));
  }, [roomUuid]);

  if (!roomData) {
    return null;
  }

  const isOwner = userUuid === roomData?.ownerUuid;
  const isPossible = roomData.currentParticipant < roomData.maxParticipant;
  const isJoinedRoom = roomData.room_users
    .map(user => user.userUuid)
    .includes(userUuid);

  const askJoinRoom = () => {
    if (roomData.currentParticipant >= roomData.maxParticipant) {
      Alert.alert('마감', '방이 마감되었습니다.');
      return;
    }

    if (isOwner || isJoinedRoom) {
      navigation.navigate('NewChat', {
        roomUuid: roomData.uuid,
        from: 'roomList',
      });
      return;
    }

    Alert.alert('참여하기', '방에 참여하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: () => {
          paxi_api
            .post(`/room/join/${roomData.uuid}`)
            .then(response => {
              console.log('response.data:', response.data);
              console.log('response.status', response.status);
              if (response.status === 201) {
                Alert.alert('성공', '방에 참여했습니다.');
                navigation.navigate('NewChat', {
                  roomUuid: roomData.uuid,
                  from: 'roomList',
                });
              } else {
                Alert.alert('실패', '방 참여에 실패했습니다.');
              }
            })
            .catch(error => {
              console.error('Error:', error);
              Alert.alert('실패', '방 참여에 실패했습니다: ' + error.message);
            });
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={[
        styles.roomContainer,
        {
          backgroundColor,
          borderColor: 'transparent',
          borderWidth: 0,
          elevation: 8,
        },
      ]}
      onPress={() => askJoinRoom()}>
      <View style={styles.cardContent}>
        <View style={styles.mainInfo}>
          <View style={styles.titleContainer}>
            <View
              style={[
                styles.statusContainer,
                {
                  backgroundColor: isOwner
                    ? isDarkMode
                      ? 'rgba(79,70,229,0.18)'
                      : '#EEF2FF'
                    : isJoinedRoom
                    ? isDarkMode
                      ? 'rgba(110, 230, 24, 0.18)'
                      : '#f1ffee'
                    : isPossible
                    ? isDarkMode
                      ? 'rgba(250,87,33,0.18)'
                      : '#FFF4E6'
                    : isDarkMode
                    ? 'rgba(217,217,217,0.12)'
                    : '#F3F4F6',
                },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isOwner
                      ? '#4F46E5'
                      : isJoinedRoom
                      ? '#46e556'
                      : isPossible
                      ? '#FA5721'
                      : '#909090',
                  },
                ]}>
                {isOwner
                  ? '내가 방장'
                  : isJoinedRoom
                  ? '참여한 방'
                  : isPossible
                  ? '참여 가능'
                  : '마감된 방'}
              </Text>
            </View>
            <View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.title, {color: textColor, maxWidth: 180}]}>
                {roomData.title}
              </Text>
            </View>
            <View style={{flexDirection: 'row', gap: 5, marginLeft: 'auto'}}>
              {roomData.currentParticipant < roomData.maxParticipant ? (
                <Image
                  source={require('../../../assets/baby_phonix.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={require('../../../assets/baby_phonix_disabled.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              )}
              <Text
                style={[
                  styles.participantNumText,
                  {
                    color:
                      roomData.currentParticipant < roomData.maxParticipant
                        ? '#FA5721'
                        : '#4f4f4f',
                  },
                ]}>
                {roomData.currentParticipant}/{roomData.maxParticipant}
              </Text>
            </View>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsText, {color: textColor}]}>
              {roomData.departureLocation}
            </Text>

            <DottedArrow
              width={100}
              height={25}
              color={isDarkMode ? 'white' : 'black'}
            />

            <Text style={[styles.detailsText, {color: textColor}]}>
              {roomData.destinationLocation}
            </Text>
          </View>
          <Text style={[styles.departureTime, {color: subTextColor}]}>
            {moment(roomData.departureTime).format(
              'YYYY년 MM월 DD일 HH시 mm분',
            )}{' '}
            출발
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  roomContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'visible',
    borderWidth: 0,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardContent: {
    flexDirection: 'column',
  },
  mainInfo: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  participantNumText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoImage: {
    width: 20,
    height: 20,
  },
  statusContainer: {
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 18,
  },
  arrow: {
    fontSize: 20,
  },
  departureTime: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
