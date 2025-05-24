import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import EncryptedStorage from 'react-native-encrypted-storage';

import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
} from './types';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import UserDetailScreen from '../screens/auth/UserDetailScreen';
import DeveloperPage from '../screens/auth/DeveloperPage';
import ReservationScreen from '../screens/ReservationScreen';
import CreatePaxiRoomScreen from '../screens/paxi/CreatePaxiRoomScreen';
import PaxiRoomListScreen from '../screens/paxi/PaxiRoomListScreen';
import PlaceReservationScreen from '../screens/place-reservation/PlaceReservationScreen';
import PlaceDetailReservationScreen from '../screens/place-reservation/PlaceDetailReservationScreen';
import PlaceReservationApplyScreen from '../screens/place-reservation/PlaceReservationApplyScreen';
import WhitebookScreen from '../screens/WhitebookScreen';
import BenefitsScreen from '../screens/BenefitsScreen';
import ClubScreen from '../screens/club/ClubScreen';
import ClubDetailScreen from '../screens/club/ClubDetailScreen';
import AssociationScreen from '../screens/association/AssociationScreen';
import AssociationDetailScreen from '../screens/association/AssociationDetailScreen';
import CampusShuttleScreen from '../screens/CampusShuttle';
import ChatScreen from '../screens/ChatScreen';
import SettlementScreen from '../screens/SettlementScreen';
import PaxiStartScreen from '../screens/paxi/PaxiStart';
import NewChatScreen from '../screens/NewChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
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
          initialRouteName={isAuthenticated ? 'Main' : 'Landing'}
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="PaxiStart" component={PaxiStartScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="NewChat" component={NewChatScreen} />
          <Stack.Screen name="Settlement" component={SettlementScreen} />
          <Stack.Screen name="PaxiRoomList" component={PaxiRoomListScreen} />
          <Stack.Screen
            name="CreatePaxiRoomScreen"
            component={CreatePaxiRoomScreen}
          />
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="UserDetail" component={UserDetailScreen} />
          <Stack.Screen name="Developer" component={DeveloperPage} />
          <Stack.Screen name="Reservation" component={ReservationScreen} />
          <Stack.Screen
            name="PlaceReservation"
            component={PlaceReservationScreen}
          />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Whitebook" component={WhitebookScreen} />
          <Stack.Screen name="Benefits" component={BenefitsScreen} />
          <Stack.Screen name="Club" component={ClubScreen} />
          <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
          <Stack.Screen name="Association" component={AssociationScreen} />
          <Stack.Screen
            name="AssociationDetail"
            component={AssociationDetailScreen}
          />
          <Stack.Screen name="CampusShuttle" component={CampusShuttleScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen
            name="PlaceDetailReservation"
            component={PlaceDetailReservationScreen}
          />
          <Stack.Screen
            name="PlaceReservationApply"
            component={PlaceReservationApplyScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
