import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface AlertableTextInputProps {
  placeholder?: string;
  placeholderTextColor?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  value: string;
  onChangeText: (text: string) => void;
}

const AlertableTextInput: React.FC<AlertableTextInputProps> = ({
  placeholder = '입력하세요',
  placeholderTextColor = '#999',
  style,
  inputStyle,
  value,
  onChangeText,
}) => {
  const [editable, setEditable] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    if (!editable) {
      /*
      Alert.alert(
        '수정 확인',
        '수정하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            onPress: () => {
              setEditable(true);
              // 편집 가능해진 후 포커스
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            },
          },
        ],
        { cancelable: true }
      );
      */
    }
  };

  return (
    <View style={[styles.container, style] as any}>
      {/* 편집 불가 시 전체 영역에서 터치 감지 */}
      {!editable && <Pressable style={styles.overlay} onPress={handlePress} />}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        editable={editable}
        style={[inputStyle] as any}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default AlertableTextInput;
