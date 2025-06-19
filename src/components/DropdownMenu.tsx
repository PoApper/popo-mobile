import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  LayoutRectangle,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  isDarkMode?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  categories,
  onSelect,
  defaultText = '항목을 선택해주세요',
  style,
  textStyle,
  textSelectedStyle,
  dropdownStyle,
  isDarkMode = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] =
    useState<LayoutRectangle | null>(null);
  const buttonRef = useRef<View>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const openDropdown = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        const windowHeight = Dimensions.get('window').height;
        const dropdownHeight = Math.min(categories.length * 50, 300);
        const shouldShowAbove = pageY + height + dropdownHeight > windowHeight;
        setDropdownPosition({
          x: pageX,
          y: shouldShowAbove ? pageY - dropdownHeight : pageY + height,
          width,
          height,
        });
        setVisible(true);
      });
    }
  };

  const handleSelect = (name: string | null) => {
    setSelected(name);
    onSelect(name);
    setVisible(false);
  };

  // 스타일 동기화
  const borderColor = isDarkMode ? '#2C2C2C' : '#D0D0D0';
  const backgroundColor = isDarkMode ? '#1A1A1A' : '#FFFFFF';
  const fontColor = isDarkMode ? '#fff' : '#000';
  const placeholderColor = isDarkMode ? '#888' : '#b0b0b0';
  const selectedColor = isDarkMode ? '#007AFF' : '#007AFF';
  const selectedBg = isDarkMode ? '#232323' : '#f8f8f8';

  return (
    <View style={{flex: 1}}>
      <TouchableOpacity
        ref={buttonRef}
        onPress={openDropdown}
        style={[
          styles.button,
          {
            borderColor: borderColor,
            backgroundColor: backgroundColor,
            borderRadius: 6,
            height: 42,
            minWidth: 100,
          },
          style,
        ]}>
        <Text
          style={[
            styles.buttonText,
            {color: selected ? fontColor : placeholderColor, fontSize: 13},
            selected ? textSelectedStyle : textStyle,
          ]}>
          {selected
            ? categories.find(cat => cat.name === selected)?.name
            : defaultText}
        </Text>
        <Animated.View style={{transform: [{rotate}]}}>
          <Icon name="keyboard-arrow-down" size={22} color={placeholderColor} />
        </Animated.View>
      </TouchableOpacity>

      {visible && dropdownPosition && (
        <Modal transparent animationType="fade">
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
                    backgroundColor,
                    borderColor,
                    borderRadius: 10,
                    borderWidth: 1,
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 1,
                  },
                  dropdownStyle,
                ]}>
                <FlatList
                  data={categories}
                  keyExtractor={item => item.name}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.item,
                        {borderBottomColor: borderColor},
                        selected === item.name && {backgroundColor: selectedBg},
                      ]}
                      onPress={() => handleSelect(item.name)}>
                      <Text
                        style={[
                          styles.itemText,
                          {
                            color:
                              selected === item.name
                                ? selectedColor
                                : fontColor,
                            fontSize: 15,
                          },
                          selected === item.name && {fontWeight: '700'},
                        ]}>
                        {item.name}
                      </Text>
                      {selected === item.name && (
                        <Icon name="check" size={20} color={selectedColor} />
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    // height, borderColor, backgroundColor, borderRadius는 동적으로 적용
  },
  buttonText: {
    flex: 1,
    textAlignVertical: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dropdownContainer: {
    // backgroundColor, borderColor, borderRadius, borderWidth는 동적으로 적용
    maxHeight: 300,
    minWidth: 100,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 15,
  },
});

export default DropdownMenu;
