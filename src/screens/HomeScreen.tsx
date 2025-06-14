import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import DdayInfoBox from '@components/DdayInfoBox';
import UpcomingEvents from '@components/UpcomingEvents';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type ServiceItem = {
  id: string;
  icon: string;
  title: string;
  active: boolean;
  onPress: () => void;
};

const HomeScreen = ({navigation}: HomeScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [userName, setUserName] = useState<string>('');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/auth/myInfo');
        const userData = response.data;
        setUserName(userData.name || '사용자');
      } catch (error) {
        console.error('저장된 사용자 정보 로드 오류:', error);
        setUserName('사용자');
      }
    };

    fetchUserInfo();
  }, []);

  const handleMoveSite = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('오류', '링크를 열 수 없습니다.');
      console.error('링크 열기 오류:', error);
    }
  };

  const services: ServiceItem[] = [
    {
      id: '1',
      icon: 'place',
      title: '장소예약',
      active: true,
      onPress: () => navigation.navigate('PlaceReservation'),
    },
    {
      id: '2',
      icon: 'computer',
      title: '장비예약',
      active: true,
      onPress: () => navigation.navigate('EquipmentReservation'),
    },
    {
      id: '3',
      icon: 'account-balance',
      title: '자치단체',
      active: true,
      onPress: () => navigation.navigate('Association'),
    },
    {
      id: '4',
      icon: 'store',
      title: '제휴업체',
      active: true,
      onPress: () => navigation.navigate('Benefits'),
    },
    {
      id: '5',
      icon: 'description',
      title: '기록물',
      active: true,
      onPress: () =>
        Alert.alert(
          '외부 링크 이동',
          '총학생회 구글 드라이브로 이동합니다. 계속하시겠습니까?',
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '확인',
              onPress: () =>
                handleMoveSite(
                  'https://drive.google.com/drive/u/0/folders/1vHexwLSdD92maoKNlvw9zQ0q0J59k5FD',
                ),
            },
          ],
        ),
    },
    {
      id: '6',
      icon: 'people',
      title: '동아리',
      active: true,
      onPress: () => navigation.navigate('Club'),
    },
    {
      id: '7',
      icon: 'menu-book',
      title: '생활백서',
      active: true,
      onPress: () => navigation.navigate('Whitebook'),
    },
    {
      id: '8',
      icon: 'dining',
      title: '배달업체',
      active: true,
      onPress: () => {
        Alert.alert(
          '외부 링크 이동',
          '생활관자치회 배달업체 페이지로 이동합니다. 계속하시겠습니까?',
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '확인',
              onPress: () =>
                handleMoveSite('https://www.postechdorm.com/delivery'),
            },
          ],
        );
      },
    },
  ];

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={styles.container}>
        {/* D-day 정보 */}
        <DdayInfoBox />

        {/* 환영 메시지 */}
        <View style={styles.welcomeSection}>
          <Text
            style={[
              styles.welcomeText,
              {color: isDarkMode ? '#FFFFFF' : '#000000'},
            ]}>
            {userName}님, 안녕하세요! 👋
          </Text>
        </View>

        {/* 다가오는 일정 */}
        <UpcomingEvents />

        {/* 서비스 그리드 */}
        <View style={styles.servicesSection}>
          <Text
            style={[
              styles.sectionTitle,
              {color: isDarkMode ? '#FFFFFF' : '#000000'},
            ]}>
            다양한 서비스 이용하기
          </Text>
          <View
            style={[
              styles.servicesGrid,
              {backgroundColor: isDarkMode ? '#2C2C2C' : '#F6F7F9'},
            ]}>
            {services.map(service => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceItem]}
                onPress={service.active ? service.onPress : undefined}>
                <Icon
                  name={service.icon}
                  size={24}
                  color={isDarkMode ? '#FFFFFF' : '#000000'}
                  style={{opacity: service.active ? 1 : 0.5}}
                />
                <Text
                  style={[
                    styles.serviceTitle,
                    {
                      color: isDarkMode ? '#FFFFFF' : '#000000',
                      opacity: service.active ? 1 : 0.5,
                    },
                  ]}>
                  {service.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  servicesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    paddingTop: 24,
  },
  serviceItem: {
    width: '23%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 6,
  },
  serviceTitle: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;
