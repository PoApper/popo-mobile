import React from 'react';
import {ScrollView, ScrollViewProps, View} from 'react-native';
import {useKeyboardHeight} from './CustomKeyboardAvoidingView';

type Props = ScrollViewProps & {
  extraOffset?: number;
  useSpacer?: boolean;
};

export const CustomKeyboardAvoidingScrollView: React.FC<Props> = ({
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  extraOffset = 16,
  useSpacer = true,
  children,
  onLayout,
  onContentSizeChange,
  ...props
}) => {
  const keyboardHeight = useKeyboardHeight();
  const bottomGap = Math.max(0, keyboardHeight) + extraOffset;

  return (
    <ScrollView
      style={[{flex: 1}, style]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      contentContainerStyle={[
        {flexGrow: 1},
        !useSpacer && {paddingBottom: bottomGap},
        contentContainerStyle,
      ]}
      onLayout={e => {
        console.log('viewportHeight', e.nativeEvent.layout.height);
        onLayout?.(e);
      }}
      onContentSizeChange={(w, h) => {
        console.log('contentHeight', h);
        onContentSizeChange?.(w, h);
      }}
      scrollEnabled={props.scrollEnabled !== false}
      {...props}>
      {children}
      {useSpacer && <View style={{height: bottomGap}} />}
    </ScrollView>
  );
};
