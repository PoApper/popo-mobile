import React, {useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';

type PaxiStartScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PaxiStart'>;
};

async function createNewNickname(nickname: string) {
  try {
    const res = await paxi_api.post('/user/nickname', {
      nickname: nickname,
    });
    return res.status;
  } catch (error: string | any) {
    console.error('Error:', error);
  }
}

const PaxiStartScreen = ({navigation}: PaxiStartScreenProps) => {
  const [nickname, setNickname] = useState('');

  const checkInputValid = () => {
    if (!nickname) {
      // TODO: 더 확실한 기준 넣기
      Alert.alert('오류', '모든 필수 필드를 입력해주세요.');
    } else {
      createNewNickname(nickname)
        .then(result => {
          if (result === 201) {
            Alert.alert('성공', '닉네임을 성공적으로 생성했습니다.');
            navigation.goBack();
          } else {
            Alert.alert('실패', 'response: ' + result?.toString());
          }
        })
        .catch(error => {
          Alert.alert(
            '실패',
            '닉네임을 생성하는데 실패했습니다: ' + error.message,
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
        <Text style={[styles.headerTitle, {color: textColor}]}>
          새 닉네임 생성하기
        </Text>
        <View style={styles.placeholderButton} />
      </View>

      <View style={styles.container}>
        <View style={{width: '100%', marginBottom: 8}}>
          <Text style={[styles.titleText, {color: textColor}]}>닉네임</Text>
          <TextInput
            style={[
              styles.roomInput,
              {
                borderColor: isDarkMode ? '#2C2C2C' : '#D0D0D0',
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                color: textColor,
              },
            ]}
            placeholder="닉네임을 입력해주세요."
            placeholderTextColor={isDarkMode ? '#555' : '#d0d0d0'}
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        <TouchableOpacity
          style={[styles.nextButton, {backgroundColor: 'black'}]}
          onPress={() => checkInputValid()}
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
    paddingRight: '5%',
    paddingLeft: '5%',
    paddingTop: '5%',
    marginBottom: 0,
  },
});
