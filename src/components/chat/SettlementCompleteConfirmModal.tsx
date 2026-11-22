import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';

import {backgroundColor, textColor} from '@styles/default';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const SettlementCompleteConfirmModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const {t} = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
      hardwareAccelerated>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.card, {backgroundColor: backgroundColor(isDarkMode)}]}
          onStartShouldSetResponder={() => true}>
          <Text style={[styles.title, {color: textColor(isDarkMode)}]}>
            {t('paxi.settlement.completeConfirmTitle')}
          </Text>
          <Text
            style={[
              styles.message,
              {color: isDarkMode ? '#A7A7AD' : '#6B6F76'},
            ]}>
            {t('paxi.settlement.completeConfirmBody')}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.btn,
                {backgroundColor: isDarkMode ? '#222' : '#f2f2f2'},
              ]}
              onPress={onClose}>
              <Text style={[styles.btnText, {color: textColor(isDarkMode)}]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                {backgroundColor: isDarkMode ? '#333' : 'black'},
              ]}
              onPress={onConfirm}>
              <Text style={[styles.btnText, {color: '#FFFFFF'}]}>
                {t('paxi.settlement.completeConfirmSubmit')}
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    width: '82%',
    borderRadius: 12,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SettlementCompleteConfirmModal;
