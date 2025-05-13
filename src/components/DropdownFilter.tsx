import React, { useState, useRef } from 'react';
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
} from 'react-native';

interface Category {
  id: string;
  name: string;
}

interface DropdownFilterProps {
  style?: StyleProp<ViewStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textSelectedStyle?: StyleProp<TextStyle>;
  defaultText?: string;
  showDefaultTextInDropDown?: boolean;
  categories: Category[];
  onSelect: (selectedCategory: string | null) => void;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  categories,
  onSelect,
  defaultText = '필터선택',
  showDefaultTextInDropDown = true,
  style,
  textStyle,
  textSelectedStyle,
  dropdownStyle,
}) => {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<LayoutRectangle | null>(null);

  // useRef를 사용해 TouchableOpacity의 ref를 설정, 타입을 View로 설정
  const buttonRef = useRef<View | null>(null);

  const openDropdown = () => {
    const handle = findNodeHandle(buttonRef.current);
    if (handle) {
      UIManager.measure(
        handle,
        (x, y, width, height, pageX, pageY) => {
          setDropdownPosition({ x: pageX, y: pageY + height + 5, width, height });
          setVisible(true);
        }
      );
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
      <TouchableOpacity ref={buttonRef} onPress={openDropdown} style={[styles.button, style]}>
        <Text style={[styles.buttonText,selected ? textSelectedStyle : textStyle]}>
          {selected
            ? categories.find((cat) => cat.id === selected)?.name
            : defaultText}
        </Text>
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
                    width: dropdownPosition.width * 1.5,
                  },
                ]}
              >
                <FlatList
                  data={[
                    ...(showDefaultTextInDropDown ? [{ id: '', name: '전체보기' }] : []),
                    ...categories
                  ]}
                  keyExtractor={(item) => item.id || 'all'}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.item, dropdownStyle]}
                      onPress={() => handleSelect(item.id || null)}
                    >
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
    width: 75,
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

export default DropdownFilter;
