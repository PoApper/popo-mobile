const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // axios 1.13.x 업그레이드 후 exports 필드의 react-native 조건으로 브라우저 번들을 resolve하기 위해 필요. 제거 시 crypto 모듈 에러 발생.
    unstable_enablePackageExports: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
