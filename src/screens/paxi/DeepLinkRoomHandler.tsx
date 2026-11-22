import React, {useEffect, useState} from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  ToastAndroid,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useTranslation} from 'react-i18next';

import paxi_api from '@utils/paxi_api';
import api from '@utils/api';
import {ChatRoomInfo} from '@interfaces/paxi';
import JoinConfirmModal from '@components/room/JoinConfirmModal';
import {getAxiosErrorInfo} from '@utils/axios-error';
import {reset_auth} from '@utils/reset';
import {RootStackParamList} from '@navigation/types';
import i18next from '@utils/i18n';
import {AUTH_TOKEN_KEY, IS_AUTHENTICATED_KEY} from '@utils/storage-keys';

/**
 * UUID 형식 검증 (RFC 4122)
 * 예: 550e8400-e29b-41d4-a716-446655440000
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeepLinkRoom'>;
  route: RouteProp<RootStackParamList, 'DeepLinkRoom'>;
};

/**
 * Check if error is related to missing nickname
 */
const isNicknameError = (detail?: string): boolean => {
  return (
    detail?.includes('닉네임') ||
    detail?.includes('닉네임을 먼저 생성') ||
    false
  );
};

/**
 * Handle 401 unauthorized errors - check for nickname error first, then redirect accordingly
 */
const handleUnauthorizedError = async (
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeepLinkRoom'>,
  detail?: string,
) => {
  if (isNicknameError(detail)) {
    // No nickname - redirect to PaxiIntro
    Alert.alert(
      i18next.t('paxi.deepLink.nicknameRequiredTitle'),
      i18next.t('paxi.deepLink.nicknameRequiredBody'),
      [
        {
          text: i18next.t('common.confirm'),
          onPress: () => navigation.navigate('PaxiIntro'),
        },
      ],
    );
  } else {
    // Unauthorized - clear auth and redirect to login
    await reset_auth();
    Alert.alert(
      i18next.t('paxi.deepLink.loginRequiredTitle'),
      i18next.t('common.sessionExpiredBody'),
      [
        {
          text: i18next.t('common.confirm'),
          onPress: () => navigation.navigate('Login'),
        },
      ],
    );
  }
};

const DeepLinkRoomHandler: React.FC<Props> = ({navigation, route}) => {
  const {t} = useTranslation();
  const {roomUuid} = route.params;
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState<ChatRoomInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const goBackOrResetToMain = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{name: 'Main', params: {prevTab: 'DeepLinkRoom'}}],
      });
    }
  };

  const resetToNewChat = () => {
    navigation.reset({
      index: 1,
      routes: [
        {name: 'Main', params: {prevTab: 'DeepLinkRoom'}},
        {name: 'NewChat', params: {roomUuid, from: 'roomList'}},
      ],
    });
  };

  useEffect(() => {
    handleDeepLink();
  }, [roomUuid]);

  const handleDeepLink = async () => {
    // 0. Validate roomUuid format
    if (!roomUuid || !isValidUUID(roomUuid)) {
      setLoading(false);
      Alert.alert(t('common.error'), t('paxi.deepLink.invalidLink'), [
        {
          text: t('common.confirm'),
          onPress: goBackOrResetToMain,
        },
      ]);
      return;
    }

    // 1. Check authentication
    try {
      const authToken = await EncryptedStorage.getItem(AUTH_TOKEN_KEY);
      const isAuth = await EncryptedStorage.getItem(IS_AUTHENTICATED_KEY);

      if (!authToken || isAuth !== 'true') {
        setLoading(false);
        Alert.alert(
          t('paxi.deepLink.loginRequiredTitle'),
          t('paxi.deepLink.loginRequiredBody'),
          [
            {
              text: t('common.confirm'),
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
        return;
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      setLoading(false);
      Alert.alert(t('common.error'), t('paxi.deepLink.authCheckFailed'), [
        {
          text: t('common.confirm'),
          onPress: () => navigation.navigate('Login'),
        },
      ]);
      return;
    }

    // 2. Get current user UUID
    let currentUserUuid: string;
    try {
      const userInfoResponse = await api.get('/auth/myInfo');
      currentUserUuid = userInfoResponse.data.uuid;
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      const {status, detail} = getAxiosErrorInfo(error);

      if (status === 401) {
        await handleUnauthorizedError(navigation, detail);
      } else {
        Alert.alert(t('common.error'), t('paxi.deepLink.userInfoFailed'), [
          {
            text: t('common.confirm'),
            onPress: goBackOrResetToMain,
          },
        ]);
      }
      setLoading(false);
      return;
    }

    // 3. Fetch room data
    try {
      const response = await paxi_api.get(`/room/${roomUuid}`);
      const fetchedRoomData = response.data;
      setRoomData(fetchedRoomData);

      // 4. Check if user is already in the room
      const isAlreadyJoined = fetchedRoomData.roomUsers?.some(
        (user: {userUuid: string; status: string}) =>
          user.userUuid === currentUserUuid && user.status !== 'KICKED',
      );

      if (isAlreadyJoined) {
        // User is already in the room - call joinRoom and navigate directly
        try {
          await paxi_api.post(`/room/join/${roomUuid}`);

          // Show toast/alert and navigate
          if (Platform.OS === 'android') {
            ToastAndroid.show(
              t('paxi.deepLink.alreadyJoined'),
              ToastAndroid.SHORT,
            );
            resetToNewChat();
          } else {
            Alert.alert(t('paxi.deepLink.alreadyJoined'), '', [
              {
                text: t('common.confirm'),
                onPress: resetToNewChat,
              },
            ]);
          }
        } catch (error) {
          const {status, detail} = getAxiosErrorInfo(error);

          if (status === 401) {
            await handleUnauthorizedError(navigation, detail);
          } else if (status === 403) {
            Alert.alert(
              t('paxi.deepLink.cannotJoinTitle'),
              t('paxi.deepLink.kicked'),
            );
          } else {
            Alert.alert(
              t('common.error'),
              [t('paxi.deepLink.enterFailed'), detail]
                .filter(Boolean)
                .join('\n'),
            );
          }
        }
        setLoading(false);
        return;
      }

      // User is not in the room - show join confirmation modal
      setShowModal(true);
      setLoading(false);
    } catch (error) {
      handleFetchError(error);
    }
  };

  const handleFetchError = async (error: unknown) => {
    const {status, detail} = getAxiosErrorInfo(error);

    if (status === 401) {
      await handleUnauthorizedError(navigation, detail);
    } else if (status === 404) {
      Alert.alert(t('common.error'), t('paxi.deepLink.roomNotFound'), [
        {
          text: t('common.confirm'),
          onPress: goBackOrResetToMain,
        },
      ]);
    } else {
      Alert.alert(
        t('common.error'),
        [t('paxi.deepLink.roomLoadFailed'), detail].filter(Boolean).join('\n'),
        [
          {
            text: t('common.confirm'),
            onPress: goBackOrResetToMain,
          },
        ],
      );
    }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    if (!roomUuid) return;

    try {
      await paxi_api.post(`/room/join/${roomUuid}`);
      setShowModal(false);
      resetToNewChat();
    } catch (error) {
      const {status, detail} = getAxiosErrorInfo(error);

      if (status === 401) {
        setShowModal(false);
        await handleUnauthorizedError(navigation, detail);
      } else if (status === 403) {
        Alert.alert(
          t('paxi.deepLink.cannotJoinTitle'),
          t('paxi.deepLink.kicked'),
        );
        setShowModal(false);
        goBackOrResetToMain();
      } else {
        Alert.alert(
          t('paxi.deepLink.joinFailedTitle'),
          [t('paxi.room.joinFailed'), detail].filter(Boolean).join('\n'),
        );
        setShowModal(false);
        goBackOrResetToMain();
      }
    }
  };

  const handleClose = () => {
    setShowModal(false);
    goBackOrResetToMain();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FA5721" />
      </View>
    );
  }

  return (
    <>
      {roomData && showModal && (
        <JoinConfirmModal
          visible={showModal}
          room={roomData}
          onClose={handleClose}
          onConfirm={handleJoinRoom}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default DeepLinkRoomHandler;
