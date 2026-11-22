import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import i18next from 'i18next';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import CommonHeader from '@components/CommonHeader';
import {getCurrentLocale} from '@utils/i18n';

// 한국어 화면은 원래처럼 영문을 아래에 함께 적는다. 영어 화면에서는 영문만 보인다.
const tEn = i18next.getFixedT('en');

type CampusShuttleScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CampusShuttle'>;
};

const CampusShuttle: React.FC<CampusShuttleScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const showEnglishLine = getCurrentLocale() === 'ko';
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const images = [
    require('../../assets/shuttle-faculty-apartment-area.png'),
    require('../../assets/shuttle-campus.png'),
    require('../../assets/shuttle-bus-stop.png'),
  ];

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title={t('shuttle.title')} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.scheduleSection}>
            <Text style={[styles.title, {color: textColor}]}>
              {t('shuttle.facultyArea')}
            </Text>
            {showEnglishLine && (
              <Text style={[styles.subtitle, {color: textColor}]}>
                {tEn('shuttle.facultyArea')}
              </Text>
            )}
            <TouchableOpacity onPress={() => setSelectedImage(0)}>
              <Image
                source={require('../../assets/shuttle-faculty-apartment-area.png')}
                style={styles.image1}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.scheduleSection, styles.marginTop]}>
            <Text style={[styles.title, {color: textColor}]}>
              {t('shuttle.campusArea')}
            </Text>
            {showEnglishLine && (
              <Text style={[styles.subtitle, {color: textColor}]}>
                {tEn('shuttle.campusArea')}
              </Text>
            )}
            <TouchableOpacity onPress={() => setSelectedImage(1)}>
              <Image
                source={require('../../assets/shuttle-campus.png')}
                style={styles.image2}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.scheduleSection, styles.marginTop]}>
            <Text style={[styles.title, {color: textColor}]}>
              {t('shuttle.stops')}
            </Text>
            {showEnglishLine && (
              <Text style={[styles.subtitle, {color: textColor}]}>
                {tEn('shuttle.stops')}
              </Text>
            )}
            <TouchableOpacity onPress={() => setSelectedImage(2)}>
              <Image
                source={require('../../assets/shuttle-bus-stop.png')}
                style={styles.image3}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section]}>
          <View style={styles.textContainer}>
            <Text style={[styles.text, {color: textColor}]}>
              {t('shuttle.weekdayOnly')}
            </Text>
            {showEnglishLine && (
              <Text style={[styles.englishText, {color: textColor}]}>
                {tEn('shuttle.weekdayOnly')}
              </Text>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, {color: textColor}]}>
              {t('shuttle.noWeekend')}
            </Text>
            {showEnglishLine && (
              <Text style={[styles.englishText, {color: textColor}]}>
                {tEn('shuttle.noWeekend')}
              </Text>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, {color: textColor}]}>
              {t('shuttle.period')}
            </Text>
            {showEnglishLine && (
              <Text style={[styles.englishText, {color: textColor}]}>
                {tEn('shuttle.period')}
              </Text>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, {color: textColor}]}>
              {t('shuttle.effectiveDate')}
            </Text>
            {showEnglishLine && (
              <Text style={[styles.englishText, {color: textColor}]}>
                {tEn('shuttle.effectiveDate')}
              </Text>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, {color: textColor}]}>
              {t('shuttle.contact')}
            </Text>
            {showEnglishLine && (
              <Text style={[styles.englishText, {color: textColor}]}>
                {tEn('shuttle.contact')}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={selectedImage !== null}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
        statusBarTranslucent={Platform.OS === 'android'}
        hardwareAccelerated>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}>
          <View style={styles.modalContent}>
            {selectedImage !== null && (
              <Image
                source={images[selectedImage]}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  scheduleSection: {
    flexDirection: 'column',
    width: '100%',
  },
  marginTop: {
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  englishText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.5,
  },
  image1: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
  },
  image2: {
    width: '100%',
    height: 360,
    resizeMode: 'contain',
  },
  image3: {
    width: '100%',
    height: 380,
    resizeMode: 'contain',
  },
  textContainer: {
    marginBottom: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
});

export default CampusShuttle;
