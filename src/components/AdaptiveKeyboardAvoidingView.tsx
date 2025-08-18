import React from 'react';
import {
  Platform,
  ViewProps,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
} from 'react-native';
import {CustomKeyboardAvoidingView} from './CustomKeyboardAvoidingView';

export function isLegacySoftInput(): boolean {
  if (Platform.OS === 'android') {
    const api = Number(Platform.Version);
    return api <= 34;
  }
  return true;
}

type AdaptiveProps = ViewProps & {
  legacyBehavior?: KeyboardAvoidingViewProps['behavior'];
  legacyVerticalOffset?: number;
};

export const AdaptiveKeyboardAvoidingView: React.FC<AdaptiveProps> = ({
  style,
  children,
  legacyBehavior = Platform.OS === 'ios' ? 'padding' : undefined,
  legacyVerticalOffset = Platform.OS === 'ios' ? 0 : 20,
  ...rest
}) => {
  const useLegacy = isLegacySoftInput();

  if (useLegacy) {
    return (
      <KeyboardAvoidingView
        behavior={legacyBehavior}
        keyboardVerticalOffset={legacyVerticalOffset}
        style={style}
        {...rest}>
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <CustomKeyboardAvoidingView style={[{flex: 1}, style]} {...rest}>
      {children}
    </CustomKeyboardAvoidingView>
  );
};
