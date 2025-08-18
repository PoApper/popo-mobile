import React, {useEffect, useState} from 'react';
import {View, ViewProps} from 'react-native';
import {Keyboard, KeyboardEvent, Platform, LayoutAnimation} from 'react-native';

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        LayoutAnimation.easeInEaseOut();
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.easeInEaseOut();
        setKeyboardHeight(0);
      },
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return keyboardHeight;
}

export const CustomKeyboardAvoidingView: React.FC<ViewProps> = ({
  style,
  children,
  ...props
}) => {
  const keyboardHeight = useKeyboardHeight();

  return (
    <View style={[style, {paddingBottom: keyboardHeight}]} {...props}>
      {children}
    </View>
  );
};
