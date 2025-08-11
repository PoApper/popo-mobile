import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import {PaxiUserMy} from '@interfaces/paxi';

type UserAccountInfoScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserAccountInfo'>;
};

const UserAccountInfoScreen = ({navigation}: UserAccountInfoScreenProps) => {
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [existingData, setExistingData] = useState<PaxiUserMy | null>(null);

  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  // 기존 계좌 정보 가져오기
  useEffect(() => {
    fetchUserAccountInfo();
  }, []);

  const fetchUserAccountInfo = async () => {
    try {
      const response = await paxi_api.get('/user/my');
      const userData = response.data as PaxiUserMy;
      setExistingData(userData);

      // 기존 데이터가 있으면 입력 필드에 설정
      if (userData.bankName) {
        setBankName(userData.bankName);
      }
      if (userData.accountNumber) {
        setAccountNumber(userData.accountNumber);
      }
      if (userData.accountHolderName) {
        setAccountHolderName(userData.accountHolderName);
      }
    } catch (error) {
      console.error('계좌 정보 조회 실패:', error);
    }
  };

  const validateInput = () => {
    if (!bankName.trim()) {
      Alert.alert('오류', '은행명을 입력해주세요.');
      return false;
    }
    if (!accountNumber.trim()) {
      Alert.alert('오류', '계좌번호를 입력해주세요.');
      return false;
    }
    if (!accountHolderName.trim()) {
      Alert.alert('오류', '계좌주명을 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);
    try {
      const accountData = {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
      };

      await paxi_api.put('/user/account', accountData);

      Alert.alert(
        '성공',
        existingData?.bankName
          ? '계좌 정보가 수정되었습니다.'
          : '계좌 정보가 등록되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.error('계좌 정보 저장 실패:', error);
      Alert.alert(
        '실패',
        `계좌 정보 저장에 실패했습니다: ${
          error.response?.data?.message || error.message
        }`,
      );
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
      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, {color: textColor}]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>
          {existingData?.bankName ? '계좌 정보 수정' : '계좌 정보 등록'}
        </Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView>
        <View style={styles.container}>
          {existingData?.bankName && (
            <View style={styles.existingInfoContainer}>
              <Text style={styles.existingInfoText}>
                기존 계좌 정보가 있습니다.{'\n'}
                아래 정보를 수정하거나 그대로 유지할 수 있습니다.
              </Text>
            </View>
          )}

          <View style={{width: '100%', marginBottom: 8}}>
            <Text style={[styles.titleText, {color: textColor}]}>은행명</Text>
            <TextInput
              style={[
                styles.input,
                {
                  marginBottom: 10,
                  borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                  color: textColor,
                },
              ]}
              placeholder="은행명을 입력해주세요."
              placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
              value={bankName}
              onChangeText={setBankName}
            />
          </View>

          <View style={{width: '100%', marginBottom: 8}}>
            <Text style={[styles.titleText, {color: textColor}]}>계좌번호</Text>
            <TextInput
              style={[
                styles.input,
                {
                  marginBottom: 10,
                  borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                  color: textColor,
                },
              ]}
              placeholder="계좌번호를 입력해주세요."
              placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
              value={accountNumber}
              onChangeText={text => {
                // 숫자만 허용
                const numericText = text.replace(/[^0-9]/g, '');
                setAccountNumber(numericText);
              }}
              keyboardType="numeric"
            />
          </View>

          <View style={{width: '100%', marginBottom: 8}}>
            <Text style={[styles.titleText, {color: textColor}]}>계좌주명</Text>
            <TextInput
              style={[
                styles.input,
                {
                  marginBottom: 10,
                  borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                  color: textColor,
                },
              ]}
              placeholder="계좌주명을 입력해주세요."
              placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
              value={accountHolderName}
              onChangeText={setAccountHolderName}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.infoText,
                {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
              ]}>
              • 등록된 계좌 정보는 Paxi 정산 시 기본값으로 사용됩니다.{'\n'}•
              계좌 정보는 안전하게 암호화되어 저장됩니다.{'\n'}• 언제든지 이
              페이지에서 계좌 정보를 수정할 수 있습니다.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: isDarkMode ? '#4F46E5' : '#6366F1',
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={isLoading}>
          <Text style={styles.saveButtonText}>
            {isLoading
              ? '처리 중...'
              : existingData?.bankName
              ? '계좌 정보 수정'
              : '계좌 정보 등록'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserAccountInfoScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
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
  container: {
    alignItems: 'center',
    paddingRight: '5%',
    paddingLeft: '5%',
    paddingTop: '5%',
    marginBottom: 0,
  },
  titleText: {
    fontSize: 15,
    letterSpacing: -0.5,
    fontWeight: '700',
    color: '#000',
    textAlign: 'left',
    width: '100%',
    marginBottom: 10,
  },
  input: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#D0D0D0',
    width: '100%',
    backgroundColor: '#FFFFFF',
    height: 42,
    paddingHorizontal: 16,
    fontSize: 13,
    textAlignVertical: 'center',
  },
  saveButton: {
    borderRadius: 6,
    width: '90%',
    marginLeft: '5%',
    marginTop: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#ffffff',
    textAlign: 'center',
  },
  existingInfoContainer: {
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 6,
    marginBottom: 20,
    width: '100%',
  },
  existingInfoText: {
    fontSize: 14,
    color: '#0277BD',
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
