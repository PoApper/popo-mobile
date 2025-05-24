import {StyleSheet, TouchableOpacity} from 'react-native';
import {useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const RefreshButton = ({onPress}: {onPress: () => void}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <TouchableOpacity
      style={[
        styles.refreshButton,
        {
          backgroundColor: isDarkMode ? '#2C2C2C' : '#F4F4F6',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Icon
        name="refresh"
        size={18}
        color={isDarkMode ? '#FFFFFF' : '#000000'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  refreshButton: {
    padding: 10,
    borderRadius: 10,
    height: 38,
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
