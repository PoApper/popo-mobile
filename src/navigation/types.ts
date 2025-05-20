import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: {
    userId: string;
    userData: any;
  };
  Home: undefined;
  Signup: undefined;
  Landing: undefined;
  Chat: {
    roomUuid: string;
  };
  Settlement: {
    roomUuid: string;
  };
  PaxiStart: undefined;
  PaxiRoomList: undefined;
  CreatePaxiRoomScreen: undefined;
  Login: undefined;
  UserDetail: undefined;
  Developer: undefined;
  Reservation: undefined;
  PlaceReservation: undefined;
  PlaceDetail: {
    placeId: string;
    placeName: string;
  };
  PlaceDetailReservation: {
    placeId: string;
    placeName: string;
  };
  PlaceReservationApply: {
    buildingName: string;
    placeName: string;
    placeId: string;
  };
  Whitebook: undefined;
  Benefits: undefined;
  Club: undefined;
  ClubDetail: {
    clubId: string;
    clubName: string;
  };
  Association: undefined;
  AssociationDetail: {
    associationId: string;
    associationName: string;
  };
  CampusShuttle: undefined;
};

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Paxi: undefined;
  MyReservation: undefined;
  MyInfo: {
    navigation: NativeStackNavigationProp<RootStackParamList>;
    route: RouteProp<MainTabParamList, 'MyInfo'>;
  };
};
