import {NativeModules, Platform} from 'react-native';

const getEnvironment = () => {
  // iOS에서 AppDelegate에서 전달받은 환경 변수 읽기
  if (Platform.OS === 'ios') {
    const {ENV_CONFIG, API_URL, PAXI_API_URL} =
      NativeModules.SourceCode?.constantsToExport || {};

    // AppDelegate에서 전달받은 props 확인
    const appDelegateProps = global.__INITIAL_PROPS__ || {};
    const envConfig =
      ENV_CONFIG || appDelegateProps.ENV_CONFIG || 'Development';
    const apiUrl =
      API_URL ||
      appDelegateProps.API_URL ||
      'https://api.popo-dev.poapper.club';
    const paxiApiUrl =
      PAXI_API_URL ||
      appDelegateProps.PAXI_API_URL ||
      'https://api.paxi.popo-dev.poapper.club';

    return {
      environmentName: envConfig,
      apiUrl: apiUrl,
      paxiApiUrl: paxiApiUrl,
      isProduction: envConfig === 'Production',
      isTestFlight: envConfig === 'TestFlight',
      isDevelopment: envConfig === 'Debug' || envConfig === 'Development',
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
