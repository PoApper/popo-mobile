import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native';

import {RootStackParamList} from '@navigation/types';
import ReservationList from '@components/ReservationList';
import EquipReservationList from '@components/EquipReservationList';
import TaxiChatList from '@components/chat/TaxiChatList';

type ReservationScreenProps = {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'Reservation'>;
  route?: RouteProp<RootStackParamList, 'Reservation'>;
};

type TabType = 'place' | 'equipment' | 'taxi';

const ReservationScreen = ({navigation}: ReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const route = useRoute<RouteProp<RootStackParamList, 'Reservation'>>();

  const [activeTab, setActiveTab] = useState<TabType>('place');
  const [textWidths, setTextWidths] = useState<{[key: string]: number}>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // 라우트 파라미터에서 selectedTab을 받아서 초기 탭 설정
  useEffect(() => {
    if (route.params?.selectedTab) {
      const validTabs: TabType[] = ['place', 'equipment', 'taxi'];
      if (validTabs.includes(route.params.selectedTab as TabType)) {
        setActiveTab(route.params.selectedTab as TabType);
      }
    }
  }, [route.params?.selectedTab]);

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
      // 탭 포커스 시에도 새로고침 효과 표시
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
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
                <View style={styles.textWithUnderline}>
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
                  {activeTab === tab.id && (
                    <View
                      style={[
                        styles.underline,
                        {
                          width: (textWidths[tab.id] || 0) + 8,
                          backgroundColor: textColor,
                        },
                      ]}
                    />
                  )}
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
        ) : (
          <View style={{flex: 1}}>
            <TaxiChatList
              navigation={navigation!}
              refreshKey={refreshKey}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

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
  typeNav: {
    paddingLeft: 16,
  },
  typeTabWrapper: {
    paddingVertical: 12,
    marginRight: 24,
  },
  typeTabInner: {
    alignItems: 'center',
  },
  textWithUnderline: {
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
});

export default ReservationScreen;
