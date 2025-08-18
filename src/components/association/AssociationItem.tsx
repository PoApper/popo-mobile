import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';

export type AssociationItemType = {
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
};

type Props = {
  item: AssociationItemType;
  onPress: () => void;
};

const AssociationItem: React.FC<Props> = ({item, onPress}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  return (
    <TouchableOpacity
      style={[
        styles.associationCard,
        {backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'},
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: item.image_url}}
            style={styles.associationImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.associationInfo}>
          <Text
            style={[styles.associationName, {color: textColor}]}
            numberOfLines={1}>
            {item.name}
          </Text>
          <Text
            style={[
              styles.associationDescription,
              {color: isDarkMode ? '#888' : '#666'},
            ]}
            numberOfLines={2}>
            {item.content}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AssociationItem;

const styles = StyleSheet.create({
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
