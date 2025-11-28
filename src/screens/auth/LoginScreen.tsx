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
  Linking,
  Modal,
  Platform,
  ToastAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';
import Clipboard from '@react-native-clipboard/clipboard';

import {RootStackParamList} from '@navigation/types';
import api, {POPO_API_URL} from '@utils/api';
import {extractTokenFromCookie} from '@utils/cookie';
import {
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_INFO_KEY,
  IS_AUTHENTICATED_KEY,
} from '@utils/storage-keys';
import {getFCMToken} from '@utils/firebase';
import paxi_api from '@utils/paxi_api';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen = ({navigation}: LoginScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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
  const helpTextColor = isDarkMode ? '#60A5FA' : '#3b82f6';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', {
        email: email.includes('@') ? email : `${email}@postech.ac.kr`,
        password,
      });

      // 응답 데이터
      const data = response.data;

      // 서버에서 받은 쿠키 확인 및 저장
      const setCookie = response.headers['set-cookie'];
      if (!setCookie) {
        Alert.alert('오류', '로그인 정보를 받지 못했습니다.');
        return;
      }

      const authToken = extractTokenFromCookie(setCookie, true);
      if (!authToken) {
        Alert.alert('오류', '로그인 정보를 받지 못했습니다(Authentication).');
        return;
      }

      await CookieManager.set(POPO_API_URL, {
        name: 'Authentication',
        value: authToken,
        path: '/',
        secure: true,
        httpOnly: true,
      });

      await EncryptedStorage.setItem(AUTH_TOKEN_KEY, authToken);

      const refreshToken = extractTokenFromCookie(setCookie, false);
      if (!refreshToken) {
        Alert.alert('오류', '로그인 정보를 받지 못했습니다(Refresh).');
        return;
      }

      await CookieManager.set(POPO_API_URL, {
        name: 'Refresh',
        value: refreshToken,
        path: '/',
        secure: true,
        httpOnly: true,
      });

      await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      // 사용자 정보 저장 (필요시)
      if (data.user) {
        await EncryptedStorage.setItem(
          USER_INFO_KEY,
          JSON.stringify(data.user),
        );
      }

      // 로그인 상태 저장
      await EncryptedStorage.setItem(IS_AUTHENTICATED_KEY, 'true');

      // FCM 토큰 가져오기 및 저장
      getFCMToken()
        .then(fcmToken => {
          if (fcmToken) {
            paxi_api.post('/push/key/', {
              key: fcmToken,
            });
          }
        })
        .catch(fcmError => {
          console.error('FCM 토큰 발급 실패:', fcmError);
        });

      // 사용자 상세 정보 페이지로 이동
      navigation.navigate('Main', {
        userId: data.user?.id || 'unknown',
        userData: data.user || {},
        prevTab: 'Login',
      });
    } catch (err: unknown) {
      // axios 오류 처리
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          const errorMsg =
            '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
          setError(errorMsg);
          Alert.alert('연결 오류', errorMsg);
        } else {
          // 서버 응답 오류
          const errorMsg =
            err.response?.data?.message ||
            err.message ||
            '로그인 중 오류가 발생했습니다.';
          setError(errorMsg);
          Alert.alert('로그인 실패', errorMsg);
        }
      } else {
        // 기타 오류
        const errorMessage =
          err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
        setError(errorMessage);
        Alert.alert('로그인 실패', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const targetEmail = (resetEmail || email).trim();
      if (!targetEmail) {
        Alert.alert('입력 필요', '이메일을 입력해주세요.');
        return;
      }

      const normalizedEmail = targetEmail.includes('@')
        ? targetEmail
        : `${targetEmail}@postech.ac.kr`;

      await api.post('/auth/password/reset', {email: normalizedEmail});
      setShowResetModal(false);
      Alert.alert(
        '비밀번호 초기화 완료',
        '비밀번호가 초기화 되었습니다. 이메일을 통해 신규 비밀번호를 확인해주세요.',
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || '요청 처리 중 오류가 발생했습니다.';
      Alert.alert('초기화 실패', msg);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View
        style={[
          styles.container,
          {backgroundColor: backgroundStyle.backgroundColor},
        ]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/icon/POPO_typography_bg_removed_cropped.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          {/* Email/ID input with visual domain suffix */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBackgroundColor,
                  borderColor: inputBorderColor,
                  color: textColor,
                  // Ensure the text does not overlap with the suffix label
                  paddingRight: 150,
                },
              ]}
              placeholder="POSTECH 이메일"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              autoComplete="username" // ios
              textContentType="username" // ios
              autoCorrect={false}
              importantForAutofill="yes" // android
              accessibilityLabel="popo.poapper.club username"
            />
            {email && !email.includes('@') && (
              <Text
                style={[styles.inputSuffix, {color: placeholderColor}]}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants">
                @postech.ac.kr
              </Text>
            )}
          </View>
          <Text style={[styles.emailHintText, {color: placeholderColor}]}>
            POSTECH ID를 입력하면, 자동으로 @postech.ac.kr이 붙습니다
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                marginTop: 11,
                backgroundColor: inputBackgroundColor,
                borderColor: inputBorderColor,
                color: textColor,
              },
            ]}
            placeholder="비밀번호"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoComplete="password"
            textContentType="password"
            autoCorrect={false}
            importantForAutofill="yes"
            accessibilityLabel="popo.poapper.club password"
          />
          <Text style={[styles.emailHintText, {color: placeholderColor}]}>
            POPO 가입 시 사용한 비밀번호를 입력해주세요
          </Text>

          {/* Forgot Password */}
          <View style={{alignItems: 'center', marginTop: 6}}>
            <Text
              style={[
                styles.emailHintText,
                {textAlign: 'center', color: placeholderColor, marginLeft: 0},
              ]}>
              비밀번호를 잊으셨나요?{' '}
              <Text
                style={{color: helpTextColor, fontWeight: '600'}}
                onPress={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}>
                비밀번호 찾기
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              {marginTop: 11},
              isDarkMode
                ? {
                    backgroundColor: isLoading ? '#444' : '#fff',
                    borderWidth: 1,
                    borderColor: '#888',
                  }
                : {},
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}>
            <Text
              style={[
                styles.loginButtonText,
                isDarkMode ? {color: isLoading ? '#bbb' : '#000'} : {},
              ]}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={[styles.splitterContainer]}>
            <View
              style={[
                styles.lineView,
                {borderColor: isDarkMode ? '#555555' : '#9b9b9b'},
              ]}
            />
            <Text
              style={[
                styles.splitterText,
                {color: isDarkMode ? '#AAAAAA' : '#9b9b9b'},
              ]}>
              또는
            </Text>
            <View
              style={[
                styles.lineView,
                {borderColor: isDarkMode ? '#555555' : '#9b9b9b'},
              ]}
            />
          </View>

          <View style={styles.signupContainer}>
            <TouchableOpacity
              style={[
                styles.signupButton,
                {backgroundColor: secondaryButtonBg},
              ]}
              onPress={() => navigation.navigate('Signup')}
              disabled={isLoading}>
              <Text
                style={[styles.signupButtonText, {color: secondaryTextColor}]}>
                회원가입
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.needHelp}
            onPress={async () => {
              try {
                const url =
                  'https://docs.google.com/forms/d/1J23um5RDRTdKC9bscZnixPhEeon6qz4DQRTJYMtFJTU/viewform?edit_requested=true';
                const supported = await Linking.canOpenURL(url);

                if (supported) {
                  await Linking.openURL(url);
                } else {
                  Alert.alert(
                    '링크 열기 실패',
                    '브라우저를 열 수 없습니다. 아래 링크를 복사하여 브라우저에서 열어주세요:\n\n' +
                      url,
                    [
                      {
                        text: '복사',
                        onPress: () => {
                          Clipboard.setString(url);
                          if (Platform.OS === 'android') {
                            ToastAndroid.show('링크가 복사되었습니다', ToastAndroid.SHORT);
                          } else {
                            Alert.alert('복사됨', '링크가 클립보드에 복사되었습니다.');
                          }
                        },
                      },
                      {text: '확인', style: 'default'},
                    ],
                  );
                }
              } catch (error) {
                console.error('링크 열기 오류:', error);
                Alert.alert(
                  '오류',
                  '링크를 열 수 없습니다. 네트워크 연결을 확인해주세요.',
                  [{text: '확인', style: 'default'}],
                );
              }
            }}>
            <Text style={[styles.needHelpText, {color: helpTextColor}]}>
              도움이 필요하세요?
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Reset Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF'},
            ]}>
            <Text style={[styles.modalTitle, {color: textColor}]}>
              비밀번호 초기화
            </Text>
            <Text style={[styles.modalDesc, {color: placeholderColor}]}>
              POPO 가입 때 사용한 email을 입력해주세요.
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  marginTop: 12,
                  backgroundColor: inputBackgroundColor,
                  borderColor: inputBorderColor,
                  color: textColor,
                },
              ]}
              placeholder="이메일"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
              value={resetEmail}
              onChangeText={setResetEmail}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: secondaryButtonBg}]}
                onPress={() => setShowResetModal(false)}>
                <Text
                  style={[styles.modalBtnText, {color: secondaryTextColor}]}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handlePasswordReset}>
                <Text style={styles.modalPrimaryBtnText}>비밀번호 초기화</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    height: 200,
  },
  formContainer: {
    width: '100%',
    marginTop: 10,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 42,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#D0D0D0',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputSuffix: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    fontSize: 16,
    lineHeight: 42,
  },
  loginButton: {
    borderRadius: 6,
    backgroundColor: '#0B0B0B',
    width: '100%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#9BA3AF',
  },
  loginButtonText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#ffffff',
    textAlign: 'center',
  },
  splitterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
  },
  lineView: {
    borderStyle: 'solid',
    borderColor: '#9b9b9b',
    borderTopWidth: 1,
    flex: 1,
    height: 2,
    width: '100%',
  },
  splitterText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    color: '#9b9b9b',
    textAlign: 'center',
    width: 25,
  },
  needHelp: {
    alignItems: 'center',
    marginTop: 16,
  },
  needHelpText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#3b82f6',
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 23,
  },
  signupButton: {
    borderRadius: 6,
    backgroundColor: '#f2f3f5',
    flex: 1,
    width: '100%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#262626',
    fontFamily: 'Pretendard',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  emailHintText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'Pretendard',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '85%',
    borderRadius: 10,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'Pretendard',
  },
  modalDesc: {
    fontSize: 12,
    fontFamily: 'Pretendard',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    gap: 10,
  },
  modalBtn: {
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Pretendard',
  },
  modalPrimaryBtn: {
    borderRadius: 6,
    backgroundColor: '#0B0B0B',
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Pretendard',
  },
});

export default LoginScreen;
