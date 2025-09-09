import React, {useState} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';

export type BenefitAffiliateItem = {
  id: string;
  title: string;
  contentShort: string;
  content: string;
  updatedAt: string;
};

type Props = {
  item: BenefitAffiliateItem;
};

const AffiliateItem: React.FC<Props> = ({item}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const subTextColor = isDarkMode ? '#888' : '#666';

  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        {backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'},
      ]}
      onPress={() => setExpanded(prev => !prev)}
      activeOpacity={0.8}>
      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, {color: textColor}]}>{item.title}</Text>
        <Text style={[styles.itemDescription, {color: subTextColor}]}>
          {expanded ? item.content : item.contentShort}
        </Text>
        <Text style={[styles.expandIndicator, {color: subTextColor}]}>
          {expanded ? '접기 ▲' : '더보기 ▼'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AffiliateItem;

const styles = StyleSheet.create({
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
  expandIndicator: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
});
