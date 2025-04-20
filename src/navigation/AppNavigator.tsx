import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EncryptedStorage from 'react-native-encrypted-storage';

import { RootStackParamList, AuthStackParamList, MainTabParamList } from './types';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SignupScreen from '../screens/SignupScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import ReservationScreen from '../screens/ReservationScreen';
import NewPaxiRoomScreen from '../screens/NewPaxiRoomScreen';
import PaxiRoomListScreen from '../screens/PaxiRoomListScreen';
import PlaceReservationScreen from '../screens/PlaceReservationScreen';
import WhitebookScreen from '../screens/WhitebookScreen';
import BenefitsScreen from '../screens/BenefitsScreen';
import ClubScreen from '../screens/ClubScreen';
import ClubDetailScreen from '../screens/ClubDetailScreen';
import AssociationScreen from '../screens/AssociationScreen';
import AssociationDetailScreen from '../screens/AssociationDetailScreen';
import CampusShuttleScreen from '../screens/CampusShuttle';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#333333' : '#E5E7EB',
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: isDarkMode ? '#888888' : '#6B7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Paxi"
        component={PaxiRoomListScreen}
        options={{
          tabBarLabel: 'Paxi',
          tabBarIcon: ({ color, size }) => (
            <Icon name="local-taxi" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyReservation"
        component={ReservationScreen}
        options={{
          tabBarLabel: '내 일정',
          tabBarIcon: ({ color, size }) => (
            <Icon name="event" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyInfo"
        component={UserDetailScreen}
        options={{
          tabBarLabel: '내 정보',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authToken = await EncryptedStorage.getItem('auth_token');
        const isAuth = await EncryptedStorage.getItem('isAuthenticated');
        setIsAuthenticated(!!authToken && isAuth === 'true');
      } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isAuthenticated === null) {
    return null; // 로딩 중
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? "Main" : "Landing"}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="PaxiRoomList" component={PaxiRoomListScreen} />
          <Stack.Screen name="NewPaxiRoom" component={NewPaxiRoomScreen} />
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="UserDetail" component={UserDetailScreen} />
          <Stack.Screen name="Reservation" component={ReservationScreen} />
          <Stack.Screen name="PlaceReservation" component={PlaceReservationScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Whitebook" component={WhitebookScreen} />
          <Stack.Screen name="Benefits" component={BenefitsScreen} />
          <Stack.Screen name="Club" component={ClubScreen} />
          <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
          <Stack.Screen name="Association" component={AssociationScreen} />
          <Stack.Screen name="AssociationDetail" component={AssociationDetailScreen} />
          <Stack.Screen name="CampusShuttle" component={CampusShuttleScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Main" component={MainNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;