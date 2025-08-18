import {useState} from 'react';
import {
  TouchableOpacity,
  Text,
  useColorScheme,
  View,
  StyleSheet,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';

type RoomFilterDatePickerProps = {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
};

const RoomFilterDatePicker = ({
  selectedDate,
  onDateChange,
}: RoomFilterDatePickerProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const dropdownStyle = [
    styles.button,
    {
      backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
      borderColor: isDarkMode ? '#2C2C2C' : '#E5E7EB',
    },
    selectedDate
      ? {
          backgroundColor: isDarkMode ? '#2C2C2C' : '#F3F4F6',
        }
      : {},
  ];

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity
          style={dropdownStyle}
          onPress={() => setDatePickerVisible(true)}
          activeOpacity={0.8}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: textColor}}>
              {selectedDate
                ? moment(selectedDate).format('YYYY-MM-DD')
                : '날짜'}
            </Text>
            {selectedDate && (
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  onDateChange(null as any);
                }}
                style={{marginLeft: 8}}
                activeOpacity={0.6}>
                <Icon name="close" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={date => {
          onDateChange(date);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
        minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
        maximumDate={new Date(new Date().setDate(new Date().getDate() + 30))}
        locale="ko-KR"
        confirmTextIOS="확인"
        cancelTextIOS="취소"
      />
    </View>
  );
};

export default RoomFilterDatePicker;

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
});
