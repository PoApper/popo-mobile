import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';

import {StyleSheet} from 'react-native';
import paxi_api from '../../utils/paxi_api';

interface RoomContainerProps {
  uuid: string;
  title: string;
  departureTime: string;
  remain: number;
  total: number;
  departure: string;
  destination: string;
}

export const RoomListCard: React.FC<RoomContainerProps> = ({
  uuid,
  title,
  departureTime,
  remain,
  total,
  departure,
  destination,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#222222';
  const backgroundColor = isDarkMode ? '#1A1A1A' : '#fff';
  const subTextColor = isDarkMode ? '#888' : '#666';

  const askJoinRoom = () => {
    Alert.alert('참여하기', '방에 참여하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: () => {
          console.log('방 참여 요청:', uuid);
          paxi_api
            .post(`/room/join/${uuid}`)
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
                remain < total
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
              {remain < total ? '참여 가능' : '마감'}
            </Text>
            <Text style={[styles.title, {color: textColor}]}>{title}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsText, {color: textColor}]}>
              {departure}
            </Text>
            <Text style={[styles.arrow, {color: textColor}]}>
              {'  - - - - >  '}
            </Text>
            <Text style={[styles.detailsText, {color: textColor}]}>
              {destination}
            </Text>
          </View>
          <Text style={[styles.departureTime, {color: subTextColor}]}>
            {departureTime}
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
  possible: {
    fontSize: 13,
    letterSpacing: -0.1,
    fontWeight: '700',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  impossible: {
    fontSize: 13,
    letterSpacing: -0.1,
    fontWeight: '700',
    borderRadius: 3,
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
