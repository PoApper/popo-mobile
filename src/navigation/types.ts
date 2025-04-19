import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: {
    userId: string;
    userData: any;
  };
  Home: undefined;
  Signup: undefined;
  Landing: undefined;
  Login: undefined;
  UserDetail: undefined;
  Reservation: undefined;
  PlaceReservation: undefined;
  Whitebook: undefined;
  Benefits: undefined;
  Club: undefined;
  ClubDetail: {
    clubId: string;
    clubName: string;
  };
};

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Paxi: undefined;
  MyReservation: {
    navigation: NativeStackNavigationProp<RootStackParamList>;
    route: RouteProp<MainTabParamList, 'MyReservation'>;
  };
  MyInfo: {
    navigation: NativeStackNavigationProp<RootStackParamList>;
    route: RouteProp<MainTabParamList, 'MyInfo'>;
  };
};