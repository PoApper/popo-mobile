import Config from 'react-native-config';

const getEnvironment = () => {
  return {
    environmentName: Config.ENV_CONFIG,
    apiUrl: Config.API_URL,
    paxiApiUrl: Config.PAXI_API_URL,
    isProduction: Config.ENV_CONFIG === 'Production',
    isTestFlight: Config.ENV_CONFIG === 'TestFlight',
    isDevelopment:
      Config.ENV_CONFIG === 'Debug' || Config.ENV_CONFIG === 'Development',
  };
};

const Environment = getEnvironment();

export default Environment;
