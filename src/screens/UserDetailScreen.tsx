import React, {useEffect, useState} from 'react';
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
  Platform,
  Clipboard,
  ToastAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import EncryptedStorage from 'react-native-encrypted-storage';
import api from '../utils/api';
import {getAuthToken} from '../utils/auth-token';
import Icon from 'react-native-vector-icons/MaterialIcons';

type UserDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserDetail'>;
  // route: RouteProp<RootStackParamList, 'UserDetail'>;
};

const UserDetailScreen = ({navigation}: UserDetailScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [userDataState, setUserData] = useState<any>(null);
  const [isDevOrTestEnv, setIsDevOrTestEnv] = useState(false);
  const [authTokenData, setAuthTokenData] = useState<any>(null);

  // authToken 정보 가져오기
  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        const token = await getAuthToken();
        console.log('정상적으로 가져온 authTokenData', token);
        setAuthTokenData(token);
      } catch (error) {
        console.error('Auth Token 가져오기 오류:', error);
      }
    };

    fetchAuthToken();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/myInfo');
      const userData = response.data;
      setUserData(userData);
    } catch (err) {
      console.error('프로필 정보 조회 오류:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        Alert.alert('인증 만료', '다시 로그인해주세요.', [
          {text: '확인', onPress: () => navigation.navigate('Login')},
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 오류 처리
  // const handleAuthError = async () => {
  //   // 인증 정보 초기화
  //   await EncryptedStorage.removeItem('auth_token');
  //   await EncryptedStorage.removeItem('isAuthenticated');
  //   await EncryptedStorage.removeItem('user_info');
  //   await CookieManager.clearAll();

  //   Alert.alert('인증 오류', '세션이 만료되었습니다. 다시 로그인해주세요.', [
  //     { text: '확인', onPress: () => navigation.replace('Login') },
  //   ]);
  // };

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // 공통 API 유틸리티 사용
      await api.get('/auth/logout');

      // 인증 정보 초기화
      if (await EncryptedStorage.getItem('auth_token')) {
        await EncryptedStorage.removeItem('auth_token');
      }
      if (await EncryptedStorage.getItem('isAuthenticated')) {
        await EncryptedStorage.removeItem('isAuthenticated');
      }
      if (await EncryptedStorage.getItem('user_info')) {
        await EncryptedStorage.removeItem('user_info');
      }
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

  // 컴포넌트 마운트 시 프로필 정보 가져오기
  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 로컬에 저장된 사용자 정보로 UI 초기화
  useEffect(() => {
    const loadStoredUserInfo = async () => {
      try {
        const res = await api.get('/auth/myInfo');
        setUserData(res.data);
      } catch (error) {
        console.error('저장된 사용자 정보 로드 오류:', error);
      }
    };

    loadStoredUserInfo();
  }, []);

  // 개발 환경 또는 TestFlight 환경 확인
  useEffect(() => {
    // __DEV__는 React Native에서 개발 환경을 나타내는 전역 변수
    if (__DEV__) {
      setIsDevOrTestEnv(true);
      return;
    }

    // TestFlight 환경 확인 (iOS)
    // iOS에서 TestFlight는 번들 ID에 특정 접미사가 있거나 특수 entitlement가 있음
    if (Platform.OS === 'ios') {
      // TestFlight 감지를 위한 간단한 방법 (실제로는 더 정확한 방법 사용이 필요할 수 있음)
      try {
        // iOS에서 TestFlight 환경을 감지하는 방법
        // 실제 앱에서는 RNDeviceInfo 같은 라이브러리를 활용하는 것이 좋음
        const isTestFlight = false; // 여기에 실제 TestFlight 감지 로직 필요
        setIsDevOrTestEnv(isTestFlight);
      } catch (error) {
        console.error('TestFlight 환경 감지 오류:', error);
      }
    }

    // Android 베타 환경 감지 (필요한 경우)
    if (Platform.OS === 'android') {
      // Beta/Internal 테스트 환경 감지 로직
      try {
        const isBetaEnv = false; // 여기에 실제 베타 환경 감지 로직 필요
        setIsDevOrTestEnv(isBetaEnv);
      } catch (error) {
        console.error('Android 베타 환경 감지 오류:', error);
      }
    }
  }, []);

  // 텍스트 복사 기능
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('복사되었습니다', ToastAndroid.SHORT);
    } else {
      Alert.alert('복사 완료', '클립보드에 복사되었습니다.');
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, {color: textColor}]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>
          사용자 정보
        </Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.container}>
        <View
          style={[
            styles.profileCard,
            {backgroundColor: cardBgColor, borderColor},
          ]}>
          <View style={styles.profileHeader}>
            {userDataState?.profileImage ? (
              <Image
                source={{uri: userDataState?.profileImage}}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  {backgroundColor: '#4F46E5'},
                ]}>
                <Text style={styles.profileImagePlaceholderText}>
                  {userDataState?.name?.substring(0, 1) ||
                    userDataState?.email?.substring(0, 1) ||
                    '?'}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, {color: textColor}]}>
                {userDataState?.name || '사용자'}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  {color: isDarkMode ? '#AAAAAA' : '#6B7280'},
                ]}>
                {userDataState?.email || '이메일 없음'}
              </Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              계정 정보
            </Text>
            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
              <Text
                style={[
                  styles.detailLabel,
                  {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                ]}>
                이메일
              </Text>
              <Text style={[styles.detailValue, {color: textColor}]}>
                {userDataState?.email || '정보 없음'}
              </Text>
            </View>

            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
              <Text
                style={[
                  styles.detailLabel,
                  {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                ]}>
                이름
              </Text>
              <Text style={[styles.detailValue, {color: textColor}]}>
                {userDataState?.name || '정보 없음'}
              </Text>
            </View>

            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
              <Text
                style={[
                  styles.detailLabel,
                  {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                ]}>
                회원 유형
              </Text>
              <Text style={[styles.detailValue, {color: textColor}]}>
                {userDataState?.userType || '정보 없음'}
              </Text>
            </View>

            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
              <Text
                style={[
                  styles.detailLabel,
                  {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                ]}>
                계정 상태
              </Text>
              <Text style={[styles.detailValue, {color: textColor}]}>
                {userDataState?.userStatus || '정보 없음'}
              </Text>
            </View>

            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
              <Text
                style={[
                  styles.detailLabel,
                  {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                ]}>
                가입일
              </Text>
              <Text style={[styles.detailValue, {color: textColor}]}>
                {userDataState?.createdAt
                  ? new Date(userDataState?.createdAt).toLocaleDateString(
                      'ko-KR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )
                  : '정보 없음'}
              </Text>
            </View>

            {/* 개발/테스트 환경에서만 표시되는 정보들 */}
            {isDevOrTestEnv && (
              <>
                {/* UUID 정보 */}
                <View
                  style={[styles.detailItem, {borderBottomColor: borderColor}]}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.titleContainer}>
                      <Text
                        style={[
                          styles.detailLabel,
                          {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                        ]}>
                        UUID
                      </Text>
                    </View>
                    <View style={styles.iconContainer}>
                      {userDataState?.uuid && (
                        <TouchableOpacity
                          style={styles.copyIconButton}
                          onPress={() => copyToClipboard(userDataState.uuid)}>
                          <Icon
                            name="content-copy"
                            size={16}
                            color={isDarkMode ? '#AAAAAA' : '#4F46E5'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={styles.tokenContainer}>
                    <Text
                      style={[styles.tokenValue, {color: textColor}]}
                      selectable={true}>
                      {userDataState?.uuid || '정보 없음'}
                    </Text>
                  </View>
                </View>

                {/* Auth Token (Cookie) 정보 */}
                <View
                  style={[styles.detailItem, {borderBottomColor: borderColor}]}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.titleContainer}>
                      <Text
                        style={[
                          styles.detailLabel,
                          {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                        ]}>
                        Auth Token (Cookie)
                      </Text>
                    </View>
                    <View style={styles.iconContainer}>
                      {authTokenData?.cookie && (
                        <TouchableOpacity
                          style={styles.copyIconButton}
                          onPress={() => copyToClipboard(authTokenData.cookie)}>
                          <Icon
                            name="content-copy"
                            size={16}
                            color={isDarkMode ? '#AAAAAA' : '#4F46E5'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={styles.tokenContainer}>
                    <Text
                      style={[styles.tokenValue, {color: textColor}]}
                      selectable={true}>
                      {authTokenData?.cookie || '정보 없음'}
                    </Text>
                  </View>
                </View>

                {/* Auth Token (Encrypted Storage) 정보 */}
                <View
                  style={[styles.detailItem, {borderBottomColor: borderColor}]}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.titleContainer}>
                      <Text
                        style={[
                          styles.detailLabel,
                          {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                        ]}>
                        Auth Token (Encrypted Storage)
                      </Text>
                    </View>
                    <View style={styles.iconContainer}>
                      {authTokenData?.encrypted_storage && (
                        <TouchableOpacity
                          style={styles.copyIconButton}
                          onPress={() =>
                            copyToClipboard(authTokenData.encrypted_storage)
                          }>
                          <Icon
                            name="content-copy"
                            size={16}
                            color={isDarkMode ? '#AAAAAA' : '#4F46E5'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={styles.tokenContainer}>
                    <Text
                      style={[styles.tokenValue, {color: textColor}]}
                      selectable={true}>
                      {authTokenData?.encrypted_storage || '정보 없음'}
                    </Text>
                  </View>
                </View>

                {/* FCM Token 정보 */}
                <View
                  style={[styles.detailItem, {borderBottomColor: borderColor}]}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.titleContainer}>
                      <Text
                        style={[
                          styles.detailLabel,
                          {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                        ]}>
                        FCM Token
                      </Text>
                    </View>
                    <View style={styles.iconContainer}>
                      {authTokenData?.fcm_token && (
                        <TouchableOpacity
                          style={styles.copyIconButton}
                          onPress={() =>
                            copyToClipboard(authTokenData.fcm_token)
                          }>
                          <Icon
                            name="content-copy"
                            size={16}
                            color={isDarkMode ? '#AAAAAA' : '#4F46E5'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View style={styles.tokenContainer}>
                    <Text
                      style={[styles.tokenValue, {color: textColor}]}
                      selectable={true}>
                      {authTokenData?.fcm_token || '정보 없음'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 내 예약 확인하기 버튼 */}
        <TouchableOpacity
          style={[styles.reservationButton, {backgroundColor: '#4F46E5'}]}
          onPress={() => navigation.navigate('Reservation')}>
          <Text style={styles.reservationButtonText}>내 예약 확인하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}>
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
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
    flexDirection: 'column',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginTop: 4,
  },
  uuidText: {
    maxWidth: '70%',
  },
  tokenContainer: {
    width: '100%',
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: '500',
    width: '100%',
    paddingVertical: 2,
  },
  tokenWithCopyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tokenWithCopy: {
    flex: 1,
    paddingRight: 8,
  },
  copyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyIconButton: {
    padding: 4,
    marginLeft: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
    width: 24,
  },
  copyIconText: {
    fontSize: 16,
    lineHeight: 16,
    textAlignVertical: 'center',
  },
});

export default UserDetailScreen;
