import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import moment from 'moment';

import {ChatRoomInfo, UserData} from '@interfaces/paxi';

type Props = {
  visible: boolean;
  room: ChatRoomInfo;
  onClose: () => void;
  onConfirm: () => void;
};

const JoinConfirmModal: React.FC<Props> = ({visible, room, onClose, onConfirm}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const C = {
    bg: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)',
    card: isDarkMode ? '#1B1C1F' : '#FFFFFF',
    text: isDarkMode ? '#EDEDED' : '#101113',
    subText: isDarkMode ? '#A7A7AD' : '#6B6F76',
    border: isDarkMode ? '#2A2C2F' : '#E5E7EB',
    primary: '#111827',
  };

  const participantPreview = (room.roomUsers || []).slice(0, 3);
  const remain = Math.max((room.roomUsers || []).length - participantPreview.length, 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, {backgroundColor: C.bg}]}> 
        <View style={[styles.card, {backgroundColor: C.card, borderColor: C.border}]}> 
          <Text style={[styles.title, {color: C.text}]} numberOfLines={1}>{room.title}</Text>

          <View style={styles.routeRow}>
            <Text style={[styles.routeText, {color: C.text}]} numberOfLines={1}>{room.departureLocation}</Text>
            <Text style={[styles.arrow, {color: C.subText}]}>›</Text>
            <Text style={[styles.routeText, {color: C.text}]} numberOfLines={1}>{room.destinationLocation}</Text>
          </View>

          <Text style={[styles.dateText, {color: C.subText}]}> 
            {moment(room.departureTime).format('YYYY년 MM월 DD일 HH시 mm분 출발')}
          </Text>

          {!!room.description && (
            <Text style={[styles.desc, {color: C.subText}]} numberOfLines={3}>{room.description}</Text>
          )}

          <View style={[styles.infoRow, {borderColor: C.border}]}> 
            <Text style={{color: C.text, fontWeight: '600'}}>인원</Text>
            <Text style={{color: C.text}}>
              {room.currentParticipant}/{room.maxParticipant}
            </Text>
          </View>

          <View style={[styles.infoRow, {borderColor: C.border}]}> 
            <Text style={{color: C.text, fontWeight: '600'}}>참여자</Text>
            <Text style={{color: C.subText}} numberOfLines={1}>
              {participantPreview.map((u: UserData) => u.nickname).join(', ')}
              {remain > 0 ? ` 외 ${remain}명` : ''}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, {backgroundColor: C.border}]} onPress={onClose}>
              <Text style={{color: C.text}}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, {backgroundColor: C.primary}]} onPress={onConfirm}>
              <Text style={{color: '#FFFFFF'}}>입장하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  arrow: {fontSize: 18},
  routeText: {fontSize: 16, fontWeight: '600'},
  dateText: {fontSize: 13, marginBottom: 8},
  desc: {fontSize: 13, marginBottom: 12},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default JoinConfirmModal;


