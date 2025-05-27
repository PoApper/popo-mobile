import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Alert,
  Animated,
  Easing,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import CommonHeader from '@components/CommonHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';

type PaxiStartScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PaxiStart'>;
};

const PaxiStartScreen = ({navigation}: PaxiStartScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [nickname, setNickname] = useState('');
  const spinValue = useRef(new Animated.Value(0)).current;

  const colors = {
    background: isDarkMode ? '#121212' : '#fff',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    inputBackground: isDarkMode ? '#1A1A1A' : '#FFFFFF',
    inputBorder: isDarkMode ? '#2C2C2C' : '#D0D0D0',
    inputPlaceholder: isDarkMode ? '#555' : '#d0d0d0',
    diceButtonBackground: isDarkMode ? '#2C2C2C' : '#F4F4F6',
    buttonBackground: isDarkMode ? '#2C2C2C' : '#111',
    bottomContainerBackground: isDarkMode ? '#121212' : '#fff',
  };

  const setNickName = async () => {
    paxi_api
      .post('/user/nickname', {
        nickname: nickname,
      })
      .then(res => {
        if (res.status === 201) {
          Alert.alert('성공', '닉네임을 성공적으로 생성했습니다.');
          navigation.navigate('PaxiRoomList');
        }
      });
  };

  const getUserInfo = async () => {
    paxi_api
      .get('/user/onboarding-status')
      .then(res => {
        if (res.data.onboardingStatus === true) {
          Alert.alert('안내', '이미 세팅된 닉네임이 있습니다.');
          navigation.navigate('PaxiRoomList');
        }
        setNickname(res.data.nickname); // initial nickname
      })
      .catch(err => {
        console.error('Error:', err);
        Alert.alert('실패', 'Paxi 유저 확인에 실패했습니다: ' + err.message);
      });
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const backgroundStyle = {
    backgroundColor: colors.background,
    flex: 1,
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animateDice = () => {
    Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title="닉네임 설정하기" />

      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={[styles.titleText, {color: colors.text}]}>
            PAXI에 오신 것을 환영합니다! 👋
          </Text>
        </View>
        <View style={styles.subTitleContainer}>
          <Text style={[styles.subTitleText, {color: colors.text}]}>
            사용할 닉네임을 등록해주세요.
          </Text>
        </View>

        <View style={{width: '100%', marginBottom: 8}}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.roomInput,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              placeholder="닉네임을 입력해주세요."
              placeholderTextColor={colors.inputPlaceholder}
              value={nickname}
              onChangeText={setNickname}
            />
            <TouchableOpacity
              style={[
                styles.diceButton,
                {
                  backgroundColor: colors.diceButtonBackground,
                },
              ]}
              onPress={() => {
                animateDice();
                getUserInfo();
              }}>
              <Animated.View style={{transform: [{rotate: spin}]}}>
                <Icon name="casino" size={24} color={colors.text} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.taxiImageContainer}>
          <Image
            source={require('../../../assets/paxi_taxi.png')}
            style={styles.taxiImage}
          />
        </View>
      </View>

      <View
        style={[
          styles.bottomContainer,
          {backgroundColor: colors.bottomContainerBackground},
        ]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {backgroundColor: colors.buttonBackground},
          ]}
          onPress={() => {
            if (!nickname) {
              Alert.alert('오류', '닉네임을 입력해주세요.');
            } else {
              setNickName();
            }
          }}
          disabled={!nickname}>
          <Text style={styles.nextButtonText}>Paxi 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaxiStartScreen;

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
  titleContainer: {
    width: '100%',
    marginTop: 48,
    marginBottom: 30,
  },
  titleText: {
    fontSize: 26,
    letterSpacing: -0.5,
    fontWeight: '700',
    textAlign: 'left',
    width: '100%',
    marginBottom: 20,
  },
  subTitleContainer: {
    width: '100%',
    marginBottom: 10,
  },
  subTitleText: {
    fontSize: 18,
    textAlign: 'left',
  },
  nextButton: {
    borderRadius: 24,
    height: 48,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  diceButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingRight: '5%',
    paddingLeft: '5%',
    paddingTop: '5%',
    marginBottom: 0,
  },
  taxiImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  taxiImage: {
    width: 280,
    height: 280,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
