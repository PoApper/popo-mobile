import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
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
  // const isDarkMode = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundStyle = {
    backgroundColor: '#ffffff',
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
        barStyle='light-content'
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/popo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.loginScreenTitle}>
            로그인/회원가입
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input]}
            placeholder="POPO에 가입된 이메일"
            placeholderTextColor='#9CA3AF'
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={[styles.input, {marginTop: 11, color: '#000000'}]}
            placeholder="비밀번호"
            placeholderTextColor='#9CA3AF'
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[
              styles.loginButton,
              {marginTop: 11},
              isLoading && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '로그인 중...' : '계속하기'}
            </Text>
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={[styles.splitterContainer]}>
            <View style={styles.lineView} />
            <Text style={styles.splitterText}>또는</Text>
            <View style={styles.lineView} />
      		</View>

          <View style={styles.signupContainer}>
            <TouchableOpacity
              style={[styles.signupButton]}
              onPress={() => navigation.navigate('Signup')}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                회원가입
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.needHelp}>
            <Text style={[styles.needHelpText]}>
              도움이 필요하세요?
            </Text>
          </TouchableOpacity>
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
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 500,
    height: 100,
  },
  loginScreenTitle: {
    fontSize: 22,
    letterSpacing: -0.2,
    fontWeight: "600",
    fontFamily: "Pretendard",
    color: "#000",
    textAlign: "center",
    width: 169
  },
  formContainer: {
    width: '100%',
    marginTop: 34,
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 42,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#D0D0D0",
    paddingHorizontal: 16,
    fontSize: 16,
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
    fontWeight: "500",
    fontFamily: "Pretendard",
    color: "#ffffff",
    textAlign: "center"
  },
  splitterContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 18,
  },
  lineView: {
    borderStyle: "solid",
    borderColor: "#9b9b9b",
    borderTopWidth: 1,
    flex: 1,
    height: 2,
    width: "100%",
  },
  splitterText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "Pretendard",
    color: "#9b9b9b",
    textAlign: "center",
    width: 25
  },
  needHelp: {
    alignItems: 'center',
    marginTop: 16,
  },
  needHelpText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Pretendard",
    color: "#3b82f6",
    textAlign: "center",
    width: 101,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 23,
  },
  signupButton: {
    borderRadius: 6,
    backgroundColor: "#f2f3f5",
    flex: 1,
    width: "100%",
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#262626",
    fontFamily: "Pretendard",
  },
  errorText: {
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LoginScreen;