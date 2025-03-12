import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../utils/api';

type UserDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserDetail'>;
  route: RouteProp<RootStackParamList, 'UserDetail'>;
};

const UserDetailScreen = ({ route, navigation }: UserDetailScreenProps) => {
  const { userId, userData } = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [userDataState, setUserData] = useState(userData);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#F3F4F6',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';

  // 사용자 프로필 정보를 가져오는 함수
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      // 공통 API 유틸리티 사용
      const response = await api.get('/auth/myInfo');

      console.log('사용자 프로필 데이터:', response.data);

      // 사용자 데이터 업데이트
      if (response.data) {
        // 상태 업데이트
        setUserData(response.data);

        // 저장소에도 최신 정보 저장
        await EncryptedStorage.setItem('user_info', JSON.stringify(response.data));
      }
    } catch (error: unknown) {
      console.error('프로필 가져오기 오류:', error);

      if (axios.isAxiosError(error)) {
        console.error('response data', error.response?.data);

        if (error.response?.status === 401) {
          // 인증 오류인 경우
          await handleAuthError();
        } else {
          Alert.alert('오류', '사용자 정보를 가져오는데 실패했습니다.');
        }
      } else {
        Alert.alert('오류', '사용자 정보를 가져오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 오류 처리
  const handleAuthError = async () => {
    // 인증 정보 초기화
    await EncryptedStorage.removeItem('auth_token');
    await EncryptedStorage.removeItem('isAuthenticated');
    await EncryptedStorage.removeItem('user_info');
    await CookieManager.clearAll();

    Alert.alert('인증 오류', '세션이 만료되었습니다. 다시 로그인해주세요.', [
      { text: '확인', onPress: () => navigation.replace('Login') }
    ]);
  };

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // 공통 API 유틸리티 사용
      await api.get('/auth/logout');

      // 인증 정보 초기화
      await EncryptedStorage.removeItem('auth_token');
      await EncryptedStorage.removeItem('isAuthenticated');
      await EncryptedStorage.removeItem('user_info');
      await CookieManager.clearAll();

      // 로그아웃 성공 후 처리
      Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
      navigation.replace('Login');
    } catch (error) {
      console.error('로그아웃 오류:', error);

      // 로그아웃 실패해도 로컬 인증 정보는 삭제
      await EncryptedStorage.removeItem('auth_token');
      await EncryptedStorage.removeItem('isAuthenticated');
      await EncryptedStorage.removeItem('user_info');
      await CookieManager.clearAll();

      Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
      navigation.replace('Login');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    // 서버에서 최신 사용자 정보 가져오기
    fetchUserProfile();
  }, []);

  // 로컬에 저장된 사용자 정보로 UI 초기화
  useEffect(() => {
    const loadStoredUserInfo = async () => {
      try {
        const storedUserInfo = await EncryptedStorage.getItem('user_info');
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          setUserData(userInfo);
        }
      } catch (error) {
        console.error('저장된 사용자 정보 로드 오류:', error);
      }
    };

    loadStoredUserInfo();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: textColor }]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>사용자 정보</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.container}>
        <View style={[styles.profileCard, { backgroundColor: cardBgColor, borderColor }]}>
          <View style={styles.profileHeader}>
            {userDataState.profileImage ? (
              <Image
                source={{ uri: userDataState.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: '#4F46E5' }]}>
                <Text style={styles.profileImagePlaceholderText}>
                  {userDataState.name?.substring(0, 1) || userDataState.email?.substring(0, 1) || '?'}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: textColor }]}>
                {userDataState.name || '사용자'}
              </Text>
              <Text style={[styles.userEmail, { color: isDarkMode ? '#AAAAAA' : '#6B7280' }]}>
                {userDataState.email || '이메일 없음'}
              </Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>계정 정보</Text>
            <View style={[styles.detailItem, { borderBottomColor: borderColor }]}>
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
                이메일
              </Text>
              <Text style={[styles.detailValue, { color: textColor }]}>
                {userDataState.email || '정보 없음'}
              </Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: borderColor }]}>
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
                이름
              </Text>
              <Text style={[styles.detailValue, { color: textColor }]}>
                {userDataState.name || '정보 없음'}
              </Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: borderColor }]}>
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
                회원 유형
              </Text>
              <Text style={[styles.detailValue, { color: textColor }]}>
                {userDataState.userType || '정보 없음'}
              </Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: borderColor }]}>
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
                계정 상태
              </Text>
              <Text style={[styles.detailValue, { color: textColor }]}>
                {userDataState.userStatus || '정보 없음'}
              </Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: borderColor }]}>
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
                가입일
              </Text>
              <Text style={[styles.detailValue, { color: textColor }]}>
                {userDataState.createdAt
                  ? new Date(userDataState.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '정보 없음'}
              </Text>
            </View>
          </View>
        </View>

        {/* 내 예약 확인하기 버튼 */}
        <TouchableOpacity
          style={[styles.reservationButton, { backgroundColor: '#4F46E5' }]}
          onPress={() => navigation.navigate('Reservation')}
        >
          <Text style={styles.reservationButtonText}>내 예약 확인하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutButtonText}>
            {isLoading ? '처리 중...' : '로그아웃'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
  },
  placeholderButton: {
    width: 40,
  },
  profileCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  detailSection: {
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  reservationButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 6,
  },
  reservationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserDetailScreen;