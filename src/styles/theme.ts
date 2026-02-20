import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';

export interface ThemePalette {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
  };
  border: {
    primary: string;
    secondary: string;
  };
  input: {
    background: string;
    placeholder: string;
    border: string;
  };
  button: {
    primaryBg: string;
    primaryText: string;
    secondaryBg: string;
    secondaryText: string;
    disabledBg: string;
  };
  status: {
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  separator: string;
  overlay: string;
}

export interface Theme {
  isDarkMode: boolean;
  colors: ThemePalette;
}

export const lightPalette: ThemePalette = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F6F7F9',
    tertiary: '#F3F4F6',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#000000',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#3b82f6',
  },
  border: {
    primary: '#E5E7EB',
    secondary: '#D0D0D0',
  },
  input: {
    background: '#FFFFFF',
    placeholder: '#9CA3AF',
    border: '#D0D0D0',
  },
  button: {
    primaryBg: '#0B0B0B',
    primaryText: '#FFFFFF',
    secondaryBg: '#f2f3f5',
    secondaryText: '#262626',
    disabledBg: '#9BA3AF',
  },
  status: {
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3b82f6',
  },
  separator: '#E5E7EB',
  overlay: 'rgba(0,0,0,0.5)',
};

export const darkPalette: ThemePalette = {
  background: {
    primary: '#121212',
    secondary: '#1E1E1E',
    tertiary: '#2C2C2C',
    elevated: '#1F2937',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#BBBBBB',
    tertiary: '#AAAAAA',
    inverse: '#000000',
    link: '#60A5FA',
  },
  border: {
    primary: '#2C2C2C',
    secondary: '#333333',
  },
  input: {
    background: '#1E1E1E',
    placeholder: '#757575',
    border: '#333333',
  },
  button: {
    primaryBg: '#FFFFFF',
    primaryText: '#000000',
    secondaryBg: '#2A2A2A',
    secondaryText: '#E0E0E0',
    disabledBg: '#555555',
  },
  status: {
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3b82f6',
  },
  separator: '#2C2C2C',
  overlay: 'rgba(0,0,0,0.5)',
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const colorScheme = useColorScheme();
  const theme = useMemo<Theme>(() => {
    const isDarkMode = colorScheme === 'dark';
    return {
      isDarkMode,
      colors: isDarkMode ? darkPalette : lightPalette,
    };
  }, [colorScheme]);

  return React.createElement(ThemeContext.Provider, {value: theme}, children);
};

export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};
