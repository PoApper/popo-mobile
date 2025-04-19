import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, StatusBar, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ClubType } from '../types/club';
import api from '../utils/api';

type ClubScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Club'>;
};

const clubCategories = [
  ClubType.performance1,
  ClubType.performance2,
  ClubType.sports,
  ClubType.hobbyAndExhibition,
  ClubType.study,
  ClubType.societyAndReligion,
];

const clubCategoryMap = {
  "performance1": "공연1",
  "performance2": "공연2",
  "sports": "체육",
  "hobbyAndExhibition": "취미전시",
  "study": "학술",
  "societyAndReligion": "사회종교",
}

const sortTypes = ["가나다순", "조회순"];

interface ClubItem {
  uuid: string;
  name: string;
  short_desc: string;
  content: string;
  location: string;
  representative: string;
  contact: string;
  clubType: ClubType;
  image_url: string;
  views: number;
  homepage_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
}

const ClubScreen: React.FC<ClubScreenProps> = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedCategory, setSelectedCategory] = useState<ClubType>(ClubType.performance1);
  const [textWidths, setTextWidths] = useState<{ [key: string]: number }>({});
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [sortType, setSortType] = useState("가나다순");
  const [isLoading, setIsLoading] = useState(true);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

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
    if (sortType === "가나다순") {
      return [...clubs].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [...clubs].sort((a, b) => b.views - a.views);
    }
  };

  const filteredClubs = getSortedClubs(clubs).filter(
    (club) => clubCategoryMap[club.clubType] === selectedCategory
  );

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
        <Text style={[styles.headerTitle, { color: textColor }]}>동아리</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeNav}>
        {clubCategories.map((category) => (
          <View
            key={category}
            style={styles.typeTabWrapper}
          >
            <View style={styles.typeTabInner}>
              <View style={styles.textWithUnderline}>
                <Text
                  style={[
                    styles.typeTab,
                    { color: isDarkMode ? '#888' : '#999' },
                    selectedCategory === category && [
                      styles.selectedTypeText,
                      { color: textColor }
                    ],
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  onLayout={(e) => {
                    const width = e.nativeEvent.layout.width;
                    setTextWidths((prev) => ({ ...prev, [category]: width }));
                  }}
                >
                  {category}
                </Text>
                {selectedCategory === category && (
                  <View
                    style={[
                      styles.underline,
                      { width: (textWidths[category] || 0) + 8, backgroundColor: textColor },
                    ]}
                  />
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sortButtons}>
        {sortTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.sortButton,
              { borderColor: isDarkMode ? '#555' : '#ccc' },
              sortType === type && [styles.activeSort, { backgroundColor: textColor }]
            ]}
            onPress={() => setSortType(type)}
          >
            <Text style={[
              styles.sortButtonText,
              { color: textColor },
              sortType === type && { color: isDarkMode ? '#000' : '#fff' }
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {isLoading ? (
          <View style={[styles.contentContainer, { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' }]}>
            <Text style={[styles.tempText, { color: textColor }]}>로딩중...</Text>
          </View>
        ) : filteredClubs.length === 0 ? (
          <View style={[styles.contentContainer, { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' }]}>
            <Text style={[styles.tempText, { color: textColor }]}>등록된 동아리가 없습니다.</Text>
          </View>
        ) : (
          filteredClubs.map((club) => (
            <View
              key={club.uuid}
              style={[styles.clubCard, { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' }]}
            >
              <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: club.image_url }}
                    style={styles.clubImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.clubInfo}>
                  <Text style={[styles.clubName, { color: textColor }]} numberOfLines={1}>
                    {club.name}
                  </Text>
                  <Text
                    style={[styles.clubDescription, { color: isDarkMode ? '#888' : '#666' }]}
                    numberOfLines={2}
                  >
                    {club.short_desc}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
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
    flex: 1,
    textAlign: 'center',
  },
  typeNav: {
    paddingLeft: 16,
    paddingVertical: 8,
    minHeight: 52,
  },
  typeTabWrapper: {
    paddingVertical: 8,
    marginRight: 24,
    height: 36,
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
    elevation: 2,
  },
  tempText: {
    fontSize: 16,
    textAlign: 'center',
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
  sortButtons: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginVertical: 10
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubImage: {
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
