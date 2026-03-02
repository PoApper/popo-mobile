module.exports = {
  preset: 'react-native',

  // path alias 매핑 (babel.config.js의 module-resolver와 동일)
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    // @env (react-native-dotenv) mock
    '^@env$': '<rootDir>/src/__mocks__/env.js',
    // 이미지/폰트 등 정적 파일 mock
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },

  // 글로벌 mock 설정 파일
  setupFiles: ['./src/__mocks__/setup.js'],
  // Jest 프레임워크 로드 후 실행 (beforeAll/afterAll 사용 가능)
  setupFilesAfterEnv: ['./src/__mocks__/setupAfterEnv.js'],

  // RN 패키지 중 ESM → CJS 변환이 필요한 것들
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '@react-native|react-native|' +
      '@react-navigation|' +
      '@notifee/react-native|' +
      'react-native-reanimated|' +
      'react-native-screens|' +
      'react-native-safe-area-context|' +
      'react-native-gesture-handler|' +
      'react-native-vector-icons|' +
      'react-native-svg|' +
      'react-native-calendars|' +
      'react-native-config|' +
      'react-native-device-info|' +
      'react-native-encrypted-storage|' +
      'react-native-keyboard-controller|' +
      'react-native-modal-datetime-picker|' +
      'react-native-worklets|' +
      'react-native-swipe-gestures|' +
      'socket.io-client|' +
      'engine.io-client|' +
      '@react-native-community|' +
      '@react-native-cookies|' +
      '@react-native-clipboard|' +
      '@react-native-firebase' +
      ')/)',
  ],

  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/__tests__/**',
    '!src/interfaces/**',
  ],

  // 테스트 파일 위치 (*.test.* 또는 *.spec.* 패턴만 매칭)
  testMatch: [
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/__tests__/**/*.{test,spec}.{ts,tsx}',
  ],
};
