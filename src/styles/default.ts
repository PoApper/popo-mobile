import {StyleSheet} from 'react-native';

export const backgroundColor = (isDarkMode: boolean) =>
  isDarkMode ? '#121212' : '#fff';
export const textColor = (isDarkMode: boolean) =>
  isDarkMode ? '#FFFFFF' : '#000000';
export const borderColor = (isDarkMode: boolean) =>
  isDarkMode ? '#2C2C2C' : '#E5E7EB';

export const common = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
  },
  placeholderButton: {
    width: 40,
  },
});
