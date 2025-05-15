import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import api from '../utils/api';

type PlaceReservationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlaceReservation'>;
};

const buildings = ['학생회관', '지곡회관', '커뮤니티센터', 'RC', '기타'];

type Location = {
  id: string;
  name: string;
  description: string;
  image: any;
  total_reservation_count: number;
};

const buildingToRegion: {[key: string]: string} = {
  학생회관: 'STUDENT_HALL',
  지곡회관: 'JIGOK_CENTER',
  커뮤니티센터: 'COMMUNITY_CENTER',
  RC: 'RESIDENTIAL_COLLEGE',
  기타: 'OTHERS',
};

const PlaceReservationScreen = ({navigation}: PlaceReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedBuilding, setSelectedBuilding] = useState('학생회관');
  const [textWidths, setTextWidths] = useState<{[key: string]: number}>({});
  const [sortType, setSortType] = useState('가나다순');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';
  const backgroundSecondary = isDarkMode ? '#2C2C2C' : '#F3F3F3';

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(
          `/place/region/${buildingToRegion[selectedBuilding]}`,
        );
        const formattedLocations = response.data.map((place: any) => ({
          id: place.uuid,
          name: place.name,
          description: place.location,
          image: {uri: place.image_url},
          total_reservation_count: place.total_reservation_count,
        }));
        setLocations(formattedLocations);
      } catch (error) {
        console.error('장소 정보를 불러오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [selectedBuilding]);

  const sortedLocations = [...locations].sort((a, b) => {
    if (sortType === '가나다순') {
      return a.name.localeCompare(b.name);
    } else {
      return b.total_reservation_count - a.total_reservation_count;
    }
  });

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
        <Text style={[styles.headerTitle, {color: textColor}]}>장소 예약</Text>
        <View style={styles.placeholderButton} />
      </View>

      {/* 건물 선택 네비게이션 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.buildingNav}>
        {buildings.map(building => (
          <TouchableOpacity
            key={building}
            onPress={() => setSelectedBuilding(building)}
            style={styles.buildingTabWrapper}>
            <View style={styles.buildingTabInner}>
              <View style={styles.textWithUnderline}>
                <Text
                  style={[
                    styles.buildingTab,
                    {color: isDarkMode ? '#888' : '#999'},
                    selectedBuilding === building && [
                      styles.selectedBuildingText,
                      {color: textColor},
                    ],
                  ]}
                  onLayout={e => {
                    const width = e.nativeEvent.layout.width;
                    setTextWidths(prev => ({...prev, [building]: width}));
                  }}>
                  {building}
                </Text>

                {selectedBuilding === building && (
                  <View
                    style={[
                      styles.underline,
                      {
                        width: (textWidths[building] || 0) + 8,
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

      {/* 정렬 버튼 */}
      <View style={styles.sortButtons}>
        {['가나다순', '예약 많은 순'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.sortButton,
              {borderColor: isDarkMode ? '#555' : '#ccc'},
              sortType === type && [
                styles.activeSort,
                {backgroundColor: textColor},
              ],
            ]}
            onPress={() => setSortType(type)}>
            <Text
              style={[
                styles.sortButtonText,
                {color: textColor},
                sortType === type && {color: isDarkMode ? '#000' : '#fff'},
              ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 장소 리스트 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      ) : (
        <FlatList
          style={{flex: 1}}
          contentContainerStyle={{
            paddingBottom: 20,
            paddingTop: 0,
            justifyContent: 'flex-start',
          }}
          data={sortedLocations}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View
              style={[
                styles.locationItem,
                {backgroundColor: isDarkMode ? '#121212' : '#fff'},
              ]}>
              <Image source={item.image} style={styles.locationImage} />
              <View style={styles.locationInfo}>
                <Text style={[styles.locationName, {color: textColor}]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.locationDescription,
                    {color: isDarkMode ? '#888' : '#777'},
                  ]}>
                  {item.description}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.reserveButton,
                  {backgroundColor: backgroundSecondary},
                ]}
                onPress={() =>
                  navigation.navigate('PlaceDetailReservation', {
                    placeId: item.id,
                    placeName: item.name,
                  })
                }>
                <Text style={[styles.reserveButtonText, {color: textColor}]}>
                  예약
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
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
  safeArea: {flex: 1, backgroundColor: '#fff'},
  buildingNav: {flexDirection: 'row', paddingHorizontal: 15, marginTop: 20},
  selectedBuilding: {
    color: '#000',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  buildingTabWrapper: {
    alignItems: 'center',
    margin: 2,
  },
  buildingTabInner: {
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  textWithUnderline: {
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  buildingTab: {
    fontSize: 16,
    color: '#999',
    lineHeight: 20,
  },
  selectedBuildingText: {
    color: '#000',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  underline: {
    marginTop: 4,
    height: 2,
    borderRadius: 1,
    alignSelf: 'center',
  },
  sortButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: -580,
    marginBottom: 10,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  activeSort: {borderColor: '#000'},
  sortButtonText: {fontSize: 14},
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  locationImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {fontSize: 16, fontWeight: 'bold', marginBottom: 5},
  locationDescription: {fontSize: 14},
  reserveButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginLeft: 10,
  },
  reserveButtonText: {fontSize: 14, fontWeight: '600'},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlaceReservationScreen;
