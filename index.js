/**
 * @format
 */

import {AppRegistry} from 'react-native';
import moment from 'moment';
import 'moment/locale/ko';
import App from './App';
import {name as appName} from './app.json';

// Moment 로케일은 앱 진입점에서 한 번만 설정
moment.locale('ko');

AppRegistry.registerComponent(appName, () => App);
