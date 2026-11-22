import {Linking, Alert, Platform, ToastAndroid} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import i18next from 'i18next';

/**
 * URL을 열고, 실패 시 복사 옵션을 제공하는 유틸리티 함수
 * @param url 열고자 하는 URL
 */
export async function openURLWithFallback(url: string): Promise<void> {
  const alertTitle = i18next.t('link.openFailedTitle');
  const alertMessage = i18next.t('link.openFailedBody');
  const copySuccessMessage = i18next.t('link.copied');

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('링크 열기 실패:', error);
        // 지원된다고 했지만 실제로 열 수 없는 경우 처리
        showCopyAlert(url, alertTitle, alertMessage, copySuccessMessage);
      }
    } else {
      // URL을 열 수 없는 경우
      showCopyAlert(url, alertTitle, alertMessage, copySuccessMessage);
    }
  } catch (error) {
    console.error('링크 열기 오류:', error);
    Alert.alert(i18next.t('common.error'), i18next.t('link.networkError'), [
      {text: i18next.t('common.confirm'), style: 'default'},
    ]);
  }
}

/**
 * 복사 기능이 포함된 Alert를 표시하는 헬퍼 함수
 */
function showCopyAlert(
  url: string,
  title: string,
  message: string,
  copySuccessMessage: string,
): void {
  Alert.alert(title, message + '\n\n' + url, [
    {
      text: i18next.t('link.copy'),
      onPress: () => {
        Clipboard.setString(url);
        if (Platform.OS === 'android') {
          ToastAndroid.show(copySuccessMessage, ToastAndroid.SHORT);
        } else {
          Alert.alert(
            i18next.t('link.copiedTitle'),
            i18next.t('link.copiedBody'),
          );
        }
      },
    },
    {text: i18next.t('common.confirm'), style: 'default'},
  ]);
}

/**
 * 단순히 URL을 여는 함수 (복사 기능 없음)
 * @param url 열고자 하는 URL
 * @param onError 에러 발생 시 콜백
 */
export async function openURL(
  url: string,
  onError?: (error: Error) => void,
): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      const error = new Error('URL을 열 수 없습니다.');
      if (onError) {
        onError(error);
      } else {
        console.error('URL 열기 실패:', url);
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      console.error('URL 열기 오류:', error);
    }
  }
}
