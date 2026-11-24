import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import CommonHeader from '@components/CommonHeader';

type WhitebookScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Whitebook'>;
};

interface WhitebookItem {
  uuid: string;
  title: string;
  link: string;
  content: string;
  clickCount: number;
}

const sortTypes = ['sortAlphabetic', 'sortViews'] as const;

const WhitebookScreen: React.FC<WhitebookScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';

  // const [isLoading, setIsLoading] = useState(true);
  const [whiteBookItems, setWhiteBookItems] = useState<WhitebookItem[]>([]);
  const [sortType, setSortType] =
    useState<(typeof sortTypes)[number]>('sortViews');
  // 칩을 누르면 목록을 맨 위로 올린다.
  // 다시 누르면 부드럽게, 다른 칩이면 새 목록을 바로 맨 위부터 보여준다.
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchWhitebookItems = async () => {
      // setIsLoading(true);

      try {
        const response = await api.get<WhitebookItem[]>('/whitebook');
        setWhiteBookItems(response.data);
      } catch (error) {
        console.error('Whitebook 데이터 로드 오류:', error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchWhitebookItems();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  if (sortType === 'sortViews') {
    whiteBookItems.sort((a, b) => b.clickCount - a.clickCount);
  } else if (sortType === 'sortAlphabetic') {
    whiteBookItems.sort((a, b) => a.title.localeCompare(b.title));
  }

  const handleLinkPress = async (title: string, link: string) => {
    try {
      const alertTitle = link.includes('cdn.popo.poapper.club')
        ? t('whitebook.popoLinkTitle')
        : link.includes('postech.ac.kr')
        ? t('whitebook.postechLinkTitle')
        : t('whitebook.externalLinkTitle');
      const txt =
        link.includes('cdn.popo.poapper.club') || link.includes('postech.ac.kr')
          ? t('whitebook.linkBody', {target: title})
          : t('whitebook.linkBody', {target: link});
      Alert.alert(alertTitle, txt, [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: () => {
            Linking.openURL(link);
          },
        },
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), t('whitebook.openFailed'), [
        {text: t('common.confirm')},
      ]);
      console.error('링크 오픈 오류:', error);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <CommonHeader navigation={navigation} title={t('whitebook.title')} />

      <View style={styles.descriptionContainer}>
        <Text style={[styles.descriptionText, {color: textColor}]}>
          {t('whitebook.description')}
        </Text>
      </View>

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
            onPress={() => {
              listRef.current?.scrollToOffset({
                offset: 0,
                animated: type === sortType,
              });
              setSortType(type);
            }}>
            <Text
              style={[
                styles.sortButtonText,
                {color: textColor},
                sortType === type && {color: isDarkMode ? '#000' : '#fff'},
              ]}>
              {t(`common.${type}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        ref={listRef}
        showsVerticalScrollIndicator={false}
        data={whiteBookItems}
        keyExtractor={item => item.uuid}
        contentContainerStyle={styles.listContainer}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              {backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'},
            ]}
            onPress={() => {
              // 서버에 저장된 항목 제목과 비교하므로 번역하지 않는다.
              if (item.title === '교내 셔틀버스 시간표') {
                navigation.navigate('CampusShuttle');
              } else {
                handleLinkPress(item.title, item.link);
              }
            }}>
            <View style={styles.textContainer}>
              <Text style={[styles.itemTitle, {color: textColor}]}>
                {item.title}
              </Text>
              <Text
                style={[
                  styles.itemDescription,
                  {color: isDarkMode ? '#888' : '#666'},
                ]}>
                {item.content}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  descriptionContainer: {
    paddingTop: 20,
    paddingBottom: 5,
    paddingHorizontal: 20,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  /* 정렬 버튼 */
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
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
  },
});

export default WhitebookScreen;
