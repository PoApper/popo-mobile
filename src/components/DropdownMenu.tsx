import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  UIManager,
  findNodeHandle,
  LayoutRectangle,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInput,
} from 'react-native';

interface Category {
  name: string;
}

interface DropdownMenuProps {
  style?: StyleProp<ViewStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textSelectedStyle?: StyleProp<TextStyle>;
  defaultText?: string;
  categories: Category[];
  onSelect: (selectedCategory: string | null) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  categories,
  onSelect,
  defaultText = '항목을 선택해주세요',
  style,
  textStyle,
  textSelectedStyle,
  dropdownStyle,
}) => {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] =
    useState<LayoutRectangle | null>(null);

  // useRef를 사용해 TouchableOpacity의 ref를 설정, 타입을 View로 설정
  const buttonRef = useRef<View | null>(null);

  const openDropdown = () => {
    const handle = findNodeHandle(buttonRef.current);
    if (handle) {
      UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
        setDropdownPosition({x: pageX, y: pageY + height + 5, width, height});
        setVisible(true);
      });
    }
  };

  const handleSelect = (id: string | null) => {
    setSelected(id);
    onSelect(id);
    setVisible(false);
  };

  return (
    <View>
      {/* buttonRef를 통해 TouchableOpacity 참조 */}
      <TouchableOpacity
        ref={buttonRef}
        onPress={openDropdown}
        style={[styles.button, style]}>
        <TextInput
          style={[styles.buttonText, selected ? textSelectedStyle : textStyle]}
          editable={false}>
          {selected
            ? categories.find(cat => cat.name === selected)?.name
            : defaultText}
        </TextInput>
      </TouchableOpacity>

      {visible && dropdownPosition && (
        <Modal transparent animationType="none">
          <TouchableWithoutFeedback onPress={() => setVisible(false)}>
            <View style={styles.overlay}>
              <View
                style={[
                  styles.dropdownContainer,
                  {
                    position: 'absolute',
                    top: dropdownPosition.y,
                    left: dropdownPosition.x,
                    width: dropdownPosition.width,
                  },
                ]}>
                <FlatList
                  data={[...categories]}
                  keyExtractor={item => item.name || 'none'}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[styles.item, dropdownStyle]}
                      onPress={() => handleSelect(item.name || null)}>
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
    backgroundColor: '#eee',
    width: '100%',
  },
  buttonText: {
    fontSize: 14,
    textAlignVertical: 'center',
  },
  overlay: {
    flex: 1,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    maxHeight: 300,
  },
  item: {
    padding: 12,
  },
});

export default DropdownMenu;
