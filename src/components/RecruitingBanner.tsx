import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import EncryptedStorage from 'react-native-encrypted-storage';
import {RECRUITING_BANNER_DISMISSED_KEY} from '@utils/storage-keys';

type RecruitingBannerProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    keyof RootStackParamList
  >;
};

const RecruitingBanner = ({navigation}: RecruitingBannerProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const checkDismissed = async () => {
      try {
        const value = await EncryptedStorage.getItem(
          RECRUITING_BANNER_DISMISSED_KEY,
        );
        setDismissed(value === 'true');
      } catch (_e) {
        setDismissed(false);
      }
    };
    checkDismissed();
  }, []);

  const handleDismiss = async () => {
    setDismissed(true);
    try {
      await EncryptedStorage.setItem(RECRUITING_BANNER_DISMISSED_KEY, 'true');
    } catch (_e) {
      // no-op
    }
  };

  if (dismissed) {
    return null;
  }

  const bgColor = isDarkMode ? '#312E81' : '#EEF2FF';
  const textColor = isDarkMode ? '#C7D2FE' : '#3730A3';
  const iconColor = isDarkMode ? '#818CF8' : '#4F46E5';
  const closeColor = isDarkMode ? '#6366F1' : '#6B7280';

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.banner, {backgroundColor: bgColor}]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Recruiting')}>
        <Icon name="code" size={20} color={iconColor} />
        <Text style={[styles.text, {color: textColor}]} numberOfLines={1}>
          POPO 앱 개발자를 모집합니다!
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={handleDismiss}>
          <Icon name="close" size={18} color={closeColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});

export default RecruitingBanner;
