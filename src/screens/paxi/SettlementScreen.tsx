import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useRoute} from '@react-navigation/native';

import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import {SettlementCreateData, SettlementInfoData} from '@interfaces/paxi';
import {PaxiUserMy} from '@interfaces/paxi';

type SettlementScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settlement'>;
};

type SettlementScreenRouteProp = RouteProp<RootStackParamList, 'Settlement'>;

const SettlementScreen = ({navigation}: SettlementScreenProps) => {
  const route = useRoute<SettlementScreenRouteProp>();
  const {roomUuid} = route.params;

  const [bankName, setbankName] = useState<string | undefined>(undefined);
  const [accountNumber, setAccountNumber] = useState<string | undefined>(
    undefined,
  );
  const [accountName, setAccountName] = useState<string | undefined>(undefined);
  const [totalCost, setTotalCost] = useState<number | undefined>(undefined);
  const [isUpdateAccount, setIsUpdateAccount] = useState<boolean>(false);
  const [isAlreadyRequested, setIsAlreadyRequested] = useState<boolean>(false);

  useEffect(() => {
    paxi_api.get(`/room/${roomUuid}/settlement`).then(res => {
      const settlementInfo = res.data as SettlementInfoData;
      if (settlementInfo.payAmount > 0) {
        setIsAlreadyRequested(true);
      }
      console.log(settlementInfo);
      setbankName(settlementInfo.payerBankName);
      setAccountNumber(settlementInfo.payerAccountNumber);
      setAccountName(settlementInfo.payerAccountHolderName);
      setTotalCost(settlementInfo.payAmount);
      setIsAlreadyRequested(true);
    });
  }, []);

  const checkInputValid = () => {
    if (!bankName || !accountNumber || !accountName || !totalCost) {
      Alert.alert('오류', '모든 필수 필드를 입력해주세요.');
      return;
    }
    if (isAlreadyRequested) {
      paxi_api
        .put(`/room/${roomUuid}/settlement`, {
          payAmount: Number(totalCost),
          payerAccountNumber: accountNumber,
          payerAccountHolderName: accountName,
          payerBankName: bankName,
          updateAccount: isUpdateAccount,
        } as SettlementCreateData)
        .then(res => {
          if (res.status !== 200) {
            Alert.alert('실패', `response: ${res.status}`);
          } else {
            Alert.alert('성공', '정산 요청을 수정했습니다.');
            navigation.goBack();
          }
        });
    } else {
      paxi_api
        .post(`/room/${roomUuid}/settlement`, {
          payAmount: Number(totalCost),
          payerAccountNumber: accountNumber,
          payerAccountHolderName: accountName,
          payerBankName: bankName,
          updateAccount: isUpdateAccount,
        } as SettlementCreateData)
        .then(res => {
          if (res.status !== 201) {
            Alert.alert('실패', `response: ${res.status}`);
          } else {
            Alert.alert('성공', '정산 요청을 보냈습니다.');
            navigation.goBack();
          }
        })
        .catch(error => {
          Alert.alert(
            '실패',
            `정산 요청에 실패했습니다: ${error.message} ${error.response.data.message}`,
          );
        });
    }
  };

  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
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
        <Text style={[styles.headerTitle, {color: textColor}]}>정산하기</Text>
        <View style={styles.placeholderButton} />
      </View>

      {isAlreadyRequested && (
        <View style={styles.alreadyRequestedContainer}>
          <Text style={styles.alreadyRequestedText}>
            이미 생성된 정산 요청이 있습니다.{'\n'}
            정산 내용을 수정하시겠습니까?
          </Text>
        </View>
      )}

      <KeyboardAwareScrollView
        style={{flex: 1, paddingHorizontal: 15}}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        extraHeight={120}>
        {/* 내 계좌 정보 불러오기 버튼 */}
        <TouchableOpacity
          style={[
            styles.loadAccountButton,
            {backgroundColor: isDarkMode ? '#4F46E5' : '#6366F1'},
          ]}
          onPress={() => {
            // TODO: 내 계좌 정보 불러오기 로직
            paxi_api.get('/user/my').then(res => {
              const userData = res.data as PaxiUserMy;
              if (
                userData.bankName &&
                userData.accountNumber &&
                userData.accountHolderName
              ) {
                setbankName(userData.bankName);
                setAccountNumber(userData.accountNumber);
                setAccountName(userData.accountHolderName);
              } else {
                Alert.alert(
                  '계좌 정보 없음',
                  '등록된 계좌 정보가 없어서 불러 올 수 없습니다.',
                );
              }
            });
            console.log('내 계좌 정보 불러오기');
          }}>
          <Text style={styles.loadAccountButtonText}>
            내 계좌 정보 불러오기
          </Text>
        </TouchableOpacity>

        <View style={{width: '100%', marginBottom: 8}}>
          <Text style={[styles.titleText, {color: textColor}]}>은행명</Text>
          <TextInput
            style={[
              styles.roomInput,
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
            onChangeText={setbankName}
          />
        </View>

        <View style={{width: '100%', marginBottom: 8}}>
          <Text style={[styles.titleText, {color: textColor}]}>계좌번호</Text>
          <TextInput
            style={[
              styles.roomInput,
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
              styles.roomInput,
              {
                marginBottom: 10,
                borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                color: textColor,
              },
            ]}
            placeholder="계좌주명을 입력해주세요."
            placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>

        <View style={{width: '100%', marginBottom: 8}}>
          <Text style={[styles.titleText, {color: textColor}]}>결제금액</Text>
          <TextInput
            style={[
              styles.roomInput,
              {
                marginBottom: 10,
                borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                color: textColor,
              },
            ]}
            placeholder="정산금액을 입력해주세요."
            placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
            value={totalCost?.toString()}
            onChangeText={text => {
              // 숫자만 허용
              const numericText = text.replace(/[^0-9]/g, '');
              if (numericText == '') {
                setTotalCost(undefined);
              } else {
                setTotalCost(Number(numericText));
              }
            }}
            keyboardType="numeric"
          />
          <Text style={[styles.infoText]}>
            총 금액을 입력해주세요! 자동으로 N분의 1 처리한 금액을
            요청해드릴게요.
          </Text>
        </View>

        <View style={[styles.checkboxContainer, {marginTop: 20}]}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsUpdateAccount(!isUpdateAccount)}>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isUpdateAccount ? '#000' : 'transparent',
                  borderColor: isDarkMode ? '#555' : '#D0D0D0',
                },
              ]}>
              {isUpdateAccount && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxText, {color: textColor}]}>
              이 계좌 정보를 기본값으로 업데이트
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: isDarkMode ? '#2C2C2C' : '#000',
            },
          ]}
          onPress={() => checkInputValid()}
          disabled={!bankName || !accountNumber || !accountName}>
          <Text style={[styles.nextButtonText]}>
            {isAlreadyRequested ? '정산 요청 수정' : '정산 요청하기'}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SettlementScreen;

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
  backgroundStyle: {
    backgroundColor: '#ffffff',
    flex: 1,
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
  infoText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    color: '#e45b63',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
  },
  nextButton: {
    borderRadius: 6,
    backgroundColor: '#FB5353',
    width: '100%',
    marginTop: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#ffffff',
    textAlign: 'center',
  },
  roomInput: {
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
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    overflow: 'hidden',
  },
  inputWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    height: 42,
  },
  separator: {
    height: 1,
    marginLeft: '2.5%',
    width: '95%',
    backgroundColor: '#d0d0d0',
  },
  dotBlack: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'black',
    marginRight: 10,
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginRight: 10,
  },
  checkboxContainer: {
    width: '100%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 3,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    flex: 1,
  },
  alreadyRequestedContainer: {
    backgroundColor: '#FFE500', // warning color (yellow)
    padding: 16,
    borderRadius: 6,
    marginBottom: 10,
    marginTop: 10,
    marginLeft: '5%',
    marginRight: '5%',
  },
  alreadyRequestedText: {
    fontSize: 14,
  },
  loadAccountButton: {
    borderRadius: 6,
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadAccountButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    color: '#ffffff',
    textAlign: 'center',
  },
});
