/**
 * @format
 */

import {AppRegistry} from 'react-native';
import moment from 'moment';
import 'moment/locale/ko';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import EncryptedStorage from 'react-native-encrypted-storage';

// Moment 로케일은 앱 진입점에서 한 번만 설정한다.
// 개별 UI 컴포넌트에서 side-effect import 하지 않도록 중앙화 (#244)
moment.locale('ko');

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

AppRegistry.registerComponent(appName, () => App);
