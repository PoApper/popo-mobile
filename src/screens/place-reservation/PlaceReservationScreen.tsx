import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import LazyImage from '@components/LazyImage';
import CommonHeader from '@components/CommonHeader';

type PlaceReservationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlaceReservation'>;
};

const buildings = [
  {region: 'STUDENT_HALL', labelKey: 'studentHall'},
  {region: 'JIGOK_CENTER', labelKey: 'jigok'},
  {region: 'COMMUNITY_CENTER', labelKey: 'communityCenter'},
  {region: 'RESIDENTIAL_COLLEGE', labelKey: 'rc'},
  {region: 'OTHERS', labelKey: 'others'},
] as const;

const sortTypes = ['sortAlphabetic', 'sortPopular'] as const;
type SortType = (typeof sortTypes)[number];

type Location = {
  id: string;
  name: string;
  description: string;
  image: any;
  totalReservationCount: number;
};

const PlaceReservationScreen = ({navigation}: PlaceReservationScreenProps) => {
  const {t} = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedRegion, setSelectedRegion] = useState<string>(
    buildings[0].region,
  );
  const [textWidths, setTextWidths] = useState<{[key: string]: number}>({});
  const [sortType, setSortType] = useState<SortType>('sortAlphabetic');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const backgroundSecondary = isDarkMode ? '#2C2C2C' : '#F3F3F3';

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/place/region/${selectedRegion}`);
        const formattedLocations = response.data.map((place: any) => ({
          id: place.uuid,
          name: place.name,
          description: place.location,
          image: {uri: place.imageUrl},
          totalReservationCount: place.totalReservationCount,
        }));
        setLocations(formattedLocations);
      } catch (error) {
        console.error('장소 정보를 불러오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [selectedRegion]);

  const sortedLocations = [...locations].sort((a, b) => {
    if (sortType === 'sortAlphabetic') {
      return a.name.localeCompare(b.name);
    } else {
      return b.totalReservationCount - a.totalReservationCount;
    }
  });

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <CommonHeader
        navigation={navigation}
        title={t('reservation.place.title')}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.buildingNav}
        contentContainerStyle={styles.typeNavContentContainer}>
        {buildings.map(({region, labelKey}) => (
          <TouchableOpacity
            key={region}
            onPress={() => setSelectedRegion(region)}
            style={styles.buildingTabWrapper}>
            <View
              style={{alignItems: 'center'}}
              onLayout={e => {
                const width = e.nativeEvent.layout.width;
                if (textWidths[region] !== width) {
                  setTextWidths(prev => ({...prev, [region]: width}));
                }
              }}>
              <Text
                style={[
                  styles.buildingTab,
                  {color: isDarkMode ? '#888' : '#999'},
                  selectedRegion === region && [
                    styles.selectedBuildingText,
                    {color: textColor},
                  ],
                ]}>
                {t(`reservation.place.regions.${labelKey}`)}
              </Text>
              <View
                style={[
                  styles.underline,
                  {
                    width: textWidths[region],
                    backgroundColor:
                      selectedRegion === region ? textColor : 'transparent',
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 정렬 버튼 */}
      <View style={styles.sortButtons}>
        {sortTypes.map(type => (
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
              {t(`reservation.place.${type}`)}
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
              <LazyImage
                uri={item.image.uri}
                style={styles.locationImage}
                fallbackSource={require('../../../assets/icon/POPO_typography_bg_removed_cropped.png')}
              />
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
                  {t('reservation.reserve')}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buildingNav: {
    paddingVertical: 8,
    minHeight: 48,
    flexGrow: 0,
  },
  typeNavContentContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  selectedBuilding: {
    color: '#000',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  buildingTabWrapper: {
    paddingVertical: 8,
    height: 30,
    justifyContent: 'center',
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
    paddingHorizontal: 4,
  },
  selectedBuildingText: {
    color: '#000',
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  activeSort: {
    borderColor: '#000',
  },
  sortButtonText: {
    fontSize: 14,
  },
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
