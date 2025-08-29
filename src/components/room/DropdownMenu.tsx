/**
 * Use for select the location in CreatePaxiRoomScreen
 */

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
  Animated,
  Dimensions,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {colors} from '@styles/default';

interface Option {
  name: string;
}

interface DropdownMenuProps {
  placeholderText: string;
  options: Option[];
  selected: string | null;
  onSelect: (selectedOption: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  placeholderText,
  options,
  selected,
  onSelect,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [visible, setVisible] = useState(false);
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
        const dropdownHeight = Math.min(options.length * 50, 300);
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

  const ColorStyle = colors[isDarkMode ? 'dark' : 'light'];

  const SELECTED_COLOR = '#ccc';
  const SELECTED_BG_COLOR = isDarkMode ? '#232323' : '#f8f8f8';

  return (
    <View style={{flex: 1}}>
      <TouchableOpacity
        ref={buttonRef}
        onPress={openDropdown}
        style={[
          styles.button,
          {
            borderColor: ColorStyle.border,
          },
        ]}>
        <Text
          style={[
            styles.buttonText,
            {color: selected ? ColorStyle.text : ColorStyle.placeholder},
          ]}>
          {selected
            ? options.find(cat => cat.name === selected)?.name
            : placeholderText}
        </Text>
        <Animated.View style={{transform: [{rotate}]}}>
          <Icon
            name="keyboard-arrow-down"
            size={22}
            color={ColorStyle.placeholder}
          />
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
                    top: dropdownPosition.y,
                    left: dropdownPosition.x,
                    width: dropdownPosition.width,
                    backgroundColor: ColorStyle.background,
                    borderColor: ColorStyle.border,
                  },
                ]}>
                <FlatList
                  data={options}
                  keyExtractor={item => item.name}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.item,
                        {borderBottomColor: ColorStyle.border},
                        selected === item.name && {
                          backgroundColor: SELECTED_BG_COLOR,
                        },
                      ]}
                      onPress={() => {
                        onSelect(item.name);
                        setVisible(false);
                      }}>
                      <Text
                        style={[
                          styles.itemText,
                          {
                            color: ColorStyle.text,
                          },
                          selected === item.name && {
                            fontWeight: 'bold',
                            color: SELECTED_COLOR,
                          },
                        ]}>
                        {item.name}
                      </Text>
                      {selected === item.name && (
                        <Icon name="check" size={20} color={SELECTED_COLOR} />
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
  },
  buttonText: {
    flex: 1,
    textAlignVertical: 'center',
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownContainer: {
    maxHeight: 300,
    minWidth: 100,
    borderRadius: 10,
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
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
