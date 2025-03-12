import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  useColorScheme,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../utils/api';
import axios from 'axios';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#F3F4F6',
    flex: 1,
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // 응답 데이터
      const data = response.data;

      // 서버에서 받은 쿠키 확인 및 저장
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        console.log('서버에서 받은 쿠키:', setCookie);

        // 쿠키 파싱 (예: Authentication=value;)
        const authCookie = setCookie.find(cookie => cookie.includes('Authentication='));
        if (authCookie) {
          const tokenValue = authCookie.split('Authentication=')[1].split(';')[0];

          // 1. 쿠키를 RN 쿠키 저장소에 저장
          await CookieManager.set(
            'https://api.popo-dev.poapper.club',
            {
              name: 'Authentication',
              value: tokenValue,
              path: '/',
              secure: true,
              httpOnly: true
            }
          );

          // 2. 안전한 저장소에 토큰 저장 (앱 재시작 시 사용)
          await EncryptedStorage.setItem('auth_token', tokenValue);

          console.log('인증 토큰 저장 완료');
        }
      }

      // 사용자 정보 저장 (필요시)
      if (data.user) {
        await EncryptedStorage.setItem('user_info', JSON.stringify(data.user));
      }

      // 로그인 상태 저장
      await EncryptedStorage.setItem('isAuthenticated', 'true');

      // 로그인 성공
      Alert.alert('로그인 성공', '환영합니다!');
      console.log('로그인 성공:', data);

      // 사용자 상세 정보 페이지로 이동
      navigation.navigate('UserDetail', {
        userId: data.user?.id || 'unknown',
        userData: data.user || {}
      });
    } catch (err: unknown) {
      console.error('로그인 오류:', err);

      // axios 오류 처리
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          const errorMsg = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
          setError(errorMsg);
          Alert.alert('연결 오류', errorMsg);
        } else {
          // 서버 응답 오류
          const errorMsg = err.response?.data?.message || err.message || '로그인 중 오류가 발생했습니다.';
          setError(errorMsg);
          Alert.alert('로그인 실패', errorMsg);
        }
      } else {
        // 기타 오류
        const errorMessage = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
        setError(errorMessage);
        Alert.alert('로그인 실패', errorMessage);
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
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/popo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            이메일
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
                color: isDarkMode ? '#FFFFFF' : '#000000',
                borderColor: isDarkMode ? '#555555' : '#E5E7EB',
              }
            ]}
            placeholder="이메일 주소를 입력하세요"
            placeholderTextColor={isDarkMode ? '#AAAAAA' : '#9CA3AF'}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : '#000000', marginTop: 16 }]}>
            비밀번호
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
                color: isDarkMode ? '#FFFFFF' : '#000000',
                borderColor: isDarkMode ? '#555555' : '#E5E7EB',
              }
            ]}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor={isDarkMode ? '#AAAAAA' : '#9CA3AF'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
              비밀번호를 잊으셨나요?
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
              계정이 없으신가요?
            </Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    marginBottom: 48,
  },
  logoImage: {
    width: 3000,
    height: 120,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#9BA3AF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
    marginRight: 4,
  },
  signupLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LoginScreen;