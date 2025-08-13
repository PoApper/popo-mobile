import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import {
  ClubCategoryKey,
  ClubCategoryValue,
  CLUB_CATEGORIES,
} from '@interfaces/club';
import api from '@utils/api';
import CommonHeader from '@components/CommonHeader';

type ClubScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Club'>;
};

const clubCategories = Object.values(CLUB_CATEGORIES);

const sortTypes = ['가나다순', '조회순'];

interface ClubItem {
  uuid: string;
  name: string;
  short_desc: string;
  content: string;
  location: string;
  representative: string;
  contact: string;
  clubType: ClubCategoryKey;
  image_url: string;
  views: number;
  homepage_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
}

const ClubScreen: React.FC<ClubScreenProps> = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedCategory, setSelectedCategory] = useState<ClubCategoryValue>(
    CLUB_CATEGORIES.performance1,
  );
  const [textWidths, setTextWidths] = useState<{ [key: string]: number }>({});
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [sortType, setSortType] = useState('가나다순');
  const [isLoading, setIsLoading] = useState(true);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await api.get<ClubItem[]>('/introduce/club');
        setClubs(response.data);
      } catch (error) {
        console.error('동아리 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const getSortedClubs = (clubs: ClubItem[]) => {
    if (sortType === '가나다순') {
      return [...clubs].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [...clubs].sort((a, b) => b.views - a.views);
    }
  };

  const filteredClubs = getSortedClubs(clubs).filter(
    club => CLUB_CATEGORIES[club.clubType] === selectedCategory,
  );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title="동아리" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeNav}
        contentContainerStyle={styles.typeNavContentContainer}>
        {clubCategories.map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={styles.typeTabWrapper}>
            <View
              style={{ alignItems: 'center' }}
              onLayout={e => {
                const width = e.nativeEvent.layout.width;
                if (textWidths[category] !== width) {
                  setTextWidths(prev => ({ ...prev, [category]: width }));
                }
              }}>
              <Text
                style={[
                  styles.typeTab,
                  { color: isDarkMode ? '#888' : '#999' },
                  selectedCategory === category && [
                    styles.selectedTypeText,
                    { color: textColor },
                  ],
                ]}>
                {category}
              </Text>
              <View
                style={[
                  styles.underline,
                  {
                    width: textWidths[category],
                    backgroundColor:
                      selectedCategory === category ? textColor : 'transparent',
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortButtons}>
        {sortTypes.map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.sortButton,
              { borderColor: isDarkMode ? '#555' : '#ccc' },
              sortType === type && [
                styles.activeSort,
                { backgroundColor: textColor },
              ],
            ]}
            onPress={() => setSortType(type)}>
            <Text
              style={[
                styles.sortButtonText,
                { color: textColor },
                sortType === type && { color: isDarkMode ? '#000' : '#fff' },
              ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 20,
        }}>
        {isLoading ? (
          <View
            style={[
              styles.contentContainer,
              { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' },
            ]}>
            <Text style={[styles.tempText, { color: textColor }]}>로딩중...</Text>
          </View>
        ) : filteredClubs.length === 0 ? (
          <View
            style={[
              styles.contentContainer,
              { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' },
            ]}>
            <Text style={[styles.tempText, { color: textColor }]}>
              등록된 동아리가 없습니다.
            </Text>
          </View>
        ) : (
          filteredClubs.map(club => (
            <TouchableOpacity
              key={club.uuid}
              style={[
                styles.clubCard,
                { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' },
              ]}
              onPress={() =>
                navigation.navigate('ClubDetail', {
                  clubId: club.uuid,
                  clubName: club.name,
                })
              }>
              <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: club.image_url }}
                    style={styles.clubImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.clubInfo}>
                  <Text
                    style={[styles.clubName, { color: textColor }]}
                    numberOfLines={1}>
                    {club.name}
                  </Text>
                  <Text
                    style={[
                      styles.clubDescription,
                      { color: isDarkMode ? '#888' : '#666' },
                    ]}
                    numberOfLines={2}>
                    {club.short_desc}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  typeNav: {
    paddingVertical: 8,
    minHeight: 48,
  },
  typeNavContentContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  typeTabWrapper: {
    paddingVertical: 8,
    height: 30,
    justifyContent: 'center',
  },
  typeTabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  textWithUnderline: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  typeTab: {
    fontSize: 16,
    color: '#999',
    paddingHorizontal: 4,
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
  contentContainer: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
  tempText: {
    fontSize: 16,
    textAlign: 'center',
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
  clubCard: {
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubImage: {
    padding: 5,
    width: '100%',
    height: '100%',
  },
  clubInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  clubDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  activeSort: {
    borderColor: '#000',
  },
  sortButtonText: {
    fontSize: 14,
  },
});

export default ClubScreen;
