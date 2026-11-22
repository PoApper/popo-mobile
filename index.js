/**
 * @format
 */

import {AppRegistry, Linking, LogBox, Platform, Settings} from 'react-native';
import './src/utils/i18n';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import EncryptedStorage from 'react-native-encrypted-storage';

// NOTE: deeplink queueing
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('Notification caused app to open:', remoteMessage);

      EncryptedStorage.setItem(
        'pendingNavigation',
        JSON.stringify(remoteMessage),
      );
      if (remoteMessage.data.roomUuid) {
        EncryptedStorage.setItem(
          'roomUuid',
          JSON.stringify({
            roomUuid: remoteMessage.data.roomUuid,
            from: 'roomList',
          }),
        );
      }
    }
  });

// Maestro e2e 실행 중에는 LogBox 토스트가 캡처를 가리지 않도록 끈다(dev 빌드 전용).
// iOS는 launchApp 인자(NSUserDefaults), Android는 popo-dev://e2e 링크로 켠다.
if (__DEV__) {
  const isE2EUrl = url => url === 'popo-dev://e2e';
  if (Platform.OS === 'ios' && Settings.get('e2eMode')) {
    LogBox.ignoreAllLogs();
  }
  Linking.getInitialURL().then(url => isE2EUrl(url) && LogBox.ignoreAllLogs());
  Linking.addEventListener('url', ({url}) => {
    if (isE2EUrl(url)) {
      LogBox.ignoreAllLogs();
    }
  });
}

AppRegistry.registerComponent(appName, () => App);
