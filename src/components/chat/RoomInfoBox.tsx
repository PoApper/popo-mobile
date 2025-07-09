import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import Svg, {Line} from 'react-native-svg';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';

import {ChatRoomInfo} from '@interfaces/paxi';

interface RoomInfoBoxProps {
  roomData: ChatRoomInfo;
  setModalVisible: (visible: boolean) => void;
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewChat'>;
  myUuid: string;
}

const RoomInfoBox = ({roomData, setModalVisible, navigation, myUuid}: RoomInfoBoxProps) => {
  const isOwner = myUuid === roomData.ownerUuid;
  return (
    <View style={styles.infoBox}>
      {isOwner && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setModalVisible(false);
            navigation.navigate('ModifyPaxiRoom', {
              roomUuid: roomData.uuid,
            });
          }}>
          <Icon name="edit" size={14} color="#999" />
          <Text style={styles.editText}>수정하기</Text>
        </TouchableOpacity>
      )}

      <View style={styles.labelRow}>
        <Text style={styles.labelText}>출발지</Text>
        <Text style={[styles.arrow, {opacity: 0}]}>→</Text>
        <Text style={styles.labelText}>도착지</Text>
      </View>
      <View style={styles.routeInfo}>
        <Text style={styles.location}>{roomData?.departureLocation}</Text>
        <Text style={styles.arrow}>→</Text>
        <Text style={styles.location}>{roomData?.destinationLocation}</Text>
      </View>

      <Text style={styles.timeText}>
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

      <Text style={styles.extraInfo}>{roomData?.description}</Text>
    </View>
  );
};

export default RoomInfoBox;

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: '#f2f3f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  editText: {
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  extraInfo: {
    fontSize: 11,
    color: '#4F4F4F',
    marginTop: 4,
  },
  dividerContainer: {
    marginTop: 6,
    marginBottom: 6,
  },
});
