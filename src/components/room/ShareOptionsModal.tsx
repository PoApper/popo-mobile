import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Pressable,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

import {ChatRoomInfo} from '@interfaces/paxi';

type Props = {
  visible: boolean;
  room: ChatRoomInfo;
  onClose: () => void;
  onAppShare: () => void;
  onLinkCopy: () => void;
};

const ShareOptionsModal: React.FC<Props> = ({
  visible,
  room,
  onClose,
  onAppShare,
  onLinkCopy,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const C = {
    bg: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)',
    card: isDarkMode ? '#1B1C1F' : '#FFFFFF',
    text: isDarkMode ? '#EDEDED' : '#101113',
    subText: isDarkMode ? '#A7A7AD' : '#6B6F76',
    border: isDarkMode ? '#2A2C2F' : '#E5E7EB',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
      hardwareAccelerated>
      <Pressable
        style={[styles.overlay, {backgroundColor: C.bg}]}
        onPress={onClose}>
        <View
          style={[
            styles.card,
            {backgroundColor: C.card, borderColor: C.border},
          ]}
          onStartShouldSetResponder={() => true}>
          {/* Header */}
          <Text style={[styles.title, {color: C.text}]}>공유하기</Text>

          {/* Room Info */}
          <View style={styles.roomInfo}>
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
                  style={[
                    styles.routeText,
                    {color: C.text, textAlign: 'center'},
                  ]}
                  numberOfLines={2}>
                  {room.departureLocation}
                </Text>
              </View>
              <View style={styles.rightCol}>
                <Text
                  style={[
                    styles.routeText,
                    {color: C.text, textAlign: 'center'},
                  ]}
                  numberOfLines={2}>
                  {room.destinationLocation}
                </Text>
              </View>
            </View>
            <Text style={[styles.dateText, {color: C.subText}]}>
              {moment(room.departureTime).format('M월 D일 HH시 mm분 출발')}
            </Text>
          </View>

          {/* Share Options */}
          <View style={styles.shareOptions}>
            <TouchableOpacity
              style={[
                styles.shareButton,
                {backgroundColor: C.card, borderColor: C.border},
              ]}
              onPress={() => {
                onClose();
                setTimeout(onAppShare, 300);
              }}>
              <Icon name="share" size={24} color={C.text} />
              <Text style={[styles.shareButtonText, {color: C.text}]}>
                다른 앱으로 공유
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shareButton,
                {backgroundColor: C.card, borderColor: C.border},
              ]}
              onPress={() => {
                onLinkCopy();
                onClose();
              }}>
              <Icon name="link" size={24} color={C.text} />
              <Text style={[styles.shareButtonText, {color: C.text}]}>
                링크 복사
              </Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, {backgroundColor: C.border}]}
            onPress={onClose}>
            <Text style={{color: C.text}}>취소</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  roomInfo: {
    marginBottom: 20,
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
  },
  leftCol: {flex: 1, alignItems: 'center'},
  rightCol: {flex: 1, alignItems: 'center'},
  routeText: {fontSize: 18, fontWeight: '700'},
  dateText: {fontSize: 12, textAlign: 'center'},
  shareOptions: {
    gap: 12,
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default ShareOptionsModal;
