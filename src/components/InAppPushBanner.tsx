import React, {useEffect, useRef} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '@styles/theme';
import {PushBannerMessage} from '@utils/push-banner';

const VISIBLE_MS = 4000;
const SLIDE_MS = 200;
const HIDDEN_OFFSET = -160;
const TOP_MARGIN = 8;
const SWIPE_UP_DY = -10;

interface Props {
  message: PushBannerMessage;
  onPress: () => void;
  onClose: () => void;
}

// 앱을 보고 있을 때 온 푸시를 화면 위에 잠깐 보여 준다. 위로 밀면 닫힌다.
const InAppPushBanner = ({message, onPress, onClose}: Props) => {
  const {colors} = useTheme();
  const {top} = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, {dy}) => dy < SWIPE_UP_DY,
      onPanResponderRelease: onClose,
    }),
  ).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: SLIDE_MS,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(onClose, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [translateY, onClose]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {top: top + TOP_MARGIN, transform: [{translateY}]},
      ]}>
      <TouchableOpacity
        testID="in-app-push-banner"
        accessibilityRole="button"
        activeOpacity={0.8}
        style={[
          styles.card,
          {
            backgroundColor: colors.background.elevated,
            borderColor: colors.border.primary,
          },
        ]}
        onPress={onPress}>
        <Text
          numberOfLines={1}
          style={[styles.title, {color: colors.text.primary}]}>
          {message.title}
        </Text>
        {!!message.body && (
          <Text
            numberOfLines={2}
            style={[styles.body, {color: colors.text.secondary}]}>
            {message.body}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default InAppPushBanner;
