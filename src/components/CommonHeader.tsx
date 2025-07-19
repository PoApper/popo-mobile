import React from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {MainTabParamList, RootStackParamList} from '@navigation/types';

type CommonHeaderProps = {
  navigation: NativeStackNavigationProp<
    any | MainTabParamList | RootStackParamList,
    any | keyof MainTabParamList | keyof RootStackParamList
  >;
  title: string;
  isBackHome?: boolean;
  noBackButton?: boolean;
};

const CommonHeader = ({
  navigation,
  title,
  isBackHome = false,
  noBackButton = false,
}: CommonHeaderProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

  return (
    <View style={[styles.header, {borderBottomColor: borderColor}]}>
      {noBackButton ? (
        <View style={styles.placeholderButton} />
      ) : (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isBackHome) {
              navigation.navigate('Main');
            } else {
              navigation.goBack();
            }
          }}>
          <Text style={[styles.backButtonText, {color: textColor}]}>뒤로</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.headerTitle, {color: textColor}]}>{title}</Text>
      <View style={styles.placeholderButton} />
    </View>
  );
};

export default CommonHeader;

const styles = StyleSheet.create({
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
