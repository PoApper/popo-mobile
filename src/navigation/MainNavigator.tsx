import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useColorScheme} from 'react-native';

import {MainTabParamList} from '@navigation/types';
import HomeScreen from '@screens/HomeScreen';
import UserDetailScreen from '@screens/auth/UserDetailScreen';
import ReservationScreen from '@screens/ReservationScreen';
import PaxiRoomListScreen from '@screens/PaxiRoomListScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#333333' : '#E5E7EB',
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: isDarkMode ? '#888888' : '#6B7280',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({color, size}) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Paxi"
        component={PaxiRoomListScreen}
        options={{
          tabBarLabel: 'Paxi',
          tabBarIcon: ({color, size}) => (
            <Icon name="local-taxi" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyReservation"
        component={ReservationScreen}
        options={{
          tabBarLabel: '내 일정',
          tabBarIcon: ({color, size}) => (
            <Icon name="event" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyInfo"
        component={UserDetailScreen}
        options={{
          tabBarLabel: '내 정보',
          tabBarIcon: ({color, size}) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
