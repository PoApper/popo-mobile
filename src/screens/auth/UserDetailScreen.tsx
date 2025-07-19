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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import axios from 'axios';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import Environment from '@utils/environment';
import {reset_auth} from '@utils/reset';

type UserDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserDetail'>;
  // route: RouteProp<RootStackParamList, 'UserDetail'>;
};

const UserDetailScreen = ({navigation}: UserDetailScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [userDataState, setUserData] = useState<any>(null);

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
      await reset_auth();
      navigation.replace('Login');
    } catch (error) {
      console.error('로그아웃 오류:', error);

      await reset_auth();

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

  return (
    <SafeAreaView style={backgroundStyle} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{flexGrow: 1}}>
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

            <View
              style={[styles.detailItem, {borderBottomColor: 'transparent'}]}>
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
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.buttonContainer,
            {backgroundColor: isDarkMode ? '#444444' : '#DBDBDB'},
          ]}
          onPress={handleLogout}
          disabled={isLoading}>
          <Text
            style={[
              styles.logoutButtonText,
              {color: isDarkMode ? '#FFFFFF' : '#333333'},
            ]}>
            {isLoading ? '처리 중...' : '로그아웃'}
          </Text>
        </TouchableOpacity>

        {/* 개발자 페이지 버튼 */}
        {!Environment.isProduction && (
          <View style={{marginBottom: 48, marginTop: 16}}>
            <TouchableOpacity
              style={[styles.buttonContainer, {backgroundColor: '#4F46E5'}]}
              onPress={() => navigation.navigate('Developer')}>
              <Text style={styles.developerButtonText}>개발자 페이지</Text>
            </TouchableOpacity>
            <Text style={{fontSize: 12, color: '#6B7280'}}>
              개발자 페이지는 에뮬레이터와 Test Flight에서만 접근 가능합니다.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  reservationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
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
  developerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserDetailScreen;
