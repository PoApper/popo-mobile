import {StyleSheet} from 'react-native';
import {lightPalette, darkPalette} from './theme';

/** @deprecated Use `useTheme().colors.background.primary` instead */
export const backgroundColor = (isDarkMode: boolean) =>
  isDarkMode ? darkPalette.background.primary : lightPalette.background.primary;

/** @deprecated Use `useTheme().colors.text.primary` instead */
export const textColor = (isDarkMode: boolean) =>
  isDarkMode ? darkPalette.text.primary : lightPalette.text.primary;

/** @deprecated Use `useTheme().colors.border.primary` instead */
export const borderColor = (isDarkMode: boolean) =>
  isDarkMode ? darkPalette.border.primary : lightPalette.border.primary;

/** @deprecated Use `useTheme().colors` instead */
export const colors = {
  dark: {
    background: darkPalette.background.primary,
    text: darkPalette.text.primary,
    placeholder: darkPalette.input.placeholder,
    border: darkPalette.border.primary,
  },
  light: {
    background: lightPalette.background.primary,
    text: lightPalette.text.primary,
    placeholder: lightPalette.input.placeholder,
    border: lightPalette.border.primary,
  },
};

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
