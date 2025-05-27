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
  useColorScheme,
} from 'react-native';

interface Category {
  id: string;
  name: string;
}

interface DropdownFilterProps {
  style?: StyleProp<ViewStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
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
  const [dropdownPosition, setDropdownPosition] =
    useState<LayoutRectangle | null>(null);
  const isDarkMode = useColorScheme() === 'dark';

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
        style={[
          styles.button,
          {
            backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
            borderColor: isDarkMode ? '#2C2C2C' : '#E5E7EB',
          },
          style,
        ]}>
        <Text
          style={[
            styles.buttonText,
            {
              color: isDarkMode ? '#FFFFFF' : '#000000',
            },
            selected ? textSelectedStyle : textStyle,
          ]}>
          {selected
            ? categories.find(cat => cat.id === selected)?.name
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
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                    borderColor: isDarkMode ? '#2C2C2C' : '#E5E7EB',
                    position: 'absolute',
                    top: dropdownPosition.y,
                    left: dropdownPosition.x,
                    width: dropdownPosition.width * 1.5,
                  },
                ]}>
                <FlatList
                  data={[
                    ...(showDefaultTextInDropDown
                      ? [{id: '', name: '전체보기'}]
                      : []),
                    ...categories,
                  ]}
                  keyExtractor={item => item.id || 'all'}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.item,
                        {
                          borderBottomColor: isDarkMode ? '#2C2C2C' : '#E5E7EB',
                        },
                        dropdownStyle,
                      ]}
                      onPress={() => handleSelect(item.id || null)}>
                      <Text
                        style={{
                          color: isDarkMode ? '#FFFFFF' : '#000000',
                        }}>
                        {item.name}
                      </Text>
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
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 75,
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownContainer: {
    borderRadius: 5,
    borderWidth: 1,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
  },
});

export default DropdownFilter;
