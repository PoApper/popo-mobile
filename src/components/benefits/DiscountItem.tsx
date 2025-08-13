import React, {useState} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';

export type BenefitDiscountItem = {
  id: string;
  title: string;
  region: string;
  open_hour: string;
  phone: string;
  content: string;
  updatedAt: string;
};

type Props = {
  item: BenefitDiscountItem;
};

const DiscountItem: React.FC<Props> = ({item}) => {
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
          {item.content}
        </Text>
        {expanded && (
          <View style={styles.detailsContainer}>
            <View style={styles.infoContainer}>
              <Text style={[styles.infoLabel, {color: subTextColor}]}>
                📍 지역:
              </Text>
              <Text style={[styles.infoText, {color: textColor}]}>
                {item.region}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.infoLabel, {color: subTextColor}]}>
                🕒 영업시간:
              </Text>
              <Text style={[styles.infoText, {color: textColor}]}>
                {item.open_hour}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.infoLabel, {color: subTextColor}]}>
                📞 연락처:
              </Text>
              <Text style={[styles.infoText, {color: textColor}]}>
                {item.phone}
              </Text>
            </View>
          </View>
        )}
        <Text style={[styles.expandIndicator, {color: subTextColor}]}>
          {expanded ? '접기 ▲' : '상세정보 보기 ▼'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default DiscountItem;

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
});
