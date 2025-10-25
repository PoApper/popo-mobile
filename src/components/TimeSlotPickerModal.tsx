import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';

export type ConcreteTimeSlot = {
  label: string;
  start: Date;
  end: Date;
  disabled: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  slots: ConcreteTimeSlot[];
  onSelectSlot: (slot: ConcreteTimeSlot) => void;
};

const TimeSlotPickerModal: React.FC<Props> = ({
  visible,
  onClose,
  slots,
  onSelectSlot,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const bg = isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)';
  const cardBg = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={[styles.overlay, {backgroundColor: bg}]}>
        <View style={[styles.card, {backgroundColor: cardBg, borderColor}]}>
          <Text style={[styles.title, {color: textColor}]}>시간대 선택</Text>
          <View style={styles.slotList}>
            {slots.map((slot, idx) => {
              const isDisabled = slot.disabled;
              return (
                <TouchableOpacity
                  key={`${slot.label}-${idx}`}
                  style={[
                    styles.slotItem,
                    {
                      borderColor,
                      backgroundColor: isDisabled
                        ? isDarkMode
                          ? '#2A2A2A'
                          : '#F3F4F6'
                        : isDarkMode
                        ? '#262626'
                        : '#F9FAFB',
                      opacity: isDisabled ? 0.5 : 1,
                    },
                  ]}
                  disabled={isDisabled}
                  onPress={() => onSelectSlot(slot)}>
                  <Text style={[styles.slotLabel, {color: textColor}]}>
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, {borderColor}]}
              onPress={onClose}>
              <Text style={[styles.actionText, {color: textColor}]}>닫기</Text>
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
    padding: 20,
  },
  card: {
    width: '100%',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  slotList: {
    gap: 8,
    marginBottom: 8,
  },
  slotItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  slotLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TimeSlotPickerModal;
