import React, {useState} from 'react';
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
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import PrivacyPolicy from '@components/PrivacyPolicy';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

// 유저 타입 enum
enum UserType {
  student = 'STUDENT',
  faculty = 'FACULTY', // 교직원
  others = 'OTHERS',
}

const isOkSignup = (
  email: string | null,
  password: string | null,
  confirmPassword: string | null,
  name: string | null,
  userType: UserType | null,
) => {
  return (
    email &&
    password &&
    confirmPassword &&
    name &&
    userType &&
    password.length >= 8 &&
    password === confirmPassword
  );
};

const SignupScreen = ({navigation}: SignupScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState(false);
  const [isPrivacyPolicyAgreed, setIsPrivacyPolicyAgreed] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const okSignup =
    isOkSignup(email, password, confirmPassword, name, userType) &&
    isPrivacyPolicyAgreed;

  const handleSignup = () => {
    // 기본적인 유효성 검사
    if (!email || !password || !confirmPassword || !name || !userType) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 검사
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    api
      .post('/auth/signin', {
        email: email.includes('@') ? email : `${email}@postech.ac.kr`,
        password,
        name,
        userType,
      })
      .then(() => {
        Alert.alert(
          '회원가입 성공',
          '회원가입에 성공했습니다! 😁\n계정 활성화 메일을 확인해주세요! 📧\n(1분 정도 지연 될 수 있습니다.)',
          [
            {
              text: '확인',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      })
      .catch(err => {
        Alert.alert('회원가입 실패', err.response.data.message);
      });
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text
              style={[
                styles.backButtonText,
                {color: isDarkMode ? '#FFFFFF' : '#000000'},
              ]}>
              {'로그인 페이지로'}
            </Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon/POPO_typography_bg_removed_cropped.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.headerText,
              {color: isDarkMode ? '#FFFFFF' : '#000000'},
            ]}>
            회원가입
          </Text>

          <View style={styles.formContainer}>
            <Text
              style={[
                styles.label,
                {color: isDarkMode ? '#FFFFFF' : '#000000'},
              ]}>
              이름*
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  borderColor: isDarkMode ? '#555555' : '#E5E7EB',
                },
              ]}
              placeholder="예약에 사용할 실명을 입력해주세요"
              placeholderTextColor={isDarkMode ? '#AAAAAA' : '#9CA3AF'}
              value={name}
              onChangeText={setName}
            />

            <Text
              style={[
                styles.label,
                {color: isDarkMode ? '#FFFFFF' : '#000000', marginTop: 16},
              ]}>
              Email*
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  borderColor: isDarkMode ? '#555555' : '#E5E7EB',
                },
              ]}
              placeholder="Email 또는 POVIS ID를 입력해주세요"
              placeholderTextColor={isDarkMode ? '#AAAAAA' : '#9CA3AF'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {/*
            테스트 기간 동안은 다른 이메일도 허용
            <Text
              style={[
                styles.emailHintText,
                {color: isDarkMode ? '#AAAAAA' : '#9CA3AF'},
              ]}>
              POVIS 이메일로 인증메일이 발송 됩니다. (테스트 기간 동안은 )
            </Text>
            */}

            <Text
              style={[
                styles.label,
                {color: isDarkMode ? '#FFFFFF' : '#000000', marginTop: 16},
              ]}>
              비밀번호*
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  borderColor: isDarkMode ? '#555555' : '#E5E7EB',
                },
              ]}
              placeholder="8자리 이상, 16자리 이하"
              placeholderTextColor={isDarkMode ? '#AAAAAA' : '#9CA3AF'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text
              style={[
                styles.label,
                {color: isDarkMode ? '#FFFFFF' : '#000000', marginTop: 16},
              ]}>
              비밀번호 확인*
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  borderColor: isDarkMode ? '#555555' : '#E5E7EB',
                },
              ]}
              placeholder="비밀번호를 다시 입력하세요"
              placeholderTextColor={isDarkMode ? '#AAAAAA' : '#9CA3AF'}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Text
              style={[
                styles.label,
                {color: isDarkMode ? '#FFFFFF' : '#000000', marginTop: 16},
              ]}>
              사용자 유형*
            </Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === UserType.student ? styles.selectedUserType : {},
                  {
                    backgroundColor:
                      userType === UserType.student
                        ? '#4F46E5'
                        : isDarkMode
                        ? '#333333'
                        : '#FFFFFF',
                    borderColor: isDarkMode ? '#555555' : '#E5E7EB',
                  },
                ]}
                onPress={() => setUserType(UserType.student)}>
                <Text
                  style={[
                    styles.userTypeText,
                    {
                      color:
                        userType === UserType.student
                          ? '#FFFFFF'
                          : isDarkMode
                          ? '#FFFFFF'
                          : '#000000',
                    },
                  ]}>
                  학생
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === UserType.faculty ? styles.selectedUserType : {},
                  {
                    backgroundColor:
                      userType === UserType.faculty
                        ? '#4F46E5'
                        : isDarkMode
                        ? '#333333'
                        : '#FFFFFF',
                    borderColor: isDarkMode ? '#555555' : '#E5E7EB',
                  },
                ]}
                onPress={() => setUserType(UserType.faculty)}>
                <Text
                  style={[
                    styles.userTypeText,
                    {
                      color:
                        userType === UserType.faculty
                          ? '#FFFFFF'
                          : isDarkMode
                          ? '#FFFFFF'
                          : '#000000',
                    },
                  ]}>
                  교직원
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === UserType.others ? styles.selectedUserType : {},
                  {
                    backgroundColor:
                      userType === UserType.others
                        ? '#4F46E5'
                        : isDarkMode
                        ? '#333333'
                        : '#FFFFFF',
                    borderColor: isDarkMode ? '#555555' : '#E5E7EB',
                  },
                ]}
                onPress={() => setUserType(UserType.others)}>
                <Text
                  style={[
                    styles.userTypeText,
                    {
                      color:
                        userType === UserType.others
                          ? '#FFFFFF'
                          : isDarkMode
                          ? '#FFFFFF'
                          : '#000000',
                    },
                  ]}>
                  기타
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.requiredNote,
                {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
              ]}>
              * 필수 항목
            </Text>

            <TouchableOpacity
              style={styles.privacyPolicyContainer}
              onPress={() => setIsPrivacyPolicyVisible(true)}>
              <View style={styles.privacyPolicyCheckbox}>
                {isPrivacyPolicyAgreed && (
                  <Icon name="check" size={16} color="#4F46E5" />
                )}
              </View>
              <Text
                style={[
                  styles.privacyPolicyText,
                  {color: isDarkMode ? '#FFFFFF' : '#000000'},
                ]}>
                개인정보 처리 방침에 동의합니다
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.signupButton,
                !okSignup && styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={!okSignup}>
              <Text style={styles.signupButtonText}>회원가입</Text>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.loginContainer}>
              <Text
                style={[
                  styles.loginText,
                  {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                ]}>
                이미 계정이 있으신가요?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>로그인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <PrivacyPolicy
        visible={isPrivacyPolicyVisible}
        onClose={() => {
          setIsPrivacyPolicyAgreed(false);
          setIsPrivacyPolicyVisible(false);
        }}
        onAgree={() => {
          setIsPrivacyPolicyAgreed(true);
          setIsPrivacyPolicyVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    height: 100,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -10,
    marginBottom: 24,
    textAlign: 'center',
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
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userTypeButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedUserType: {
    borderColor: '#4F46E5',
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  signupButton: {
    backgroundColor: '#4F46E5',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupButtonDisabled: {
    backgroundColor: '#9BA3AF',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  emailHintText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'Pretendard',
  },
  privacyPolicyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  privacyPolicyCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyPolicyText: {
    fontSize: 14,
  },
});

export default SignupScreen;
