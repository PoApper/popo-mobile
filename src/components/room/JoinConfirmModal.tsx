import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Pressable,
} from 'react-native';
import moment from 'moment';

import {ChatRoomInfo} from '@interfaces/paxi';

type Props = {
  visible: boolean;
  room: ChatRoomInfo;
  onClose: () => void;
  onConfirm: () => void;
};

const JoinConfirmModal: React.FC<Props> = ({
  visible,
  room,
  onClose,
  onConfirm,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const C = {
    bg: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)',
    card: isDarkMode ? '#1B1C1F' : '#FFFFFF',
    text: isDarkMode ? '#EDEDED' : '#101113',
    subText: isDarkMode ? '#A7A7AD' : '#6B6F76',
    border: isDarkMode ? '#2A2C2F' : '#E5E7EB',
    primary: '#111827',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable
        style={[styles.overlay, {backgroundColor: C.bg}]}
        onPress={onClose}>
        <View
          style={[
            styles.card,
            {backgroundColor: C.card, borderColor: C.border},
          ]}
          onStartShouldSetResponder={() => true}>
          {/* Header: category + participant chip */}
          <View style={styles.headerRow}>
            <Text style={[styles.category, {color: C.subText}]}>
              {`${room.title}`}
            </Text>
            <View
              style={[
                styles.participantChip,
                {
                  backgroundColor: isDarkMode
                    ? 'rgba(250,87,33,0.18)'
                    : '#FFF4E6',
                },
              ]}>
              <Image
                source={require('../../../assets/baby_phonix.png')}
                style={{width: 16, height: 16, marginRight: 4}}
                resizeMode="contain"
              />
              <Text style={{color: '#FA5721', fontWeight: '700'}}>
                {room.currentParticipant}/{room.maxParticipant}
              </Text>
            </View>
          </View>

          {/* Route */}
          <View style={styles.routeLabelsRow}>
            <View style={styles.leftCol}>
              <Text style={[styles.routeLabel, {color: C.subText}]}>
                출발지
              </Text>
            </View>
            <View style={styles.rightCol}>
              <Text style={[styles.routeLabel, {color: C.subText}]}>
                도착지
              </Text>
            </View>
          </View>
          <View style={styles.routeRow}>
            <View style={styles.leftCol}>
              <Text
                style={[styles.routeText, {color: C.text, textAlign: 'center'}]}
                numberOfLines={2}>
                {room.departureLocation}
              </Text>
            </View>
            <View style={styles.arrowOverlay}>
              <Text style={[styles.arrow, {color: C.subText}]}>›</Text>
            </View>
            <View style={styles.rightCol}>
              <Text
                style={[styles.routeText, {color: C.text, textAlign: 'center'}]}
                numberOfLines={2}>
                {room.destinationLocation}
              </Text>
            </View>
          </View>

          {/* Date */}
          <Text style={[styles.dateText, {color: C.subText}]}>
            {moment(room.departureTime).format('M월 D일 HH시 mm분 출발')}
          </Text>

          {/* Description */}
          {!!room.description && (
            <Text style={[styles.desc, {color: C.text}]} numberOfLines={3}>
              {room.description}
            </Text>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, {backgroundColor: C.border}]}
              onPress={onClose}>
              <Text style={{color: C.text}}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, {backgroundColor: C.primary}]}
              onPress={onConfirm}>
              <Text style={{color: '#FFFFFF'}}>입장하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  category: {fontSize: 12, fontWeight: '600'},
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  routeLabel: {fontSize: 11, fontWeight: '600'},
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
    position: 'relative',
    minHeight: 60, // 2줄 텍스트를 위한 최소 높이
  },
  arrow: {fontSize: 18},
  arrowOverlay: {position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', height: 60},
  leftCol: {flex: 1, alignItems: 'center'},
  rightCol: {flex: 1, alignItems: 'center'},
  routeText: {fontSize: 20, fontWeight: '800'},
  dateText: {fontSize: 12, marginBottom: 10, textAlign: 'center'},
  desc: {fontSize: 12, marginBottom: 14},
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
