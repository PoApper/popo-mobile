import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Icon from 'react-native-vector-icons/MaterialIcons';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type ServiceItem = {
  id: string;
  icon: string;
  title: string;
  onPress: () => void;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#F3F4F6',
    flex: 1,
  };

  const services: ServiceItem[] = [
    {
      id: '1',
      icon: 'place',
      title: '정소예약',
      onPress: () => navigation.navigate('Login'),
    },
    {
      id: '2',
      icon: 'computer',
      title: '장비예약',
      onPress: () => navigation.navigate('Login'),
    },
    {
      id: '3',
      icon: 'account-balance',
      title: '자치단체',
      onPress: () => navigation.navigate('Login'),
    },
    {
      id: '4',
      icon: 'store',
      title: '제휴업체',
      onPress: () => navigation.navigate('Login'),
    },
    {
      id: '5',
      icon: 'description',
      title: '기록물',
      onPress: () => navigation.navigate('Login'),
    },
    {
      id: '6',
      icon: 'people',
      title: '동아리',
      onPress: () => navigation.navigate('Login'),
    },
    {
      id: '7',
      icon: 'menu-book',
      title: '생활백서',
      onPress: () => navigation.navigate('Login'),
    },
    {
      id: '8',
      icon: 'dining',
      title: '배달업체',
      onPress: () => navigation.navigate('Login'),
    },
  ];

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={styles.container}>
        {/* 위치 정보 */}
        <View style={styles.locationHeader}>
          <View style={[styles.locationBox, { backgroundColor: isDarkMode ? '#2D3748' : '#E6EAF5' }]}>
            <Text style={[styles.locationText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              🗓️ 수강과목 포기 기간 시작 D-5
            </Text>
          </View>
        </View>

        {/* 환영 메시지 */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            문소율님, 안녕하세요! 👋
          </Text>
        </View>

        {/* 다가오는 일정 */}
        <View style={styles.upcomingSection}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000', paddingHorizontal: 24 }]}>
            다가오는 일정
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleScroll}>
            <View style={[styles.scheduleCard, { backgroundColor: '#4D61DD' }]}>
              <View style={styles.scheduleInfo}>
                <Icon name="place" size={20} color="#FFFFFF" />
                <Text style={styles.scheduleLocation}>커뮤니터센터 GSR B</Text>
                <Text style={styles.scheduleDate}>2025.03.05</Text>
              </View>
              <Text style={styles.scheduleTitle}>POPO 회의</Text>
            </View>

            <View style={[styles.scheduleCard, { backgroundColor: '#10ADB6' }]}>
              <View style={styles.scheduleInfo}>
                <Icon name="place" size={20} color="#FFFFFF" />
                <Text style={styles.scheduleLocation}>커뮤니터센터 GSR B</Text>
                <Text style={styles.scheduleDate}>2025.03.05</Text>
              </View>
              <Text style={styles.scheduleTitle}>POPO 회의</Text>
            </View>

            <View style={[styles.scheduleCard, { backgroundColor: '#4D61DD' }]}>
              <View style={styles.scheduleInfo}>
                <Icon name="place" size={20} color="#FFFFFF" />
                <Text style={styles.scheduleLocation}>커뮤니터센터 GSR B</Text>
                <Text style={styles.scheduleDate}>2025.03.05</Text>
              </View>
              <Text style={styles.scheduleTitle}>POPO 회의</Text>
            </View>
          </ScrollView>
        </View>

        {/* 서비스 그리드 */}
        <View style={styles.servicesSection}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            다양한 서비스 이용하기
          </Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceItem,
                  { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }
                ]}
                onPress={service.onPress}
              >
                <Icon
                  name={service.icon}
                  size={24}
                  color={isDarkMode ? '#FFFFFF' : '#000000'}
                />
                <Text
                  style={[
                    styles.serviceTitle,
                    { color: isDarkMode ? '#FFFFFF' : '#000000' }
                  ]}
                >
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
  locationHeader: {
    padding: 16,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  calendarIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeSection: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  upcomingSection: {
    paddingVertical: 24,
  },
  scheduleScroll: {
    paddingHorizontal: 16,
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 280,
    height: 140,
    justifyContent: 'space-between',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleLocation: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  scheduleDate: {
    color: '#FFFFFF',
    marginLeft: 'auto',
    fontSize: 14,
  },
  scheduleTitle: {
    color: '#FFFFFF',
    fontSize: 16,
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
  },
  serviceItem: {
    width: '23%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceTitle: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;