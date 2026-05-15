import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type StudentAssociationItemType = {
  uuid: string;
  name: string;
  shortDesc: string;
  content: string;
  location: string;
  representative: string;
  office: string;
  contact: string;
  imageUrl?: string;
  views: number;
  homepageUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
};

type Props = {
  item: StudentAssociationItemType;
  onPress: () => void;
};

const StudentAssociationItem: React.FC<Props> = ({item, onPress}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const hasImage =
    item.imageUrl && item.imageUrl !== 'null' && item.imageUrl.trim() !== '';

  return (
    <TouchableOpacity
      style={[styles.card, {backgroundColor: isDarkMode ? '#1A1A1A' : '#fff'}]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{uri: item.imageUrl}}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon
                name="groups"
                size={40}
                color={isDarkMode ? '#555' : '#ccc'}
              />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, {color: textColor}]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text
            style={[styles.description, {color: isDarkMode ? '#888' : '#666'}]}
            numberOfLines={2}>
            {item.shortDesc}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StudentAssociationItem;

const styles = StyleSheet.create({
  card: {
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
  image: {
    padding: 10,
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
