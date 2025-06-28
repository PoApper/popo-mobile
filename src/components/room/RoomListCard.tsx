import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';

import paxi_api from '@utils/paxi_api';
import {RoomDataType} from '@interfaces/paxi';
import DottedArrow from './DottedArrow';
import {isoStringToFormattedText} from '@utils/isostring-format';

interface RoomContainerProps {
  roomData: RoomDataType;
  userUuid: string;
}

export const RoomListCard: React.FC<RoomContainerProps> = ({
  roomData,
  userUuid,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#222222';
  const backgroundColor = isDarkMode ? '#1A1A1A' : '#fff';
  const subTextColor = isDarkMode ? '#888' : '#666';

  const remain = roomData.maxParticipant - roomData.currentParticipant;

  const askJoinRoom = () => {
    if (userUuid === roomData.ownerUuid) {
      Alert.alert(
        '잠깐!',
        '자신이 만든 방에는 참여할 수 없습니다. 내 일정에서 방 목록을 확인해주세요.',
        [
          {
            text: '확인',
          },
        ],
      );
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
            <Text
              style={[
                remain < roomData.maxParticipant
                  ? [
                      styles.possible,
                      {
                        backgroundColor: isDarkMode ? '#fff3f3' : '#FFF0F0',
                        color: '#fb5353',
                      },
                    ]
                  : [
                      styles.impossible,
                      {
                        backgroundColor: isDarkMode
                          ? 'rgba(217,217,217,0.83)'
                          : '#F3F3F3',
                        color: '#909090',
                      },
                    ],
              ]}>
              {remain < roomData.maxParticipant ? '참여 가능' : '마감'}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.title, {color: textColor, maxWidth: 180}]}>
              {roomData.title}
            </Text>
            <View style={{flexDirection: 'row', gap: '5', marginLeft: 'auto'}}>
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

            <DottedArrow width={100} height={25} color={'white'} />

            <Text style={[styles.detailsText, {color: textColor}]}>
              {roomData.destinationLocation}
            </Text>
          </View>
          <Text style={[styles.departureTime, {color: subTextColor}]}>
            {isoStringToFormattedText(roomData.departureTime)} 출발
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
  possible: {
    fontSize: 13,
    letterSpacing: -0.1,
    fontWeight: '700',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  impossible: {
    fontSize: 13,
    letterSpacing: -0.1,
    fontWeight: '700',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
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
