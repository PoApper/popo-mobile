import React, {useEffect, useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import api from '../utils/api';

type AssociationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Association'>;
};

interface AssociationItem {
  uuid: string;
  name: string;
  content: string;
  location: string;
  representative: string;
  contact: string;
  image_url: string;
  views: number;
  homepage_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
}

const sortTypes = ['가나다순', '조회순'];

const AssociationScreen: React.FC<AssociationScreenProps> = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [sortType, setSortType] = useState('가나다순');
  const [isLoading, setIsLoading] = useState(true);
  const [associations, setAssociations] = useState<AssociationItem[]>([]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

  const getSortedAssociations = (items: AssociationItem[]) => {
    if (sortType === '가나다순') {
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [...items].sort((a, b) => b.views - a.views);
    }
  };

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const response = await api.get<AssociationItem[]>(
          '/introduce/association',
        );
        setAssociations(response.data);
      } catch (error) {
        console.error('자치단체 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssociations();
  }, []);

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
        <Text style={[styles.headerTitle, {color: textColor}]}>자치단체</Text>
        <View style={styles.placeholderButton} />
      </View>

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
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 20,
        }}>
        {isLoading ? (
          <View
            style={[
              styles.contentContainer,
              {backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'},
            ]}>
            <Text style={[styles.tempText, {color: textColor}]}>로딩중...</Text>
          </View>
        ) : associations.length === 0 ? (
          <View
            style={[
              styles.contentContainer,
              {backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'},
            ]}>
            <Text style={[styles.tempText, {color: textColor}]}>
              등록된 자치단체가 없습니다.
            </Text>
          </View>
        ) : (
          getSortedAssociations(associations).map(association => (
            <TouchableOpacity
              key={association.uuid}
              style={[
                styles.associationCard,
                {backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'},
              ]}
              onPress={() =>
                navigation.navigate('AssociationDetail', {
                  associationId: association.uuid,
                  associationName: association.name,
                })
              }>
              <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{uri: association.image_url}}
                    style={styles.associationImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.associationInfo}>
                  <Text
                    style={[styles.associationName, {color: textColor}]}
                    numberOfLines={1}>
                    {association.name}
                  </Text>
                  <Text
                    style={[
                      styles.associationDescription,
                      {color: isDarkMode ? '#888' : '#666'},
                    ]}
                    numberOfLines={2}>
                    {association.content}
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
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginVertical: 10,
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
  contentContainer: {
    padding: 16,
    borderRadius: 12,
  },
  tempText: {
    fontSize: 16,
    textAlign: 'center',
  },
  associationCard: {
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
  associationImage: {
    padding: 10,
    width: '100%',
    height: '100%',
  },
  associationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  associationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  associationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AssociationScreen;
