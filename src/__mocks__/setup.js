/* eslint-disable no-undef */

// ──────────────────────────────────────────────
// react-native-reanimated mock
// ──────────────────────────────────────────────
require('react-native-reanimated').setUpTests();

// ──────────────────────────────────────────────
// react-native-config mock
// ──────────────────────────────────────────────
jest.mock('react-native-config', () => ({
  API_URL: 'http://localhost:8000',
}));

// ──────────────────────────────────────────────
// Firebase mocks
// ──────────────────────────────────────────────
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: () => ({
    onNotification: jest.fn(),
    onNotificationDisplayed: jest.fn(),
  }),
}));

jest.mock('@react-native-firebase/messaging', () => {
  const noop = jest.fn();
  const messaging = () => ({
    getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
    onMessage: jest.fn(() => noop),
    onNotificationOpenedApp: jest.fn(() => noop),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    requestPermission: jest.fn(() => Promise.resolve(1)),
    registerDeviceForRemoteMessages: jest.fn(() => Promise.resolve()),
    isDeviceRegisteredForRemoteMessages: true,
  });
  messaging.AuthorizationStatus = {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  };
  return {__esModule: true, default: messaging};
});

// ──────────────────────────────────────────────
// @notifee/react-native mock
// ──────────────────────────────────────────────
jest.mock('@notifee/react-native', () =>
  require('@notifee/react-native/jest-mock'),
);

// ──────────────────────────────────────────────
// react-native-encrypted-storage mock
// ──────────────────────────────────────────────
const storageCache = {};
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn((key, value) => {
    storageCache[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn(key => Promise.resolve(storageCache[key] ?? null)),
  removeItem: jest.fn(key => {
    delete storageCache[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(storageCache).forEach(k => delete storageCache[k]);
    return Promise.resolve();
  }),
}));

// ──────────────────────────────────────────────
// react-native-device-info mock
// ──────────────────────────────────────────────
jest.mock('react-native-device-info', () =>
  require('react-native-device-info/jest/react-native-device-info-mock'),
);

// ──────────────────────────────────────────────
// react-native-safe-area-context mock
// ──────────────────────────────────────────────
jest.mock('react-native-safe-area-context', () => {
  const insets = {top: 47, left: 0, right: 0, bottom: 34};
  const frame = {x: 0, y: 0, width: 390, height: 844};
  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaView: ({children}) => children,
    useSafeAreaInsets: jest.fn(() => insets),
    useSafeAreaFrame: jest.fn(() => frame),
    initialWindowMetrics: {frame, insets},
    SafeAreaInsetsContext: {Consumer: ({children}) => children(insets)},
    SafeAreaFrameContext: {Consumer: ({children}) => children(frame)},
  };
});

// ──────────────────────────────────────────────
// @react-native-clipboard/clipboard mock
// ──────────────────────────────────────────────
jest.mock('@react-native-clipboard/clipboard', () =>
  require('@react-native-clipboard/clipboard/jest/clipboard-mock'),
);

// ──────────────────────────────────────────────
// react-native-gesture-handler mock
// ──────────────────────────────────────────────
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: require('react-native').ScrollView,
    Slider: View,
    Switch: View,
    TextInput: require('react-native').TextInput,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: require('react-native').FlatList,
    gestureHandlerRootHOC: jest.fn(c => c),
    Directions: {},
    Gesture: {
      Pan: jest.fn().mockReturnThis(),
      Tap: jest.fn().mockReturnThis(),
    },
    GestureDetector: View,
  };
});

// ──────────────────────────────────────────────
// socket.io-client mock
// ──────────────────────────────────────────────
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  };
  return {
    __esModule: true,
    default: jest.fn(() => mockSocket),
    io: jest.fn(() => mockSocket),
  };
});

// ──────────────────────────────────────────────
// react-native-keyboard-controller mock
// ──────────────────────────────────────────────
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardProvider: ({children}) => children,
  useKeyboardHandler: jest.fn(),
  KeyboardAwareScrollView: 'KeyboardAwareScrollView',
}));

// ──────────────────────────────────────────────
// react-native-vector-icons mock
// ──────────────────────────────────────────────
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// ──────────────────────────────────────────────
// @react-native-cookies/cookies mock
// ──────────────────────────────────────────────
jest.mock('@react-native-cookies/cookies', () => ({
  get: jest.fn(() => Promise.resolve({})),
  set: jest.fn(() => Promise.resolve(true)),
  clearAll: jest.fn(() => Promise.resolve()),
}));
