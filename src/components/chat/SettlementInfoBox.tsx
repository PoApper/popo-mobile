import {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';

import {SettlementData} from '@interfaces/paxi';
import paxi_api from '@utils/paxi_api';
import {textColor} from '@styles/default';

interface SettlementInfoBoxProps {
  isPaid: boolean | undefined;
  settlementData: SettlementData;
}

async function completeSettlement(settlementData: SettlementData) {
  try {
    const res = await paxi_api.patch(`/room/${settlementData.roomUuid}/pay`, {
      isPaid: true,
    });

    return res.status;
  } catch (error: string | any) {
    console.error('Error:', error);
  }
}

const SettlementInfoBox = ({
  isPaid,
  settlementData,
}: SettlementInfoBoxProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const isCompleteSettlement = isPaid === true;
  const [showInfo, setShowInfo] = useState<boolean>(true);

  useEffect(() => {
    if (typeof isPaid === 'boolean') {
      setShowInfo(!isPaid);
    }
  }, [isPaid]);

  const settlementSendAlert = () => {
    Alert.alert('송금 확인', '송금을 완료하셨습니까?', [
      {
        text: '아니오',
        style: 'cancel',
      },
      {
        text: '네',
        onPress: () => {
          completeSettlement(settlementData)
            .then(result => {
              if (result !== 200) {
                Alert.alert('실패', 'response: ' + result?.toString());
              } else {
                Alert.alert('전송 완료', '송금 완료 알림을 전송했습니다.');
              }
            })
            .catch(error => {
              Alert.alert(
                '실패',
                '송금 완료 알림 전송에 실패했습니다: ' + error.message,
              );
            });
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.backgroundContainer,
        {backgroundColor: isDarkMode ? '#222' : '#f2f3f5'},
      ]}>
      {!showInfo && (
        <TouchableOpacity
          onPress={() => setShowInfo(true)}
          style={{flexDirection: 'row', gap: 10, margin: 10}}>
          {isCompleteSettlement && (
            <>
              <Icon name={'check'} size={20} color={'green'} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: 'green',
                }}>
                정산이 완료되었습니다.
              </Text>
            </>
          )}
          {!isCompleteSettlement && (
            <>
              <Icon name={'warning'} size={20} color={'#e45b63'} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#e45b63',
                }}>
                정산이 아직 완료되지 않았습니다.
              </Text>
            </>
          )}
          <View style={{flex: 1}} />
          <Icon
            name={'keyboard-arrow-down'}
            size={20}
            color={textColor(isDarkMode)}
          />
        </TouchableOpacity>
      )}
      {showInfo && (
        <View style={{margin: 10}}>
          <TouchableOpacity
            onPress={() => setShowInfo(false)}
            style={{width: '100%', flexDirection: 'row'}}>
            <View style={{flex: 1}} />
            <Icon
              name={'keyboard-arrow-up'}
              size={20}
              color={textColor(isDarkMode)}
            />
          </TouchableOpacity>
          <View style={{margin: 5, alignItems: 'center'}}>
            <View style={styles.titleContainer}>
              <Text style={[styles.titleText, {color: textColor(isDarkMode)}]}>
                정산 안내
              </Text>
              <Text
                style={[styles.payAmountText, {color: textColor(isDarkMode)}]}>
                {settlementData.payAmount?.toLocaleString()}원
              </Text>
            </View>
            <View style={styles.payerInfoContainer}>
              <View style={{marginTop: 10}}>
                <Text
                  style={[
                    styles.infoText,
                    {color: isDarkMode ? '#aaa' : '#4f4f4f'},
                  ]}>
                  계좌주명: {settlementData.payerAccountHolderName}
                </Text>
                <TouchableOpacity
                  style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}
                  onPress={() =>
                    Clipboard.setString(
                      `${settlementData.payerAccountNumber} ${settlementData.payerBankName}`,
                    )
                  }>
                  <Text
                    style={[
                      styles.infoText,
                      {color: isDarkMode ? '#aaa' : '#4f4f4f'},
                    ]}>
                    계좌번호: {settlementData.payerBankName}{' '}
                    {settlementData.payerAccountNumber}
                  </Text>
                  <Icon
                    name={'content-copy'}
                    size={12}
                    color={isDarkMode ? '#aaa' : '#4f4f4f'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {!isCompleteSettlement && (
              <>
                <Text style={styles.warnText}>
                  꼭! 송금 후 완료 버튼을 눌러 주세요!
                </Text>
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    {backgroundColor: isDarkMode ? '#333' : 'black'},
                  ]}
                  onPress={settlementSendAlert}>
                  <Text style={styles.sendBtnText}>
                    송금 완료 알림을 보냅니다
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default SettlementInfoBox;

const styles = StyleSheet.create({
  backgroundContainer: {
    borderRadius: 12,
  },
  titleText: {
    fontSize: 22,
    letterSpacing: -0.7,
    fontWeight: '600',
  },
  payAmountText: {
    fontSize: 22,
    letterSpacing: -0.7,
    fontWeight: '600',
    color: 'black',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  payerInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  infoText: {
    fontSize: 13,
    letterSpacing: -0.4,
  },
  warnText: {
    fontSize: 12,
    letterSpacing: -0.4,
    fontWeight: '600',
    marginTop: 10,
    color: '#e45b63',
  },
  sendBtn: {
    backgroundColor: '#000',
    width: '90%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 5,
    justifyContent: 'center',
  },
  sendBtnText: {
    fontSize: 14,
    letterSpacing: -0.4,
    color: '#f6f7f9',
    alignItems: 'center',
  },
});
