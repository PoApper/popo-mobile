import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type RootStackParamList = AuthStackParamList &
  MainTabParamList &
  PaxiStackParamList &
  PlaceReservationStackParamList &
  ClubStackParamList &
  AssociationStackParamList &
  StudentAssociationStackParamList &
  OtherStackParamList;

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  Leave: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Paxi: undefined;
  MyReservation: {
    prevTab: string;
  };
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
    // 정책 매칭과 API에는 placeName(한글 원문)을 쓰고, 화면에는 placeLabel을 보여준다
    placeName: string;
    placeLabel: string;
    placeId: string;
    selectedDate?: string;
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

export type StudentAssociationStackParamList = {
  StudentAssociation: undefined;
  StudentAssociationDetail: {
    studentAssociationName: string;
  };
};

export type OtherStackParamList = {
  Auth: undefined;
  Main: {
    userId?: string;
    userData?: any;
    tab?: string;
    prevTab: string;
  };
  Chat: {
    roomUuid: string;
  };
  NewChat: {
    roomUuid: string;
    from?: string;
  };
  DeepLinkRoom: {
    roomUuid: string;
  };
  Settlement: {
    roomUuid: string;
  };
  ModifyPaxiRoom: {
    roomUuid: string;
  };
  PaxiReportList: undefined;
  Login: undefined;
  UserDetail: undefined;
  UserAccountInfo: undefined;
  Developer: undefined;
  Whitebook: undefined;
  Benefits: undefined;
  CampusShuttle: undefined;
  EquipmentReservation: undefined;
  EquipmentReservationApply: {
    association: string;
    selectedDate: string;
  };
  About: undefined;
  OpenSourceLicenses: undefined;
  Recruiting: undefined;
};
