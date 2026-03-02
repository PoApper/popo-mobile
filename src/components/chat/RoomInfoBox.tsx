import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import 'moment/locale/ko';
import Svg, {Line} from 'react-native-svg';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import Config from 'react-native-config';
import {ChatRoomInfo} from '@interfaces/paxi';
import {textColor} from '@styles/default';

interface RoomInfoBoxProps {
  roomData: ChatRoomInfo;
  setModalVisible: (visible: boolean) => void;
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewChat'>;
  myUuid: string;
}

const RoomInfoBox = ({
  roomData,
  setModalVisible,
  navigation,
  myUuid,
}: RoomInfoBoxProps) => {
  const isOwner = myUuid === roomData.ownerUuid;
  const isDarkMode = useColorScheme() === 'dark';

  const isProduction = Config.ENV === 'prod';
  const domain = isProduction ? 'popo.poapper.club' : 'popo-dev.poapper.club';
  const shareUrl = `https://${domain}/room/${roomData.uuid}`;

  const handleShare = async () => {
    try {
      const departureDate = moment(roomData.departureTime)
        .locale('ko')
        .format('M/D(ddd) HH:mm');
      const shareMessage = `${departureDate} ${roomData.departureLocation}→${roomData.destinationLocation}\n${shareUrl}`;
      await Share.share({message: shareMessage});
    } catch (error: any) {
      // 사용자가 공유를 취소한 경우 에러를 무시
      if (error.message !== 'User did not share') {
        console.error('공유 오류:', error);
      }
    }
  };

  return (
    <View
      style={[
        styles.infoBox,
        {backgroundColor: isDarkMode ? '#333' : '#f2f3f5'},
      ]}>
      {/* Action buttons row */}
      <View style={styles.actionsRow}>
        {isOwner && roomData.status === 'ACTIVE' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setModalVisible(false);
              navigation.navigate('ModifyPaxiRoom', {
                roomUuid: roomData.uuid,
              });
            }}>
            <Icon name="edit" size={14} color="#999" />
            <Text style={styles.actionText}>수정하기</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Icon name="share" size={14} color="#999" />
          <Text style={styles.actionText}>공유하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.labelText}>출발지</Text>
        <Text style={[styles.arrow, {opacity: 0}]}>→</Text>
        <Text style={styles.labelText}>도착지</Text>
      </View>
      <View style={styles.routeInfo}>
        <Text
          style={[styles.location, {color: textColor(isDarkMode)}]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}>
          {roomData?.departureLocation}
        </Text>
        <Text style={[styles.arrow, {color: textColor(isDarkMode)}]}>→</Text>
        <Text
          style={[styles.location, {color: textColor(isDarkMode)}]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}>
          {roomData?.destinationLocation}
        </Text>
      </View>

      <Text style={[styles.timeText, {color: isDarkMode ? '#aaa' : '#666'}]}>
        {moment(roomData?.departureTime).format('Y년 M월 D일 HH:mm')} 출발
      </Text>

      <View style={styles.dividerContainer}>
        <Svg height="2" width="100%">
          <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="#ddd"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        </Svg>
      </View>

      <Text
        style={[styles.extraInfo, {color: isDarkMode ? '#999' : '#4F4F4F'}]}>
        {roomData?.description}
      </Text>
    </View>
  );
};

export default RoomInfoBox;

const styles = StyleSheet.create({
  infoBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#999',
    fontSize: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  labelText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    flex: 1,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  locationBlock: {
    alignItems: 'center',
    // marginHorizontal: 20,
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    flex: 1,
  },
  subText: {
    fontSize: 10,
    color: '#666',
  },
  arrow: {
    fontSize: 24,
    color: '#333',
    marginHorizontal: 20,
    textAlignVertical: 'center',
  },
  timeText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
  },
  extraInfo: {
    fontSize: 11,
    marginTop: 4,
  },
  dividerContainer: {
    marginTop: 6,
    marginBottom: 6,
  },
});
