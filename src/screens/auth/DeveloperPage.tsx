import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Platform,
  Clipboard,
  ToastAndroid,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {RootStackParamList} from '@navigation/types';
import {getAuthToken} from '@utils/auth-token';
import api from '@utils/api';
import paxi_api from '@utils/paxi_api';
import CommonHeader from '@components/CommonHeader';
import {POPO_API_URL} from '@utils/api';

type DeveloperPageProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Developer'>;
};

const DeveloperPage = ({navigation}: DeveloperPageProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [userDataState, setUserData] = useState<any>(null);
  const [authTokenData, setAuthTokenData] = useState<any>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';

  // authToken 정보 가져오기
  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        const token = await getAuthToken();
        setAuthTokenData(token);
      } catch (error) {
        console.error('Auth Token 가져오기 오류:', error);
      }
    };

    fetchAuthToken();
  }, []);

  // 사용자 프로필 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/myInfo');
        const userData = response.data;
        setUserData(userData);
      } catch (err) {
        console.error('프로필 정보 조회 오류:', err);
      }
    };

    fetchUserProfile();
  }, []);

  const testFCM = async () => {
    paxi_api
      .post('/push/send/', {
        userUuids: [userDataState.uuid],
        title: 'FCM 테스트',
        body: 'FCM 테스트 메시지',
      })
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

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
      <CommonHeader navigation={navigation} title="개발자 정보" />

      <ScrollView style={styles.container}>
        <View
          style={[
            styles.profileCard,
            {backgroundColor: cardBgColor, borderColor},
          ]}>
          <View style={styles.detailSection}>
            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.titleContainer}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
                    ]}>
                    API URL
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
                  {POPO_API_URL || '정보 없음'}
                </Text>
              </View>
            </View>

            {/* UUID 정보 */}
            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
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
            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
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
            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
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
            <View style={[styles.detailItem, {borderBottomColor: borderColor}]}>
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
                      onPress={() => copyToClipboard(authTokenData.fcm_token)}>
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

            <TouchableOpacity
              style={[styles.buttonContainer, {backgroundColor: '#4F46E5'}]}
              onPress={testFCM}>
              <Text style={styles.testFCMButtonText}>FCM 테스트</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  detailSection: {},
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
  tokenContainer: {
    width: '100%',
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: '500',
    width: '100%',
    paddingVertical: 2,
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
  buttonContainer: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
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
  testFCMButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeveloperPage;
