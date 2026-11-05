import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useColorScheme} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {MainTabParamList} from '@navigation/types';
import HomeScreen from '@screens/HomeScreen';
import UserDetailScreen from '@screens/auth/UserDetailScreen';
import ReservationScreen from '@screens/ReservationScreen';
import PaxiRoomListScreen from '@screens/paxi/PaxiRoomListScreen';
import {useRoute} from '@react-navigation/native';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  const {t} = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const route = useRoute();
  const {tab, prevTab} = (route.params as {tab: string; prevTab: string}) || {};

  const validTabs = ['Home', 'Paxi', 'MyReservation', 'MyInfo'] as const;
  type TabName = (typeof validTabs)[number];
  const tabParam = validTabs.includes(tab as TabName)
    ? (tab as TabName)
    : 'Home';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#333333' : '#E5E7EB',
          paddingTop: 5,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarActiveTintColor: isDarkMode ? 'white' : 'black',
        tabBarInactiveTintColor: isDarkMode ? '#888888' : '#6B7280',
      }}
      initialRouteName={tabParam}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('nav.home'),
          tabBarIcon: ({color, size}) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Paxi"
        // name="PaxiRoomList"
        component={PaxiRoomListScreen}
        options={{
          tabBarLabel: t('nav.paxi'),
          tabBarIcon: ({color, size}) => (
            <Icon name="local-taxi" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyReservation"
        component={ReservationScreen}
        initialParams={{prevTab}}
        options={{
          tabBarLabel: t('nav.myReservation'),
          tabBarIcon: ({color, size}) => (
            <Icon name="event" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyInfo"
        component={UserDetailScreen}
        options={{
          tabBarLabel: t('nav.myInfo'),
          tabBarIcon: ({color, size}) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
