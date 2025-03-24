export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  UserDetail: {
    userId: string;
    userData: {
      id?: string;
      name?: string;
      email?: string;
      profileImage?: string;
      // 기타 사용자 데이터 필드 추가 가능
      [key: string]: any;
    };
  };
  Reservation: any;
  Signup: undefined;  // 회원가입 화면 추가
};