import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type RootStackParamList = AuthStackParamList &
  MainTabParamList &
  PaxiStackParamList &
  PlaceReservationStackParamList &
  ClubStackParamList &
  AssociationStackParamList &
  OtherStackParamList;

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
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

export type PaxiStackParamList = {
  PaxiIntro: undefined;
  PaxiStart: undefined;
  PaxiRoomList: undefined;
  CreatePaxiRoomScreen: undefined;
};

export type PlaceReservationStackParamList = {
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
};

export type ClubStackParamList = {
  Club: undefined;
  ClubDetail: {
    clubId: string;
    clubName: string;
  };
};

export type AssociationStackParamList = {
  Association: undefined;
  AssociationDetail: {
    associationId: string;
    associationName: string;
  };
};

export type OtherStackParamList = {
  Auth: undefined;
  Main: {
    userId: string;
    userData: any;
  };
  Chat: {
    roomUuid: string;
  };
  NewChat: {
    roomUuid: string;
  };
  Settlement: {
    roomUuid: string;
  };
  Login: undefined;
  UserDetail: undefined;
  Developer: undefined;
  Whitebook: undefined;
  Benefits: undefined;
  CampusShuttle: undefined;
  EquipmentReservation: undefined;
  EquipmentReservationApply: {
    association: string;
  };
  Reservation: undefined;
};
