import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ScrollView,
  BackHandler,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native';

import {RootStackParamList} from '@navigation/types';
import ReservationList from '@components/ReservationList';
import EquipReservationList from '@components/EquipReservationList';
import TaxiChatList from '@components/chat/TaxiChatList';
import paxi_api from '@utils/paxi_api';

type ReservationScreenProps = {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'MyReservation'>;
  route?: RouteProp<RootStackParamList, 'MyReservation'>;
};

type TabType = 'place' | 'equipment' | 'taxi';

const ReservationScreen = ({navigation}: ReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const route = useRoute<RouteProp<RootStackParamList, 'MyReservation'>>();
  const backPressCount = useRef(0);

  const prevTab = route.params.prevTab;

  const [isPaxiUser, setIsPaxiUser] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('place');
  const [textWidths, setTextWidths] = useState<{[key: string]: number}>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // 라우트 파라미터에서 prevTab을 받아서 초기 탭 설정
  useEffect(() => {
    const checkPaxiUser = async () => {
      paxi_api
        .get('/user/onboarding-status')
        .then(res => {
          setIsPaxiUser(res.data.onboardingStatus);
        })
        .catch(err => {
          console.error('Paxi user check error:', err);
        });
    };
    checkPaxiUser();
    if (prevTab) {
      const validTabs: string[] = ['NewChat'];
      if (validTabs.includes(prevTab)) {
        setActiveTab('taxi');
      }
    }
  }, [prevTab]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const tabs = [
    {id: 'place' as TabType, label: '장소 예약'},
    {id: 'equipment' as TabType, label: '장비 예약'},
    {id: 'taxi' as TabType, label: '택시 카풀'},
  ];

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
      // 새로고침은 하되 시각적 제스처는 표시하지 않음
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
            ToastAndroid.show('한 번 더 누르면 앱이 종료됩니다', ToastAndroid.SHORT);
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

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    // 새로고침 완료를 시뮬레이션하기 위해 약간의 지연 추가
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={backgroundStyle} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{flex: 0}}>
        <Text
          style={{
            color: textColor,
            marginTop: 20,
            marginLeft: 20,
            marginBottom: 10,
            fontSize: 25,
            fontWeight: 'bold',
          }}>
          내 일정
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typeNav}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.typeTabWrapper}>
              <View style={styles.typeTabInner}>
                <View style={{alignItems: 'center'}}>
                  <Text
                    style={[
                      styles.typeTab,
                      {color: isDarkMode ? '#888' : '#999'},
                      activeTab === tab.id && [
                        styles.selectedTypeText,
                        {color: textColor},
                      ],
                    ]}
                    onLayout={e => {
                      const width = e.nativeEvent.layout.width;
                      setTextWidths(prev => ({...prev, [tab.id]: width}));
                    }}>
                    {tab.label}
                  </Text>
                  <View
                    style={[
                      styles.underline,
                      {
                        width: (textWidths[tab.id] || 0) + 8,
                        backgroundColor:
                          activeTab === tab.id ? textColor : 'transparent',
                      },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{flex: 1}}>
        {activeTab === 'place' ? (
          <ReservationList
            navigation={navigation!}
            refreshKey={refreshKey}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : activeTab === 'equipment' ? (
          <EquipReservationList
            navigation={navigation!}
            refreshKey={refreshKey}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : isPaxiUser ? (
          <View style={{flex: 1}}>
            <TaxiChatList
              navigation={navigation!}
              refreshKey={refreshKey}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          </View>
        ) : (
          <View
            style={[
              styles.paxiSignupContainer,
              {backgroundColor: backgroundStyle.backgroundColor},
            ]}>
            <View style={styles.paxiSignupContent}>
              <Text style={[styles.paxiSignupTitle, {color: textColor}]}>
                Paxi 서비스 사용 동의가 필요합니다
              </Text>
              <Text
                style={[
                  styles.paxiSignupDescription,
                  {color: isDarkMode ? '#AAAAAA' : '#666666'},
                ]}>
                택시 카풀 서비스를 이용하려면{'\n'}
                Paxi 서비스 사용 동의가 필요합니다.{'\n'}
                동의 후 다시 시도해주세요.
              </Text>
              <TouchableOpacity
                style={[
                  styles.paxiSignupButton,
                  {backgroundColor: isDarkMode ? '#3B82F6' : '#3B82F6'},
                ]}
                onPress={() => navigation?.navigate('PaxiIntro')}>
                <Text style={styles.paxiSignupButtonText}>
                  Paxi 서비스 사용 동의 페이지로 이동
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  typeNav: {
    paddingLeft: 16,
  },
  typeTabWrapper: {
    width: 70,
    paddingVertical: 5,
    marginRight: 12,
  },
  typeTabInner: {
    alignItems: 'center',
  },
  typeTab: {
    fontSize: 16,
    color: '#999',
  },
  selectedTypeText: {
    color: '#000',
    fontWeight: 'bold',
  },
  underline: {
    marginTop: 4,
    height: 2,
    borderRadius: 1,
  },
  paxiSignupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  paxiSignupContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  paxiSignupTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    textAlign: 'center',
    marginBottom: 16,
  },
  paxiSignupDescription: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Pretendard',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  paxiSignupButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  paxiSignupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ReservationScreen;
