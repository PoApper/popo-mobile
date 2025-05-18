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
  ChatList: undefined;
  Chat: {
    roomUuid: string;
  };
  Settlement: {
    roomUuid: string;
  };
  PaxiRoomList: undefined;
  NewPaxiRoom: undefined;
  NewPaxiRoomNext: {
    roomName: string;
    roomDetails: string;
    departureName: string;
    arrivalName: string;
    selectedDate: string;
  };
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
