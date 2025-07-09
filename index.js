/**
 * @format
 */

import {AppRegistry} from 'react-native';
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
        EncryptedStorage.setItem('roomUuid', remoteMessage.data.roomUuid);
      }
    }
  });

AppRegistry.registerComponent(appName, () => App);
