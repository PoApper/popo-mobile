import React, { useState } from 'react';
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
import {RootStackParamList} from '../navigation/types';
import paxi_api from '../utils/paxi_api';

import { RouteProp, useRoute } from '@react-navigation/native';

type SettlementScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settlement'>;
};

type SettlementScreenRouteProp = RouteProp<RootStackParamList, 'Settlement'>;

interface SettlementData {
  payAmount: number;
  payerBankName: string;
  payerAccountNumber: string;
  payerAccountHolderName: string;
  updateAccount: boolean;
  roomUuid: string;
}

async function requestSettlement(settlementData: SettlementData) {
  try {
    console.log(settlementData.roomUuid);
    const res = await paxi_api.post(`/room/${settlementData.roomUuid}/settlement2`, {
      payAmount: settlementData.payAmount,
      payerAccountNumber: settlementData.payerAccountNumber,
      payerAccountHolderName: settlementData.payerAccountHolderName,
      payerBankName: settlementData.payerBankName,
      updateAccount: settlementData.updateAccount,
    });

    return res.status;
  } catch (error: string | any) {
    console.error('Error:', error);
  }
}

const SettlementScreen = ({navigation}: SettlementScreenProps) => {
  const route = useRoute<SettlementScreenRouteProp>();
  const { roomUuid } = route.params;

  const [bankName, setbankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [totalCost, setTotalCost] = useState('');

  const checkInputValid = () => {
    if (!bankName || !accountNumber || !accountName || !totalCost) {
      Alert.alert('오류', '모든 필수 필드를 입력해주세요.');
      return;
    } else {
      requestSettlement({
        payerBankName: bankName,
        payerAccountNumber: accountNumber,
        payerAccountHolderName: accountName,
        payAmount: Number(totalCost),
        roomUuid: roomUuid,
        updateAccount: false,
      }).then(result => {
          if (result !== 201) {
            Alert.alert('실패', 'response: ' + result?.toString());
          } else {
            Alert.alert('성공', '정산 요청을 보냈습니다.');
            navigation.goBack();
          }
        })
        .catch(error => {
          Alert.alert('실패', '정산 요청에 실패했습니다: ' + error.message);
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

      <ScrollView>
        <View style={styles.container}>
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
              onChangeText={setAccountNumber}
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
              value={totalCost}
              onChangeText={setTotalCost}
            />
            <Text style={[styles.infoText]}>총 금액을 입력해주세요! 자동으로 N분의 1 처리한 금액을 요청해드릴게요.</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: 'black',
            },
          ]}
          onPress={() => checkInputValid()}
          disabled={!bankName || !accountNumber || !accountName}>
          <Text style={styles.nextButtonText}>정산 요청하기</Text>
        </TouchableOpacity>
      </ScrollView>
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
    width: '90%',
    marginLeft: '5%',
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
    paddingRight: '5%',
    paddingLeft: '5%',
    paddingTop: '5%',
    marginBottom: 0,
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
});
