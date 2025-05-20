import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import api from '../utils/api';

type BenefitsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Benefits'>;
};

interface BenefitAffiliateItem {
  id: string;
  title: string;
  content_short: string;
  content: string;
  updatedAt: string;
}

interface BenefitDiscountItem {
  id: string;
  title: string;
  region: string;
  open_hour: string;
  phone: string;
  content: string;
  updatedAt: string;
}

const benefitTypes = ['제휴 업체', '할인 업체'];
const sortTypes = ['등록순', '가나다순'];

const BenefitsScreen: React.FC<BenefitsScreenProps> = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedType, setSelectedType] = useState('제휴 업체');
  const [sortType, setSortType] = useState('등록순');
  const [textWidths, setTextWidths] = useState<{[key: string]: number}>({});
  // const [isLoading, setIsLoading] = useState(true);
  const [officialBenefits, setOfficialBenefits] = useState<
    BenefitAffiliateItem[]
  >([]);
  const [discountBenefits, setDiscountBenefits] = useState<
    BenefitDiscountItem[]
  >([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getSortedBenefits = (
    benefits: BenefitAffiliateItem[] | BenefitDiscountItem[],
  ) => {
    if (sortType === '가나다순') {
      return [...benefits].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      return [...benefits].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
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
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

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
        <Text style={[styles.headerTitle, {color: textColor}]}>
          총학 제휴업체
        </Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeNav}>
        {benefitTypes.map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type)}
            style={styles.typeTabWrapper}>
            <View style={styles.typeTabInner}>
              <View style={styles.textWithUnderline}>
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
                  {type}
                </Text>
                {selectedType === type && (
                  <View
                    style={[
                      styles.underline,
                      {
                        width: (textWidths[type] || 0) + 8,
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
          flexGrow: 1,
        }}>
        {selectedType === '제휴 업체'
          ? getSortedBenefits(officialBenefits).map(item => {
              const affiliateItem = item as BenefitAffiliateItem;
              return (
                <TouchableOpacity
                  key={affiliateItem.id}
                  style={[
                    styles.itemContainer,
                    {backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'},
                  ]}
                  onPress={() => toggleExpand(affiliateItem.id)}>
                  <View style={styles.textContainer}>
                    <Text style={[styles.itemTitle, {color: textColor}]}>
                      {affiliateItem.title}
                    </Text>
                    <Text
                      style={[
                        styles.itemDescription,
                        {color: isDarkMode ? '#888' : '#666'},
                      ]}>
                      {expandedItems.has(affiliateItem.id)
                        ? affiliateItem.content
                        : affiliateItem.content_short}
                    </Text>
                    <Text
                      style={[
                        styles.expandIndicator,
                        {color: isDarkMode ? '#888' : '#666'},
                      ]}>
                      {expandedItems.has(affiliateItem.id)
                        ? '접기 ▲'
                        : '더보기 ▼'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          : getSortedBenefits(discountBenefits).map(item => {
              const discountItem = item as BenefitDiscountItem;
              return (
                <TouchableOpacity
                  key={discountItem.id}
                  style={[
                    styles.itemContainer,
                    {backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'},
                  ]}
                  onPress={() => toggleExpand(discountItem.id)}>
                  <View style={styles.textContainer}>
                    <Text style={[styles.itemTitle, {color: textColor}]}>
                      {discountItem.title}
                    </Text>
                    <Text
                      style={[
                        styles.itemDescription,
                        {color: isDarkMode ? '#888' : '#666'},
                      ]}>
                      {discountItem.content}
                    </Text>
                    {expandedItems.has(discountItem.id) && (
                      <View style={styles.detailsContainer}>
                        <View style={styles.infoContainer}>
                          <Text
                            style={[
                              styles.infoLabel,
                              {color: isDarkMode ? '#888' : '#666'},
                            ]}>
                            📍 지역:
                          </Text>
                          <Text style={[styles.infoText, {color: textColor}]}>
                            {discountItem.region}
                          </Text>
                        </View>
                        <View style={styles.infoContainer}>
                          <Text
                            style={[
                              styles.infoLabel,
                              {color: isDarkMode ? '#888' : '#666'},
                            ]}>
                            🕒 영업시간:
                          </Text>
                          <Text style={[styles.infoText, {color: textColor}]}>
                            {discountItem.open_hour}
                          </Text>
                        </View>
                        <View style={styles.infoContainer}>
                          <Text
                            style={[
                              styles.infoLabel,
                              {color: isDarkMode ? '#888' : '#666'},
                            ]}>
                            📞 연락처:
                          </Text>
                          <Text style={[styles.infoText, {color: textColor}]}>
                            {discountItem.phone}
                          </Text>
                        </View>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.expandIndicator,
                        {color: isDarkMode ? '#888' : '#666'},
                      ]}>
                      {expandedItems.has(discountItem.id)
                        ? '접기 ▲'
                        : '상세정보 보기 ▼'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
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
});

export default BenefitsScreen;
