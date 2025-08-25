import React from 'react';
import {ScrollViewProps} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {CustomKeyboardAvoidingScrollView} from './CustomKeyboardAvoidingScrollView';
import {isLegacySoftInput} from './AdaptiveKeyboardAvoidingView';

type Props = ScrollViewProps & {
  legacyExtraScrollHeight?: number;
  viewIsInsideTabBar?: boolean;
};

export const AdaptiveKeyboardAvoidingScrollView: React.FC<Props> = ({
  legacyExtraScrollHeight = 100,
  viewIsInsideTabBar,
  keyboardShouldPersistTaps = 'handled',
  contentContainerStyle,
  children,
  style,
  ...rest
}) => {
  const useLegacy = isLegacySoftInput();

  if (useLegacy) {
    // iOS 전부 + Android <= 34 -> KeyboardAwareScrollView 사용
    return (
      <KeyboardAwareScrollView
        style={style}
        contentContainerStyle={contentContainerStyle as any}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        enableOnAndroid={true}
        showsVerticalScrollIndicator={false}
        viewIsInsideTabBar={viewIsInsideTabBar}
        extraScrollHeight={legacyExtraScrollHeight}
        extraHeight={legacyExtraScrollHeight}
        {...rest}>
        {children}
      </KeyboardAwareScrollView>
    );
  }

  // Android >= 35 (edge-to-edge) -> CustomKeyboardAvoidingScrollView 사용
  return (
    <CustomKeyboardAvoidingScrollView
      style={[{flex: 1}, style]}
      contentContainerStyle={[{flexGrow: 1}, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...rest}>
      {children}
    </CustomKeyboardAvoidingScrollView>
  );
};
