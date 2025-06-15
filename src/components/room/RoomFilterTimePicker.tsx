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

type RoomFilterHourPickerProps = {
  selectedHour: Date | null;
  onHourChange: (Hour: Date) => void;
};

const RoomFilterHourPicker = ({
  selectedHour,
  onHourChange,
}: RoomFilterHourPickerProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isHourPickerVisible, setHourPickerVisible] = useState(false);

  const dropdownStyle = [
    styles.button,
    {
      borderColor: isDarkMode ? '#2C2C2C' : '#f4f4f6',
      backgroundColor: isDarkMode ? '#1A1A1A' : 'white',
    },
    selectedHour
      ? {
          backgroundColor: '#0000001A',
        }
      : {},
  ];

  const handleHourConfirm = (date: Date) => {
    onHourChange(date);
  };

  return (
    <View>
      <TouchableOpacity
        style={dropdownStyle}
        onPress={() => setHourPickerVisible(true)}>
        <Text>
          {selectedHour ? moment(selectedHour).format('YYYY-MM-DD') : '시간'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isHourPickerVisible}
        mode="time"
        onConfirm={handleHourConfirm}
        onCancel={() => setHourPickerVisible(false)}
        minimumDate={new Date(new Date().setMinutes(0, 0, 0))}
        maximumDate={new Date(new Date().setHours(23, 59, 59, 999))}
        locale="ko-KR"
        is24Hour={true}
        minuteInterval={60}
        confirmTextIOS="확인"
        cancelTextIOS="취소"
      />
    </View>
  );
};

export default RoomFilterHourPicker;

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
