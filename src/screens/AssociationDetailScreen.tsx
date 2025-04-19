import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import api from '../utils/api';

type AssociationDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AssociationDetail'>;
  route: RouteProp<RootStackParamList, 'AssociationDetail'>;
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

const AssociationDetailScreen: React.FC<AssociationDetailScreenProps> = ({ navigation, route }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [associationData, setAssociationData] = useState<AssociationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { associationId, associationName } = route.params;

  useEffect(() => {
    const fetchAssociationDetail = async () => {
      try {
        const response = await api.get<AssociationItem>(`/introduce/association/${associationId}`);
        setAssociationData(response.data);
      } catch (error) {
        console.error('자치단체 상세 정보 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssociationDetail();
  }, [associationId]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

  const handleLinkPress = async (url: string) => {
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('링크 열기 오류:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={backgroundStyle}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>로딩중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={[styles.headerTitle, { color: textColor }]}>{associationName}</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.container}>
        {associationData && (
          <>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: associationData.image_url }}
                style={styles.associationImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={[styles.associationName, { color: textColor }]}>{associationData.name}</Text>

              <View style={[styles.infoSection, { borderColor }]}>
                <Text style={[styles.content, { color: isDarkMode ? '#888' : '#666' }]}>
                  {associationData.content}
                </Text>
              </View>

              <View style={[styles.infoSection, { borderColor }]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textColor }]}>위치</Text>
                  <Text style={[styles.infoValue, { color: isDarkMode ? '#888' : '#666' }]}>
                    {associationData.location}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textColor }]}>대표자</Text>
                  <Text style={[styles.infoValue, { color: isDarkMode ? '#888' : '#666' }]}>
                    {associationData.representative}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textColor }]}>연락처</Text>
                  <Text style={[styles.infoValue, { color: isDarkMode ? '#888' : '#666' }]}>
                    {associationData.contact}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoSection, { borderColor }]}>
                <View style={styles.socialLinks}>
                  {associationData.homepage_url != "null" && associationData.homepage_url != "" && associationData.homepage_url && (
                    <TouchableOpacity
                      style={[styles.socialButton, { backgroundColor: '#000000' }]}
                      onPress={() => handleLinkPress(associationData.homepage_url)}
                    >
                      <Text style={styles.socialText}>홈페이지</Text>
                    </TouchableOpacity>
                  )}
                  {associationData.facebook_url != "null" && associationData.facebook_url != "" && associationData.facebook_url && (
                    <TouchableOpacity
                      style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                      onPress={() => handleLinkPress(associationData.facebook_url)}
                    >
                      <Text style={styles.socialText}>Facebook</Text>
                    </TouchableOpacity>
                  )}
                  {associationData.instagram_url != "null" && associationData.instagram_url != "" && associationData.instagram_url && (
                    <TouchableOpacity
                      style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                      onPress={() => handleLinkPress(associationData.instagram_url)}
                    >
                      <Text style={styles.socialText}>Instagram</Text>
                    </TouchableOpacity>
                  )}
                  {associationData.youtube_url != "null" && associationData.youtube_url != "" && associationData.youtube_url && (
                    <TouchableOpacity
                      style={[styles.socialButton, { backgroundColor: '#FF0000' }]}
                      onPress={() => handleLinkPress(associationData.youtube_url)}
                    >
                      <Text style={styles.socialText}>YouTube</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  associationImage: {
    padding: 10,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 24,
  },
  associationName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoSection: {
    borderTopWidth: 1,
    paddingVertical: 24,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  socialButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 4,
    minWidth: 100,
  },
  socialText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AssociationDetailScreen;
