import React, {useState, useCallback, useRef} from 'react';
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
  BackHandler,
  ToastAndroid,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import Config from 'react-native-config';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import {reset_auth} from '@utils/reset';
import paxi_api from '@utils/paxi_api';
import {PaxiUserMy} from '@interfaces/paxi';

type UserDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserDetail'>;
  // route: RouteProp<RootStackParamList, 'UserDetail'>;
};

const UserDetailScreen = ({navigation}: UserDetailScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backPressCount = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userDataState, setUserData] = useState<any>(null);
  const [isPaxiUser, setIsPaxiUser] = useState<boolean>(false);
  const [paxiUserData, setPaxiUserData] = useState<PaxiUserMy | null>(null);
  
  // 비밀번호 수정 모달 상태
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [passwordAgain, setPasswordAgain] = useState<string>('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const isPaxiAccountInfoExist =
    paxiUserData?.bankName &&
    paxiUserData?.accountNumber &&
    paxiUserData?.accountHolderName;

  const isProduction = Config.ENV === 'prod';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';

  // 비밀번호 유효성 검사
  const isValidPassword: boolean =
    password.length > 0 && !RegExp(/^(\w{8,16})$/).test(password);
  const isValidPasswordAgain: boolean =
    passwordAgain.length > 0 && password !== passwordAgain;

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/myInfo');
      setUserData(res.data);
    } catch (err) {
      console.error('프로필 정보 조회 오류:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        Alert.alert('인증 만료', '다시 로그인해주세요.', [
          {text: '확인', onPress: () => navigation.navigate('Login')},
        ]);
      }
    }
  };

  const fetchPaxiInfo = async () => {
    paxi_api
      .get('/user/my')
      .then(res => {
        setPaxiUserData(res.data);
        setIsPaxiUser(true);
      })
      .catch(err => {
        console.error(err);
        setIsPaxiUser(false);
      });
  };

  // 비밀번호 업데이트 함수
  const handlePasswordUpdate = async () => {
    if (isValidPassword || isValidPasswordAgain) {
      Alert.alert('오류', '비밀번호를 올바르게 입력해주세요.');
      return;
    }

    if (password.length === 0 || passwordAgain.length === 0) {
      Alert.alert('오류', '비밀번호를 입력해주세요.');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await api.post('/auth/password/update', {
        password: password,
      });
      Alert.alert('성공', '비밀번호 변경에 성공했습니다!');
      setIsPasswordModalVisible(false);
      setPassword('');
      setPasswordAgain('');
    } catch (err: any) {
      const response = err.response;
      Alert.alert(
        '오류',
        `비밀번호 업데이트에 실패했습니다. 😢\n"${
          response?.data?.message || '오류가 발생했습니다.'
        }"`,
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

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

  // 화면에 포커스할 때마다 프로필 정보 가져오기
  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      Promise.all([fetchUserProfile(), fetchPaxiInfo()]).finally(() => {
        setIsLoading(false);
      });
    }, []),
  );

  // 뒤로가기 버튼 처리
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        backPressCount.current += 1;

        if (backPressCount.current === 1) {
          // 첫 번째 누름: 토스트 메시지 표시
          if (Platform.OS === 'android') {
            ToastAndroid.show(
              '한 번 더 누르면 앱이 종료됩니다',
              ToastAndroid.SHORT,
            );
          }

          // 2초 후 카운터 리셋
          setTimeout(() => {
            backPressCount.current = 0;
          }, 2000);

          return true; // 기본 뒤로가기 동작 방지
        } else if (backPressCount.current === 2) {
          // 두 번째 누름: 앱 종료
          BackHandler.exitApp();
          return true;
        }

        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

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
              POPO 계정 정보
            </Text>
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

            <View
              style={[styles.detailItem, {borderBottomColor: 'transparent'}]}>
              <View style={styles.detailHeader}>
                <Text
                  style={[
                    styles.detailLabel,
                    {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                  ]}>
                  비밀번호 변경
                </Text>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    {backgroundColor: isDarkMode ? '#ddd' : 'black'},
                  ]}
                  onPress={() => setIsPasswordModalVisible(true)}>
                  <Text
                    style={[
                      styles.editButtonText,
                      {color: isDarkMode ? 'black' : 'white'},
                    ]}>
                    변경
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {isPaxiUser ? (
            <View style={[styles.detailSection, {borderColor: 'transparent'}]}>
              <Text style={[styles.sectionTitle, {color: textColor}]}>
                Paxi 정보
              </Text>
              <View
                style={[styles.detailItem, {borderBottomColor: borderColor}]}>
                <Text
                  style={[
                    styles.detailLabel,
                    {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                  ]}>
                  닉네임
                </Text>
                <Text style={[styles.detailValue, {color: textColor}]}>
                  {paxiUserData?.nickname || '정보 없음'}
                </Text>
              </View>

              <View
                style={[styles.detailItem, {borderBottomColor: borderColor}]}>
                <View style={styles.detailHeader}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                    ]}>
                    등록 계좌
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      {backgroundColor: isDarkMode ? '#ddd' : 'black'},
                    ]}
                    onPress={() => {
                      navigation.navigate('UserAccountInfo');
                    }}>
                    <Text
                      style={[
                        styles.editButtonText,
                        {color: isDarkMode ? 'black' : 'white'},
                      ]}>
                      {isPaxiAccountInfoExist ? '수정' : '등록'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.detailValue, {color: textColor}]}>
                  {isPaxiAccountInfoExist
                    ? `${paxiUserData?.bankName} ${paxiUserData?.accountNumber} (${paxiUserData?.accountHolderName})`
                    : '정보 없음'}
                </Text>
              </View>

              <View
                style={[styles.detailItem, {borderBottomColor: 'transparent'}]}>
                <View style={styles.detailHeader}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                    ]}>
                    신고 관리
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      {backgroundColor: isDarkMode ? '#ddd' : 'black'},
                    ]}
                    onPress={() => {
                      navigation.navigate('PaxiReportList');
                    }}>
                    <Text
                      style={[
                        styles.editButtonText,
                        {color: isDarkMode ? 'black' : 'white'},
                      ]}>
                      내역 조회
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {/* 비밀번호 수정 모달 */}
        <Modal
          visible={isPasswordModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsPasswordModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, {backgroundColor: cardBgColor}]}>
              <Text style={[styles.modalTitle, {color: textColor}]}>
                비밀번호 변경
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  {color: isDarkMode ? '#AAAAAA' : '#6B7280'},
                ]}>
                새로운 비밀번호를 입력해주세요.
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    {
                      borderColor: isValidPassword ? '#EF4444' : borderColor,
                      backgroundColor: isDarkMode ? '#2C2C2C' : '#FFFFFF',
                      color: textColor,
                    },
                  ]}
                  placeholder="새 비밀번호 (8-16자)"
                  placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
                {isValidPassword && (
                  <Text style={styles.errorText}>
                    비밀번호는 8자리 이상 16자리 이하여야 합니다.
                  </Text>
                )}

                <TextInput
                  style={[
                    styles.passwordInput,
                    {
                      borderColor: isValidPasswordAgain ? '#EF4444' : borderColor,
                      backgroundColor: isDarkMode ? '#2C2C2C' : '#FFFFFF',
                      color: textColor,
                    },
                  ]}
                  placeholder="비밀번호 확인"
                  placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
                  secureTextEntry={true}
                  value={passwordAgain}
                  onChangeText={setPasswordAgain}
                />
                {isValidPasswordAgain && (
                  <Text style={styles.errorText}>
                    비밀번호가 일치하지 않습니다.
                  </Text>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => {
                    setIsPasswordModalVisible(false);
                    setPassword('');
                    setPasswordAgain('');
                  }}>
                  <Text style={styles.cancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.submitBtn]}
                  onPress={handlePasswordUpdate}
                  disabled={isPasswordLoading}>
                  <Text style={styles.submitBtnText}>
                    {isPasswordLoading ? '처리 중...' : '비밀번호 변경'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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

        <TouchableOpacity
          style={[
            styles.buttonContainer,
            {backgroundColor: isDarkMode ? '#DC2626' : '#EF4444'},
          ]}
          onPress={() => navigation.navigate('Leave')}>
          <Text style={[styles.leaveButtonText, {color: '#FFFFFF'}]}>
            회원 탈퇴
          </Text>
        </TouchableOpacity>

        {/* 앱 정보 · 만든 사람들 */}
        <TouchableOpacity
          style={[
            styles.buttonContainer,
            {backgroundColor: isDarkMode ? '#4F46E5' : '#6366F1'},
            // 개발자 페이지가 숨겨질 때 하단 여백 추가
            isProduction ? {marginBottom: 48} : {},
          ]}
          onPress={() => navigation.navigate('About')}>
          <Text style={[styles.leaveButtonText, {color: '#FFFFFF'}]}>
            앱 정보 · 만든 사람들
          </Text>
        </TouchableOpacity>

        {/* 개발자 페이지 버튼 */}
        {!isProduction && (
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
  leaveButtonText: {
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
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // 비밀번호 수정 모달 스타일
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
  modalSubtitle: {
    fontSize: 12,
    marginBottom: 16,
    fontFamily: 'Pretendard',
  },
  inputContainer: {
    marginBottom: 16,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'Pretendard',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 8,
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
    flex: 1,
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  submitBtn: {
    backgroundColor: '#0B0B0B',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#374151',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#FFFFFF',
  },
});

export default UserDetailScreen;
