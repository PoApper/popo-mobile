import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type LandingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Landing'>;
};

const LandingScreen = ({ navigation }: LandingScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const backgroundStyle = {
    backgroundColor: '#ffffff',
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle='light-content'
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        <Image
          source={require('../../assets/popo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  logoImage: {
    width: 500,
    height: 100,
  }
});

export default LandingScreen;