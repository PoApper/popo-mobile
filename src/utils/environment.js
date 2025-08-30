import {NativeModules, Platform} from 'react-native';

const getEnvironment = () => {
  // iOS에서 Info.plist의 환경 변수 읽기
  if (Platform.OS === 'ios') {
    const {AppEnvironment} = NativeModules;
    if (!AppEnvironment) {
      console.warn(
        'AppEnvironment 모듈을 찾을 수 없습니다. 기본 개발 환경으로 설정합니다.',
      );
      return {
        environmentName: 'Development',
        apiUrl: 'https://api.popo-dev.poapper.club',
        isProduction: false,
        isTestFlight: false,
        isDevelopment: true,
      };
    }
    const {ENV_CONFIG, API_URL} = NativeModules.SourceCode.constantsToExport;
    return {
      environmentName: ENV_CONFIG || 'Development',
      apiUrl: API_URL || 'https://api.popo-dev.poapper.club',
      isProduction: ENV_CONFIG === 'Production',
      isTestFlight: ENV_CONFIG === 'TestFlight',
      isDevelopment: ENV_CONFIG === 'Debug' || !ENV_CONFIG,
    };
  }

  // Android는 별도 설정 필요
  return {
    environmentName: 'Development',
    apiUrl: 'https://api.popo-dev.poapper.club',
    isProduction: false,
    isTestFlight: false,
    isDevelopment: true,
  };
};

const Environment = getEnvironment();

export default Environment;
