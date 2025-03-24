export type RootStackParamList = {
  Auth: undefined;
  Main: {
    userId: string;
    userData: any;
  };
  Signup: undefined;
  Landing: undefined;
  Login: undefined;
  UserDetail: undefined;
  Reservation: undefined;
};

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Paxi: undefined;
  MyReservation: undefined;
  MyInfo: undefined;
};