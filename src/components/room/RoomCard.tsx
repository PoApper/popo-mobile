import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';

interface RoomCardProps {
  uuid: string;
  title: string;
  departureTime: string;
  remain: number;
  total: number;
  departure: string;
  destination: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
  uuid,
  title,
  departureTime,
  remain,
  total,
  departure,
  destination,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
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
      style={[styles.roomContainer, {backgroundColor}]}
      onPress={() => askJoinRoom()}>
      <View style={styles.cardContent}>
        <View style={styles.mainInfo}>
          <View style={styles.titleContainer}>
            <Text style={remain < total ? styles.possible : styles.impossible}>
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

export default RoomCard;
