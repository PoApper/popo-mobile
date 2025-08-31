import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';

type LeaveScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Leave'>;
};

const LeaveScreen = ({navigation}: LeaveScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const inputBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const inputBorderColor = isDarkMode ? '#333333' : '#D0D0D0';
  const placeholderColor = isDarkMode ? '#757575' : '#9CA3AF';
  const secondaryButtonBg = isDarkMode ? '#2A2A2A' : '#f2f3f5';
  const secondaryTextColor = isDarkMode ? '#E0E0E0' : '#262626';

  const handleLeave = async () => {
    Alert.alert(
      '회원 탈퇴 확인',
      '정말로 회원 탈퇴를 하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            await performLeave();
          },
        },
      ],
    );
  };

  const performLeave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete('/user/me');

      // 모든 로컬 데이터 삭제
      await EncryptedStorage.clear();

      // 쿠키 삭제
      await CookieManager.clearAll();

      Alert.alert(
        '회원 탈퇴 완료',
        '회원 탈퇴가 완료되었습니다.\n이용해 주셔서 감사합니다.',
        [
          {
            text: '확인',
            onPress: () => {
              // 로그인 화면으로 이동
              navigation.reset({
                index: 0,
                routes: [{name: 'Login'}],
              });
            },
          },
        ],
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          const errorMsg =
            '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
          setError(errorMsg);
          Alert.alert('연결 오류', errorMsg);
        } else {
          const errorMsg =
            err.response?.data?.message ||
            err.message ||
            '회원 탈퇴 중 오류가 발생했습니다.';
          setError(errorMsg);
          Alert.alert('탈퇴 실패', errorMsg);
        }
      } else {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '회원 탈퇴 중 오류가 발생했습니다.';
        setError(errorMessage);
        Alert.alert('탈퇴 실패', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <KeyboardAwareScrollView
        style={[
          styles.container,
          {backgroundColor: backgroundStyle.backgroundColor},
        ]}
        contentContainerStyle={styles.contentContainer}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        extraHeight={120}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/icon/POPO_typography_bg_removed_cropped.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.title, {color: textColor}]}>회원 탈퇴</Text>
          <Text style={[styles.subtitle, {color: placeholderColor}]}>
            계정을 영구적으로 삭제합니다
          </Text>
        </View>

        <View
          style={[
            styles.warningContainer,
            {
              backgroundColor: isDarkMode ? '#2D1B1B' : '#FEF2F2',
              borderColor: isDarkMode ? '#7F1D1D' : '#FECACA',
            },
          ]}>
          <Text style={[styles.warningTitle, {color: '#EF4444'}]}>
            ⚠️ 주의사항
          </Text>
          <Text style={[styles.warningText, {color: textColor}]}>
            • 회원 탈퇴 시 모든 개인정보가 영구적으로 삭제됩니다{'\n'}• 예약
            내역, 채팅 기록 등 모든 데이터가 삭제됩니다{'\n'}• 이 작업은 되돌릴
            수 없습니다{'\n'}• 탈퇴 후 동일한 이메일로 재가입이 가능합니다
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={[
              styles.textArea,
              {
                marginTop: 11,
                backgroundColor: inputBackgroundColor,
                borderColor: inputBorderColor,
                color: textColor,
              },
            ]}
            placeholder="탈퇴 사유 (선택사항)"
            placeholderTextColor={placeholderColor}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.leaveButton,
              {
                marginTop: 20,
                backgroundColor: isLoading ? '#FCA5A5' : '#EF4444',
              },
            ]}
            onPress={handleLeave}
            disabled={isLoading}>
            <Text style={styles.leaveButtonText}>
              {isLoading ? '처리 중...' : '회원 탈퇴'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, {backgroundColor: secondaryButtonBg}]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}>
            <Text
              style={[styles.cancelButtonText, {color: secondaryTextColor}]}>
              취소
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Pretendard',
    textAlign: 'center',
    marginTop: -12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
  warningContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Pretendard',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  leaveButton: {
    borderRadius: 6,
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cancelButton: {
    borderRadius: 6,
    backgroundColor: '#f2f3f5',
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Pretendard',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Pretendard',
  },
});

export default LeaveScreen;
