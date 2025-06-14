import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import EncryptedStorage from 'react-native-encrypted-storage';

// Navigation
import {RootStackParamList} from '@navigation/types';
import AuthNavigator from '@navigation/AuthNavigator';
import MainNavigator from '@navigation/MainNavigator';

// Auth Screens
import LandingScreen from '@screens/LandingScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import SignupScreen from '@screens/auth/SignupScreen';
import UserDetailScreen from '@screens/auth/UserDetailScreen';
import DeveloperPage from '@screens/auth/DeveloperPage';

// Paxi Screens
import PaxiRoomListScreen from '@screens/paxi/PaxiRoomListScreen';
import PaxiCreateRoomScreen from '@screens/paxi/CreatePaxiRoomScreen';
import NewChatScreen from '@screens/paxi/NewChatScreen';
import PaxiIntroScreen from '@screens/paxi/PaxiIntro';
import PaxiStartScreen from '@screens/paxi/PaxiStart';

// Place Reservation Screens
import PlaceReservationScreen from '@screens/place-reservation/PlaceReservationScreen';
import PlaceDetailReservationScreen from '@screens/place-reservation/PlaceDetailReservationScreen';
import PlaceReservationApplyScreen from '@screens/place-reservation/PlaceReservationApplyScreen';

// Club & Association Screens
import ClubScreen from '@screens/club/ClubScreen';
import ClubDetailScreen from '@screens/club/ClubDetailScreen';
import AssociationScreen from '@screens/association/AssociationScreen';
import AssociationDetailScreen from '@screens/association/AssociationDetailScreen';

// Other Screens
import ReservationScreen from '@screens/ReservationScreen';
import WhitebookScreen from '@screens/WhitebookScreen';
import BenefitsScreen from '@screens/BenefitsScreen';
import CampusShuttleScreen from '@screens/CampusShuttle';
import EquipmentReservationScreen from '@screens/equipment-reservation/EquipmentReservationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          {/* Auth Screens */}
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="UserDetail" component={UserDetailScreen} />
          <Stack.Screen name="Developer" component={DeveloperPage} />

          {/* Paxi Screens */}
          <Stack.Screen name="PaxiIntro" component={PaxiIntroScreen} />
          <Stack.Screen name="PaxiStart" component={PaxiStartScreen} />
          <Stack.Screen name="PaxiRoomList" component={PaxiRoomListScreen} />
          <Stack.Screen
            name="CreatePaxiRoomScreen"
            component={PaxiCreateRoomScreen}
          />
          <Stack.Screen name="NewChat" component={NewChatScreen} />

          {/* Place Reservation Screens */}
          <Stack.Screen
            name="PlaceReservation"
            component={PlaceReservationScreen}
          />
          <Stack.Screen
            name="PlaceDetailReservation"
            component={PlaceDetailReservationScreen}
          />
          <Stack.Screen
            name="PlaceReservationApply"
            component={PlaceReservationApplyScreen}
          />

          {/* Club & Association Screens */}
          <Stack.Screen name="Club" component={ClubScreen} />
          <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
          <Stack.Screen name="Association" component={AssociationScreen} />
          <Stack.Screen
            name="AssociationDetail"
            component={AssociationDetailScreen}
          />

          {/* Other Screens */}
          <Stack.Screen name="Whitebook" component={WhitebookScreen} />
          <Stack.Screen name="Benefits" component={BenefitsScreen} />
          <Stack.Screen name="CampusShuttle" component={CampusShuttleScreen} />
          <Stack.Screen
            name="EquipmentReservation"
            component={EquipmentReservationScreen}
          />
          <Stack.Screen name="Reservation" component={ReservationScreen} />

          {/* Main Navigators */}
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Main" component={MainNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
