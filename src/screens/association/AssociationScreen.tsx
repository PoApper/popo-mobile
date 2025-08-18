import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import CommonHeader from '@components/CommonHeader';
import AssociationItem, {
  AssociationItemType,
} from '@components/association/AssociationItem';

type AssociationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Association'>;
};

// Type moved to component file for reuse

const sortTypes = ['가나다순', '조회순'];

const AssociationScreen: React.FC<AssociationScreenProps> = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [sortType, setSortType] = useState('가나다순');
  const [isLoading, setIsLoading] = useState(true);
  const [associations, setAssociations] = useState<AssociationItemType[]>([]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const getSortedAssociations = (items: AssociationItemType[]) => {
    if (sortType === '가나다순') {
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [...items].sort((a, b) => b.views - a.views);
    }
  };

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const response = await api.get<AssociationItemType[]>(
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

  const renderAssociationItem = ({item}: {item: AssociationItemType}) => {
    return (
      <AssociationItem
        item={item}
        onPress={() =>
          navigation.navigate('AssociationDetail', {
            associationId: item.uuid,
            associationName: item.name,
          })
        }
      />
    );
  };

  const ListEmpty = () => {
    return (
      <View
        style={[
          styles.contentContainer,
          isDarkMode ? styles.cardDark : styles.cardLight,
        ]}>
        <Text style={[styles.tempText, {color: textColor}]}>
          {isLoading ? '로딩중...' : '등록된 자치단체가 없습니다.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title="자치단체" />

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

      <FlatList
        style={styles.container}
        contentContainerStyle={styles.listContent}
        data={getSortedAssociations(associations)}
        keyExtractor={item => item.uuid}
        renderItem={renderAssociationItem}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  sortButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginVertical: 10,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
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
  cardDark: {
    backgroundColor: '#1A1A1A',
  },
  cardLight: {
    backgroundColor: '#fff',
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
