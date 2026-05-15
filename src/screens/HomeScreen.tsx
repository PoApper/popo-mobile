import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  StatusBar,
  Alert,
  Image,
  BackHandler,
  ToastAndroid,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import DdayInfoBox from '@components/DdayInfoBox';
import RecruitingBanner from '@components/RecruitingBanner';
import UpcomingEvents from '@components/UpcomingEvents';
import {openURLWithFallback} from '@utils/linking';
import {
  POSTECH_DORM_DELIVERY_URL,
  RECORDS_ARCHIVE_URL,
  ERROR_REPORT_FORM_URL,
} from '../constants/urls';

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
  const backPressCount = useRef(0);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      api
        .get('/auth/myInfo')
        .then(response => {
          const userData = response.data;
          setUserName(userData.name || '사용자');
        })
        .catch(error => {
          if (error.response?.status === 401) {
            navigation.navigate('Login');
          } else {
            console.error('사용자 정보 조회 오류:', error);
          }
        });
    };

    fetchUserInfo();
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);

  // 화면이 포커스될 때마다 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log('HomeScreen focused - refreshing data');
      setRefreshKey(prev => prev + 1);
    }, []),
  );

  // 뒤로가기 버튼 처리
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        backPressCount.current += 1;

        if (backPressCount.current === 1) {
          // 첫 번째 누름: 토스트 메시지 표시
          if (Platform.OS === 'android') {
            ToastAndroid.show(
              '한 번 더 누르면 앱이 종료됩니다',
              ToastAndroid.SHORT,
            );
          }

          // 2초 후 카운터 리셋
          setTimeout(() => {
            backPressCount.current = 0;
          }, 2000);

          return true; // 기본 뒤로가기 동작 방지
        } else if (backPressCount.current === 2) {
          // 두 번째 누름: 앱 종료
          BackHandler.exitApp();
          return true;
        }

        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

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
      icon: 'people',
      title: '동아리',
      active: true,
      onPress: () => navigation.navigate('Club'),
    },
    {
      id: '4',
      icon: 'account-balance',
      title: '자치단체',
      active: true,
      onPress: () => navigation.navigate('Association'),
    },
    {
      id: '5',
      icon: 'groups',
      title: '학생단체',
      active: true,
      onPress: () => navigation.navigate('StudentAssociation'),
    },
    {
      id: '6',
      icon: 'menu-book',
      title: '생활백서',
      active: true,
      onPress: () => navigation.navigate('Whitebook'),
    },
    {
      id: '7',
      icon: 'store',
      title: '제휴업체',
      active: true,
      onPress: () => navigation.navigate('Benefits'),
    },
    {
      id: '8',
      icon: 'dining',
      title: '배달업체',
      active: true,
      onPress: () => {
        Alert.alert(
          '외부 링크 이동',
          '생활관자치회 배달업체 페이지로 이동합니다.',
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '확인',
              onPress: () => openURLWithFallback(POSTECH_DORM_DELIVERY_URL),
            },
          ],
        );
      },
    },
    {
      id: '9',
      icon: 'description',
      title: '기록물관리',
      active: true,
      onPress: () =>
        Alert.alert('외부 링크 이동', '총학생회 구글 드라이브로 이동합니다.', [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '확인',
            onPress: () => openURLWithFallback(RECORDS_ARCHIVE_URL),
          },
        ]),
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

        {/* 개발자 모집 배너 */}
        <RecruitingBanner navigation={navigation} />

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
        <UpcomingEvents refreshKey={refreshKey} navigation={navigation} />

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
      {/* Floating error report button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
            borderWidth: 1,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => {
          openURLWithFallback(ERROR_REPORT_FORM_URL);
        }}>
        <Image
          source={require('../../assets/siren.png')}
          style={styles.floatingIcon}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.floatingText,
            {color: isDarkMode ? '#E5E7EB' : '#111827'},
          ]}>
          오류 및 개선점 제보
        </Text>
      </TouchableOpacity>
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
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  floatingIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  floatingText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
