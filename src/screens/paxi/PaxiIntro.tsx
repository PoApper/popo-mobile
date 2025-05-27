import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  StatusBar,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import CommonHeader from '@components/CommonHeader';
import {RootStackParamList} from '@navigation/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useState} from 'react';
import PaxiPrivacyPolicy from '@components/PaxiPrivacyPolicy';

type PaxiIntroScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PaxiIntro'>;
};

const PaxiIntroScreen = ({navigation}: PaxiIntroScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isPrivacyPolicyAgreed, setIsPrivacyPolicyAgreed] = useState(false);
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState(false);

  const colors = {
    background: isDarkMode ? '#121212' : '#fff',
    text: isDarkMode ? '#FFFFFF' : '#111',
    cardBackground: isDarkMode ? '#1E1E1E' : '#F7F8FA',
    cardTitle: isDarkMode ? '#FFFFFF' : '#222',
    cardDesc: isDarkMode ? '#AAAAAA' : '#888',
    buttonBackground: isDarkMode ? '#2C2C2C' : '#111',
    checkboxBorder: isDarkMode ? '#4F46E5' : '#4F46E5',
    checkboxBackground: isDarkMode ? '#1E1E1E' : '#fff',
  };

  const backgroundStyle = {
    backgroundColor: colors.background,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title="" isBackHome={true} />
      <View style={styles.contentContainer}>
        <Text style={[styles.title, {color: colors.text}]}>
          포스텍 카풀 서비스, Paxi 입니다!
        </Text>
        <View style={[styles.card, {backgroundColor: colors.cardBackground}]}>
          <Text style={[styles.cardTitle, {color: colors.cardTitle}]}>
            한명이 한번에 결제해요
          </Text>
          <Text style={[styles.cardDesc, {color: colors.cardDesc}]}>
            카풀 방 생성자가 한꺼번에 결제하고 정산해요
          </Text>
        </View>
        <View style={[styles.card, {backgroundColor: colors.cardBackground}]}>
          <Text style={[styles.cardTitle, {color: colors.cardTitle}]}>
            택시를 한번에 부르고 같이 타요
          </Text>
          <Text style={[styles.cardDesc, {color: colors.cardDesc}]}>
            택시비를 편하게 아껴요
          </Text>
        </View>
      </View>

      <View style={styles.privacyPolicyRow}>
        <TouchableOpacity
          style={[
            styles.privacyPolicyCheckbox,
            {
              borderColor: colors.checkboxBorder,
              backgroundColor: colors.checkboxBackground,
            },
          ]}
          onPress={() => setIsPrivacyPolicyVisible(true)}
          activeOpacity={0.7}>
          {isPrivacyPolicyAgreed && (
            <Icon name="check" size={16} color="#4F46E5" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsPrivacyPolicyVisible(true)}
          activeOpacity={0.7}>
          <Text style={[styles.privacyPolicyText, {color: colors.text}]}>
            개인정보 처리 방침에 동의합니다
          </Text>
        </TouchableOpacity>
      </View>

      <PaxiPrivacyPolicy
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

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.agreeButton,
            {backgroundColor: colors.buttonBackground},
          ]}
          onPress={() => {
            if (isPrivacyPolicyAgreed) {
              navigation.navigate('PaxiStart');
            } else {
              Alert.alert('안내', '개인정보 처리방침에 동의해주세요.');
            }
          }}>
          <Text style={styles.agreeButtonText}>동의하고 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaxiIntroScreen;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  agreeText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 4,
  },
  agreeButton: {
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  privacyPolicyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    marginLeft: 24,
  },
  privacyPolicyCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyPolicyText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
