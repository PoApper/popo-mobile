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
import {useTranslation} from 'react-i18next';

import {SettlementInfoData} from '@interfaces/paxi';
import paxi_api from '@utils/paxi_api';
import {textColor} from '@styles/default';

interface SettlementInfoBoxProps {
  isPaid: boolean | undefined;
  isPaidEnd: boolean;
  settlementData: SettlementInfoData;
}

async function completeSettlement(settlementData: SettlementInfoData) {
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
  isPaidEnd,
  settlementData,
}: SettlementInfoBoxProps) => {
  const {t} = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const [showInfo, setShowInfo] = useState<boolean>(!isPaid);

  useEffect(() => {
    if (typeof isPaid === 'boolean') {
      setShowInfo(!isPaid);
    }
  }, [isPaid]);

  const settlementSendAlert = () => {
    Alert.alert(
      t('paxi.settlement.sendConfirmTitle'),
      t('paxi.settlement.sendConfirmBody'),
      [
        {
          text: t('paxi.settlement.no'),
          style: 'cancel',
        },
        {
          text: t('paxi.settlement.yes'),
          onPress: () => {
            completeSettlement(settlementData)
              .then(result => {
                if (result !== 200) {
                  Alert.alert(
                    t('common.failure'),
                    'response: ' + result?.toString(),
                  );
                } else {
                  Alert.alert(
                    t('paxi.settlement.sentTitle'),
                    t('paxi.settlement.sent'),
                  );
                }
              })
              .catch(error => {
                Alert.alert(
                  t('common.failure'),
                  t('paxi.settlement.sendFailed', {message: error.message}),
                );
              });
          },
        },
      ],
    );
  };

  if (isPaid === undefined || !settlementData.payAmountPerPerson) {
    return null;
  }

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
          {isPaid && (
            <>
              <Icon name={'check'} size={20} color={'green'} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: 'green',
                }}>
                {t('paxi.settlement.completed')}
              </Text>
            </>
          )}
          {!isPaid && (
            <>
              <Icon
                name={isPaidEnd ? 'info' : 'warning'}
                size={20}
                color={isPaidEnd ? '#e4c45b' : '#e45b63'}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: isPaidEnd ? '#e4c45b' : '#e45b63',
                }}>
                {isPaidEnd
                  ? t('paxi.settlement.endedUnpaid')
                  : t('paxi.settlement.notCompleted')}
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
                {t('paxi.settlement.infoTitle')}
              </Text>
              <Text
                style={[styles.payAmountText, {color: textColor(isDarkMode)}]}>
                {t('paxi.settlement.amount', {
                  amount: settlementData.payAmountPerPerson.toLocaleString(),
                })}
              </Text>
            </View>
            <View style={styles.payerInfoContainer}>
              <View style={{marginTop: 10}}>
                <Text
                  style={[
                    styles.infoText,
                    {color: isDarkMode ? '#aaa' : '#4f4f4f'},
                  ]}>
                  {t('paxi.settlement.totalAmount', {
                    amount: settlementData.payAmount.toLocaleString(),
                  })}
                </Text>
                <Text
                  style={[
                    styles.infoText,
                    {color: isDarkMode ? '#aaa' : '#4f4f4f'},
                  ]}>
                  {t('paxi.settlement.payer', {
                    name: settlementData.payerNickname,
                  })}
                </Text>
                <Text
                  style={[
                    styles.infoText,
                    {color: isDarkMode ? '#aaa' : '#4f4f4f'},
                  ]}>
                  {t('paxi.settlement.holder', {
                    name: settlementData.payerAccountHolderName,
                  })}
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
                    {t('paxi.settlement.account', {
                      bank: settlementData.payerBankName,
                      number: settlementData.payerAccountNumber,
                    })}
                  </Text>
                  <Icon
                    name={'content-copy'}
                    size={12}
                    color={isDarkMode ? '#aaa' : '#4f4f4f'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {!isPaid && !isPaidEnd && (
              <>
                <Text style={styles.warnText}>
                  {t('paxi.settlement.pressAfterSend')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    {backgroundColor: isDarkMode ? '#333' : 'black'},
                  ]}
                  onPress={settlementSendAlert}>
                  <Text style={styles.sendBtnText}>
                    {t('paxi.settlement.sendDone')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {!isPaid && isPaidEnd && (
              <>
                <Text style={[styles.warnText, {color: '#e4c45b'}]}>
                  {t('paxi.settlement.endedCannotSend')}
                </Text>
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
    marginBottom: 4,
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
