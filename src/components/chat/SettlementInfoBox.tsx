import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

import {SettlementData} from '@interfaces/paxi';
import paxi_api from '@utils/paxi_api';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SettlementInfoBoxProps {
  settlementData: SettlementData;
}

async function completeSettlement(settlementData: SettlementData) {
  try {
    const res = await paxi_api.patch(`/room/${settlementData.roomUuid}/pay2`, {
      isPaid: true,
    });

    return res.status;
  } catch (error: string | any) {
    console.error('Error:', error);
  }
}

const SettlementInfoBox = ({settlementData}: SettlementInfoBoxProps) => {
  const [isCompleteSettlement, setIsCompleteSettlement] = useState<boolean>(false);

  const settlementSend = () => {
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

  // TODO: 복사 버튼 만들기
  // TODO: 정산 완료시, 내용 숨기기 & 내용 확장 가능
  return (
    <View style={styles.backgroundContainer}>
      {isCompleteSettlement &&
      <View style={{flexDirection: 'row', gap: 10}}>
        <Icon name={'check'} size={20} color={'green'}/>
        <Text style={{
          fontSize: 15,
          fontWeight: '600',
          color: 'green',
        }}>정산이 완료되었습니다.</Text>
        <Icon name={'down_arrow'} size={20} color={'black'}/>
      </View>
      }
      {!isCompleteSettlement &&
        <>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>정산 요청 안내</Text>
            <Text style={styles.payAmountText}>{settlementData.payAmount}원</Text>
          </View>
          <View style={styles.payerInfoContainer}>
            <View style={{marginTop: 10}}>
              <Text style={styles.infoText}>계좌주명: {settlementData.payerAccountHolderName}</Text>
              <Text style={styles.infoText}>계좌번호: {settlementData.payerBankName} {settlementData.payerAccountNumber}</Text>
              <TouchableOpacity
                onPress={() => {}}>
                <Icon name={'content-copy'} size={20} color={'black'} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.warnText}>꼭! 송금 후 완료 버튼을 눌러 주세요!</Text>
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => settlementSend()}>
            <Text style={styles.sendBtnText}>송금 완료 알림을 보냅니다</Text>
          </TouchableOpacity>
        </>
      }
    </View>
  );
};

export default SettlementInfoBox;

const styles = StyleSheet.create({
  backgroundContainer: {
    backgroundColor: '#f2f3f5',
    padding: 25,
    paddingBottom: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    letterSpacing: -0.7,
    fontWeight: '600',
    color: 'black',
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
    color: '#4f4f4f',
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
