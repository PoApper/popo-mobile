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

// 방 상태 enum 정의
enum RoomStatus {
  OWNER = 'OWNER',
  KICKED = 'KICKED',
  JOINED = 'JOINED',
  AVAILABLE = 'AVAILABLE',
  FULL = 'FULL',
}

// 방 상태별 스타일 정보
interface StatusStyle {
  backgroundColor: string;
  textColor: string;
  statusText: string;
}

export const RoomListCard: React.FC<RoomContainerProps> = ({
  roomUuid,
  userUuid,
  navigation,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [roomData, setRoomData] = useState<ChatRoomInfo | null>(null);

  // 테마 색상 정의
  const theme = {
    text: isDarkMode ? '#EDEDED' : '#222222',
    background: isDarkMode ? '#1A1A1A' : '#FFFFFF',
    subText: isDarkMode ? '#A3A3A3' : '#666666',
  };

  useEffect(() => {
    fetchRoomData();
  }, [roomUuid]);

  // 방 데이터 가져오기
  const fetchRoomData = async () => {
    try {
      const response = await paxi_api.get(`/room/${roomUuid}`);
      setRoomData(response.data);
    } catch (error) {
      console.error('방 데이터 가져오기 실패:', error);
    }
  };

  if (!roomData) {
    return null;
  }

  // 방 상태 계산
  const getRoomStatus = (): RoomStatus => {
    const isOwner = userUuid === roomData.ownerUuid;
    const isKicked = roomData.roomUsers?.some(
      user => user.userUuid === userUuid && user.status === 'KICKED',
    );
    const isJoined = roomData.roomUsers?.some(
      user => user.userUuid === userUuid && user.status !== 'KICKED',
    );
    const isAvailable = roomData.currentParticipant < roomData.maxParticipant;

    if (isOwner) {
      return RoomStatus.OWNER;
    }
    if (isKicked) {
      return RoomStatus.KICKED;
    }
    if (isJoined) {
      return RoomStatus.JOINED;
    }
    if (isAvailable) {
      return RoomStatus.AVAILABLE;
    }
    return RoomStatus.FULL;
  };

  // 방 상태별 스타일 정보 가져오기
  const getStatusStyle = (status: RoomStatus): StatusStyle => {
    const statusStyles: Record<RoomStatus, StatusStyle> = {
      [RoomStatus.OWNER]: {
        backgroundColor: isDarkMode ? 'rgba(79,70,229,0.18)' : '#EEF2FF',
        textColor: '#4F46E5',
        statusText: '내가 방장',
      },
      [RoomStatus.KICKED]: {
        backgroundColor: isDarkMode ? 'rgba(230,110,110,0.18)' : '#FFEEEE',
        textColor: '#E55656',
        statusText: '강퇴된 방',
      },
      [RoomStatus.JOINED]: {
        backgroundColor: isDarkMode ? 'rgba(110, 230, 24, 0.18)' : '#f1ffee',
        textColor: '#46e556',
        statusText: '참여한 방',
      },
      [RoomStatus.AVAILABLE]: {
        backgroundColor: isDarkMode ? 'rgba(250,87,33,0.18)' : '#FFF4E6',
        textColor: '#FA5721',
        statusText: '참여 가능',
      },
      [RoomStatus.FULL]: {
        backgroundColor: isDarkMode ? 'rgba(217,217,217,0.12)' : '#F3F4F6',
        textColor: '#909090',
        statusText: '마감된 방',
      },
    };

    return statusStyles[status];
  };

  const roomStatus = getRoomStatus();
  const statusStyle = getStatusStyle(roomStatus);

  // 방 참여 처리
  const handleJoinRoom = () => {
    const status = getRoomStatus();

    // 강퇴된 방 처리
    if (status === RoomStatus.KICKED) {
      Alert.alert(
        '강퇴됨',
        '강퇴된 방에는 참여할 수 없습니다. \n자세한 사유는 내 일정 탭에서 확인해주세요.',
      );
      return;
    }

    // 마감된 방 처리
    if (status === RoomStatus.FULL) {
      Alert.alert('마감', '방이 마감되었습니다.');
      return;
    }

    // 이미 참여한 방이거나 방장인 경우 바로 입장
    if (status === RoomStatus.OWNER || status === RoomStatus.JOINED) {
      joinRoomDirectly();
      return;
    }

    // 새로운 참여자인 경우 확인 후 입장
    Alert.alert('참여하기', '방에 참여하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {text: '확인', onPress: joinRoomWithConfirmation},
    ]);
  };

  // 방에 바로 입장 (이미 참여한 경우)
  const joinRoomDirectly = () => {
    paxi_api
      .post(`/room/join/${roomData.uuid}`)
      .then(() => {
        navigateToChat();
      })
      .catch((error: any) => {
        console.error('방 입장 실패:', error);
        Alert.alert(
          '실패',
          '방 참여에 실패했습니다: ' + (error.message || '알 수 없는 오류'),
        );
      });
  };

  // 확인 후 방 참여
  const joinRoomWithConfirmation = () => {
    paxi_api
      .post(`/room/join/${roomData.uuid}`)
      .then(response => {
        console.log('response.data:', response.data);
        console.log('response.status', response.status);
        if (response.status === 201) {
          Alert.alert('성공', '방에 참여했습니다.');
          navigateToChat();
        } else {
          Alert.alert('실패', '방 참여에 실패했습니다.');
        }
      })
      .catch((error: any) => {
        console.error('방 참여 실패:', error);
        Alert.alert(
          '실패',
          '방 참여에 실패했습니다: ' + (error.message || '알 수 없는 오류'),
        );
      });
  };

  // 채팅 화면으로 이동
  const navigateToChat = () => {
    navigation.navigate('NewChat', {
      roomUuid: roomData.uuid,
      from: 'roomList',
    });
  };

  // 참여자 수 색상 가져오기
  const getParticipantCountColor = (): string => {
    return roomData.currentParticipant < roomData.maxParticipant
      ? '#FA5721'
      : '#4f4f4f';
  };

  // 로고 이미지 소스 가져오기
  const getLogoImageSource = () => {
    return roomData.currentParticipant < roomData.maxParticipant
      ? require('../../../assets/baby_phonix.png')
      : require('../../../assets/baby_phonix_disabled.png');
  };

  return (
    <TouchableOpacity
      style={[
        styles.roomContainer,
        {
          backgroundColor: theme.background,
          borderColor: 'transparent',
          borderWidth: 0,
          elevation: 8,
        },
      ]}
      onPress={handleJoinRoom}>
      <View style={styles.cardContent}>
        <View style={styles.mainInfo}>
          <View style={styles.titleContainer}>
            <View
              style={[
                styles.statusContainer,
                {backgroundColor: statusStyle.backgroundColor},
              ]}>
              <Text style={[styles.statusText, {color: statusStyle.textColor}]}>
                {statusStyle.statusText}
              </Text>
            </View>
            <View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.title, {color: theme.text, maxWidth: 180}]}>
                {roomData.title}
              </Text>
            </View>
            <View style={styles.participantInfo}>
              <Image
                source={getLogoImageSource()}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.participantNumText,
                  {color: getParticipantCountColor()},
                ]}>
                {roomData.currentParticipant}/{roomData.maxParticipant}
              </Text>
            </View>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsText, {color: theme.text}]}>
              {roomData.departureLocation}
            </Text>

            <DottedArrow
              width={100}
              height={25}
              color={isDarkMode ? 'white' : 'black'}
            />

            <Text style={[styles.detailsText, {color: theme.text}]}>
              {roomData.destinationLocation}
            </Text>
          </View>
          <Text style={[styles.departureTime, {color: theme.subText}]}>
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
  participantInfo: {
    flexDirection: 'row',
    gap: 5,
    marginLeft: 'auto',
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
