import Config from 'react-native-config';

export default {
  ENV_CONFIG: Config.ENV_CONFIG || 'Development',
  API_URL: Config.API_URL || 'https://api.popo-dev.poapper.club',
  PAXI_API_URL: Config.PAXI_API_URL || 'https://api.paxi.popo-dev.poapper.club',
};

console.log(Config.ENV_CONFIG);
console.log(Config.API_URL);
console.log(Config.PAXI_API_URL);
