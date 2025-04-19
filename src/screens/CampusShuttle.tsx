import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type CampusShuttleScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CampusShuttle'>;
};

const CampusShuttle: React.FC<CampusShuttleScreenProps> = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: textColor }]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>셔틀버스 시간표</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.scheduleSection}>
            <Text style={[styles.title, { color: textColor }]}>
              교수 아파트
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
                Faculty Apartment Area
              </Text>
            <Image
              source={require('../../assets/shuttle-faculty-apartment-area.png')}
              style={styles.image1}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.scheduleSection, styles.marginTop]}>
            <Text style={[styles.title, { color: textColor }]}>
              교내 셔틀
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              POSTECH Campus Area
            </Text>
            <Image
              source={require('../../assets/shuttle-campus.png')}
              style={styles.image2}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.scheduleSection, styles.marginTop]}>
            <Text style={[styles.title, { color: textColor }]}>
              셔틀버스 정류장
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              Shuttle Bus Stop
            </Text>
            <Image
              source={require('../../assets/shuttle-bus-stop.png')}
              style={styles.image3}
              resizeMode="contain"
            />
          </View>
        </View>


        <View style={[styles.section]}>
          <View style={styles.textContainer}>
            <Text style={[styles.text, { color: textColor }]}>주중(월~금)에만 운행</Text>
            <Text style={[styles.englishText, { color: textColor }]}>Shuttle bus operates only on weekdays</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, { color: textColor }]}>휴일 및 주말에는 차량 운행 없음.</Text>
            <Text style={[styles.englishText, { color: textColor }]}>There is no campus shuttle bus support on holidays and weekends</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, { color: textColor }]}>학기중 운행 기간: 2025.02.17(월) ~ 2025.06.05(목)</Text>
            <Text style={[styles.englishText, { color: textColor }]}>The campus shuttle bus support period: 2025.02.17(Mon) ~ 2025.06.05(Thu)</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, { color: textColor }]}>시행일자: 2025.02.17(월)</Text>
            <Text style={[styles.englishText, { color: textColor }]}>Implementation date: 2025.02.17(Mon)</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.text, { color: textColor }]}>문의처: 054-279-3536 (차량반)</Text>
            <Text style={[styles.englishText, { color: textColor }]}>Contact: 054-279-3536 (Vehicle Division)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
});

export default CampusShuttle;
