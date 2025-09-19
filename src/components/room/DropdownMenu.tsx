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
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {colors} from '@styles/default';

interface Option {
  name: string;
}

interface DropdownMenuProps {
  placeholderText: string;
  options: Option[];
  selected: string;
  onSelect: (selectedOption: string) => void;
  onCustomModeChange: (isCustom: boolean) => void;
}

const CUSTOM_INPUT_ITEM = {name: '직접 입력'};

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  placeholderText,
  options,
  selected,
  onSelect,
  onCustomModeChange,
}: DropdownMenuProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [visible, setVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] =
    useState<LayoutRectangle | null>(null);
  const buttonRef = useRef<View>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [customMode, setCustomMode] = useState(false);
  const inputRef = useRef<TextInput>(null);

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
    if (customMode) return; // 입력 모드에서는 드롭다운 비활성화
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

  const listData = [...options, CUSTOM_INPUT_ITEM];

  return (
    <View style={{flex: 1}}>
      {customMode ? (
        <View
          style={[
            styles.button,
            {borderColor: ColorStyle.border, paddingVertical: 4},
          ]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, {color: ColorStyle.text}]}
            placeholder={placeholderText}
            placeholderTextColor={ColorStyle.placeholder}
            value={selected}
            onChangeText={txt => {
              if (txt && txt.trim().length > 0) {
                onSelect(txt);
              } else {
                // 입력 비워지면 입력 모드 종료 + 드롭다운 트리거 복귀
                setCustomMode(false);
                onCustomModeChange(false);
                onSelect('');
              }
            }}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (!selected || selected.trim().length === 0) {
                setCustomMode(false);
                onCustomModeChange(false);
              }
            }}
          />
          <View style={styles.iconSlot}>
            {!!selected && (
              <TouchableOpacity
                onPress={() => {
                  setCustomMode(false);
                  onCustomModeChange(false);
                  onSelect('');
                }}
                style={styles.iconTouch}>
                <Icon name="close" size={22} color={ColorStyle.placeholder} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
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
              ? options.find(cat => cat.name === selected)?.name || selected
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
      )}

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
                  data={listData}
                  keyExtractor={item => item.name}
                  renderItem={({item, index}) => (
                    <TouchableOpacity
                      style={[
                        styles.item,
                        {
                          borderBottomColor: ColorStyle.border,
                          borderBottomWidth:
                            index < listData.length - 1 ? 1 : 0,
                        },
                        selected === item.name && {
                          backgroundColor: SELECTED_BG_COLOR,
                        },
                      ]}
                      onPress={() => {
                        if (item.name === CUSTOM_INPUT_ITEM.name) {
                          // clear previous text and switch to input mode
                          onSelect('');
                          setVisible(false);
                          setCustomMode(true);
                          onCustomModeChange(true);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        } else {
                          onSelect(item.name);
                          onCustomModeChange(false);
                          setVisible(false);
                        }
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
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 0,
    paddingLeft: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownContainer: {
    maxHeight: 300,
    minWidth: 100,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
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
    borderBottomWidth: 0,
  },
  itemText: {
    fontSize: 15,
  },
  iconSlot: {
    width: 22, // match arrow icon size width footprint
    alignItems: 'flex-end',
  },
  iconTouch: {
    paddingRight: 0,
  },
});

export default DropdownMenu;
