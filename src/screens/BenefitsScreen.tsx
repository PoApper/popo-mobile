import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import CommonHeader from '@components/CommonHeader';
import AffiliateItem, {
  BenefitAffiliateItem,
} from '@components/benefits/AffiliateItem';
import DiscountItem, {
  BenefitDiscountItem,
} from '@components/benefits/DiscountItem';

type BenefitsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Benefits'>;
};

// Types imported from components

const benefitTypes = ['affiliate', 'discount'] as const;
const sortTypes = ['sortRecent', 'sortAlphabetic'] as const;

const BenefitsScreen: React.FC<BenefitsScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedType, setSelectedType] =
    useState<(typeof benefitTypes)[number]>('affiliate');
  const [sortType, setSortType] =
    useState<(typeof sortTypes)[number]>('sortRecent');
  const [textWidths, setTextWidths] = useState<{[key: string]: number}>({});
  // 칩을 누르면 목록을 맨 위로 올린다.
  // 다시 누르면 부드럽게, 다른 칩이면 새 목록을 바로 맨 위부터 보여준다.
  const listRef = useRef<FlatList>(null);
  // const [isLoading, setIsLoading] = useState(true);
  const [officialBenefits, setOfficialBenefits] = useState<
    BenefitAffiliateItem[]
  >([]);
  const [discountBenefits, setDiscountBenefits] = useState<
    BenefitDiscountItem[]
  >([]);
  // Expansion handled within item components now

  const getSortedBenefits = (
    benefits: BenefitAffiliateItem[] | BenefitDiscountItem[],
  ) => {
    if (sortType === 'sortAlphabetic') {
      return [...benefits].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      return [...benefits].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
  };

  const dataForList = useMemo(() => {
    return selectedType === 'affiliate'
      ? getSortedBenefits(officialBenefits)
      : getSortedBenefits(discountBenefits);
  }, [selectedType, officialBenefits, discountBenefits, sortType]);

  const renderItem = ({
    item,
  }: {
    item: BenefitAffiliateItem | BenefitDiscountItem;
  }) => {
    if (selectedType === 'affiliate') {
      return <AffiliateItem item={item as BenefitAffiliateItem} />;
    }
    return <DiscountItem item={item as BenefitDiscountItem} />;
  };

  useEffect(() => {
    const fetchBenefits = async () => {
      // setIsLoading(true);
      try {
        const [affiliateResponse, discountResponse] = await Promise.all([
          api.get<BenefitAffiliateItem[]>('/benefit/affiliate'),
          api.get<BenefitDiscountItem[]>('/benefit/discount'),
        ]);

        setOfficialBenefits(affiliateResponse.data);
        setDiscountBenefits(discountResponse.data);
      } catch (error) {
        console.error('제휴업체 데이터 로드 오류:', error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchBenefits();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title={t('benefits.title')} />

      <View style={styles.typeNav}>
        {benefitTypes.map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => {
              listRef.current?.scrollToOffset({
                offset: 0,
                animated: type === selectedType,
              });
              setSelectedType(type);
            }}
            style={styles.typeTabWrapper}>
            <View style={styles.typeTabInner}>
              <View style={{alignItems: 'center'}}>
                <Text
                  style={[
                    styles.typeTab,
                    {color: isDarkMode ? '#888' : '#999'},
                    selectedType === type && [
                      styles.selectedTypeText,
                      {color: textColor},
                    ],
                  ]}
                  onLayout={e => {
                    const width = e.nativeEvent.layout.width;
                    setTextWidths(prev => ({...prev, [type]: width}));
                  }}>
                  {t(`benefits.types.${type}`)}
                </Text>
                <View
                  style={[
                    styles.underline,
                    {
                      width: (textWidths[type] || 0) + 8,
                      backgroundColor:
                        selectedType === type ? textColor : 'transparent',
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
        style={styles.container}
        contentContainerStyle={{paddingBottom: 20, flexGrow: 1}}
        data={dataForList}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  typeNav: {
    paddingLeft: 16,
    flexDirection: 'row',
    gap: 12,
  },
  typeTabWrapper: {
    paddingVertical: 12,
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
    elevation: 6,
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
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  expandIndicator: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sortButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
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
});

export default BenefitsScreen;
