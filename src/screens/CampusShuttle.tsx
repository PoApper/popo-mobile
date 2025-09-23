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
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import CommonHeader from '@components/CommonHeader';

type CampusShuttleScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CampusShuttle'>;
};

const CampusShuttle: React.FC<CampusShuttleScreenProps> = ({navigation}) => {
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
      <CommonHeader navigation={navigation} title="셔틀버스 시간표" />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.scheduleSection}>
            <Text style={[styles.title, {color: textColor}]}>교수 아파트</Text>
            <Text style={[styles.subtitle, {color: textColor}]}>
              Faculty Apartment Area
            </Text>
            <TouchableOpacity onPress={() => setSelectedImage(0)}>
              <Image
                source={require('../../assets/shuttle-faculty-apartment-area.png')}
                style={styles.image1}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.scheduleSection, styles.marginTop]}>
            <Text style={[styles.title, {color: textColor}]}>교내 셔틀</Text>
            <Text style={[styles.subtitle, {color: textColor}]}>
              POSTECH Campus Area
            </Text>
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
              셔틀버스 정류장
            </Text>
            <Text style={[styles.subtitle, {color: textColor}]}>
              Shuttle Bus Stop
            </Text>
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
              주중(월~금)에만 운행
            </Text>
            <Text style={[styles.englishText, {color: textColor}]}>
              Shuttle bus operates only on weekdays
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, {color: textColor}]}>
              휴일 및 주말에는 차량 운행 없음.
            </Text>
            <Text style={[styles.englishText, {color: textColor}]}>
              There is no campus shuttle bus support on holidays and weekends
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, {color: textColor}]}>
              학기중 운행 기간: 2025.02.17(월) ~ 2025.06.05(목)
            </Text>
            <Text style={[styles.englishText, {color: textColor}]}>
              The campus shuttle bus support period: 2025.02.17(Mon) ~
              2025.06.05(Thu)
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, {color: textColor}]}>
              시행일자: 2025.02.17(월)
            </Text>
            <Text style={[styles.englishText, {color: textColor}]}>
              Implementation date: 2025.02.17(Mon)
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, {color: textColor}]}>
              문의처: 054-279-3536 (차량반)
            </Text>
            <Text style={[styles.englishText, {color: textColor}]}>
              Contact: 054-279-3536 (Vehicle Division)
            </Text>
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
