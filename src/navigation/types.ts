export type RootStackParamList = {
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
  // 추후 추가될 수 있는 다른 화면들
};