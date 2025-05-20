import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import ReservationList from '../components/ReservationList';
import EquipReservationList from '../components/EquipReservationList';

type ReservationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reservation'>;
  route: RouteProp<RootStackParamList, 'Reservation'>;
};

type TabType = 'place' | 'equipment';

const ReservationScreen = ({navigation}: ReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState<TabType>('place');
  const [textWidths, setTextWidths] = useState<{[key: string]: number}>({});

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

  const tabs = [
    {id: 'place' as TabType, label: '장소 예약'},
    {id: 'equipment' as TabType, label: '장비 예약'},
  ];

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, {color: textColor}]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>내 일정</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeNav}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={styles.typeTabWrapper}>
            <View style={styles.typeTabInner}>
              <View style={styles.textWithUnderline}>
                <Text
                  style={[
                    styles.typeTab,
                    {color: isDarkMode ? '#888' : '#999'},
                    activeTab === tab.id && [
                      styles.selectedTypeText,
                      {color: textColor},
                    ],
                  ]}
                  onLayout={e => {
                    const width = e.nativeEvent.layout.width;
                    setTextWidths(prev => ({...prev, [tab.id]: width}));
                  }}>
                  {tab.label}
                </Text>
                {activeTab === tab.id && (
                  <View
                    style={[
                      styles.underline,
                      {
                        width: (textWidths[tab.id] || 0) + 8,
                        backgroundColor: textColor,
                      },
                    ]}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === 'place' ? (
        <ReservationList navigation={navigation} />
      ) : (
        <EquipReservationList navigation={navigation} />
      )}
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
  typeNav: {
    paddingLeft: 16,
  },
  typeTabWrapper: {
    paddingVertical: 12,
    marginRight: 24,
  },
  typeTabInner: {
    alignItems: 'center',
  },
  textWithUnderline: {
    alignItems: 'center',
  },
  typeTab: {
    fontSize: 16,
    color: '#999',
  },
  selectedTypeText: {
    color: '#000',
    fontWeight: 'bold',
  },
  underline: {
    marginTop: 4,
    height: 2,
    borderRadius: 1,
  },
});

export default ReservationScreen;
