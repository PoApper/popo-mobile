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
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Option {
  id: string;
  name: string;
}

interface DropdownFilterProps {
  placeholderText: string;
  options: Option[];
  selected: string | null;
  onSelect: (selectedOption: string) => void;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  options,
  selected,
  onSelect,
  placeholderText = '필터선택',
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const [visible, setVisible] = useState(false);
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

  return (
    <View>
      {/* buttonRef를 통해 TouchableOpacity 참조 */}
      <TouchableOpacity
        ref={buttonRef}
        onPress={openDropdown}
        style={[
          styles.button,
          {
            backgroundColor: isDarkMode
              ? selected
                ? '#2C2C2C'
                : '#1A1A1A'
              : selected
              ? '#F3F4F6'
              : '#FFFFFF',
            borderColor: isDarkMode ? '#2C2C2C' : '#E5E7EB',
          },
        ]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={[
              styles.buttonText,
              {
                color: isDarkMode ? '#FFFFFF' : '#000000',
              },
              selected ? {fontWeight: 'bold'} : null,
            ]}>
            {selected
              ? selected === '__other__'
                ? '그 외'
                : options.find(cat => cat.id === selected)?.name || selected
              : placeholderText}
          </Text>
          {selected && (
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                onSelect(null as any);
              }}
              style={{marginLeft: 8}}
              activeOpacity={0.6}>
              <Icon name="close" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
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
                    width: 150,
                  },
                ]}>
                <FlatList
                  data={[
                    {id: '', name: '전체보기'},
                    ...options,
                    {id: '__other__', name: '그 외'},
                  ]}
                  keyExtractor={item => item.id || 'all'}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.item,
                        {
                          borderBottomColor: isDarkMode ? '#2C2C2C' : '#E5E7EB',
                        },
                      ]}
                      onPress={() => {
                        onSelect(item.id);
                        setVisible(false);
                      }}>
                      <Text
                        style={[
                          {
                            color: isDarkMode ? '#FFFFFF' : '#000000',
                          },
                          selected === item.id ? {fontWeight: 'bold'} : null,
                        ]}>
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
    borderRadius: 19,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
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
