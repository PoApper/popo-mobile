import React, {useEffect, useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

import {RootStackParamList} from '@navigation/types';
import {ClubCategoryKey} from '@interfaces/club';
import api from '@utils/api';
import CommonHeader from '@components/CommonHeader';

type ClubDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ClubDetail'>;
  route: RouteProp<RootStackParamList, 'ClubDetail'>;
};

interface ClubItem {
  uuid: string;
  name: string;
  short_desc: string;
  content: string;
  location: string;
  representative: string;
  contact: string;
  clubType: ClubCategoryKey;
  image_url: string;
  views: number;
  homepage_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
}

const ClubDetailScreen: React.FC<ClubDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [clubData, setClubData] = useState<ClubItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {clubId, clubName} = route.params;

  useEffect(() => {
    const fetchClubDetail = async () => {
      try {
        const response = await api.get<ClubItem>(`/introduce/club/${clubId}`);
        setClubData(response.data);
      } catch (error) {
        console.error('동아리 상세 정보 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubDetail();
  }, [clubId]);

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
          <Text style={[styles.loadingText, {color: textColor}]}>
            로딩중...
          </Text>
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
      <CommonHeader navigation={navigation} title={clubName} />

      <ScrollView style={styles.container}>
        {clubData && (
          <>
            <View style={styles.imageContainer}>
              <Image
                source={{uri: clubData.image_url}}
                style={styles.clubImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={[styles.clubName, {color: textColor}]}>
                {clubData.name}
              </Text>
              <Text
                style={[
                  styles.description,
                  {color: isDarkMode ? '#888' : '#666'},
                ]}>
                {clubData.short_desc}
              </Text>

              <View style={[styles.infoSection, {borderColor}]}>
                <Text
                  style={[
                    styles.content,
                    {color: isDarkMode ? '#888' : '#666'},
                  ]}>
                  {clubData.content}
                </Text>
              </View>

              <View style={[styles.infoSection, {borderColor}]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, {color: textColor}]}>
                    위치
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {color: isDarkMode ? '#888' : '#666'},
                    ]}>
                    {clubData.location}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, {color: textColor}]}>
                    대표자
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {color: isDarkMode ? '#888' : '#666'},
                    ]}>
                    {clubData.representative}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, {color: textColor}]}>
                    연락처
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {color: isDarkMode ? '#888' : '#666'},
                    ]}>
                    {clubData.contact}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoSection, {borderColor}]}>
                <View style={styles.socialLinks}>
                  {clubData.homepage_url != 'null' &&
                    clubData.homepage_url != '' &&
                    clubData.homepage_url && (
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          {backgroundColor: '#000000'},
                        ]}
                        onPress={() => handleLinkPress(clubData.homepage_url)}>
                        <Text style={styles.socialText}>홈페이지</Text>
                      </TouchableOpacity>
                    )}
                  {clubData.facebook_url != 'null' &&
                    clubData.facebook_url != '' &&
                    clubData.facebook_url && (
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          {backgroundColor: '#1877F2'},
                        ]}
                        onPress={() => handleLinkPress(clubData.facebook_url)}>
                        <Text style={styles.socialText}>Facebook</Text>
                      </TouchableOpacity>
                    )}
                  {clubData.instagram_url != 'null' &&
                    clubData.instagram_url != '' &&
                    clubData.instagram_url && (
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          {backgroundColor: '#E4405F'},
                        ]}
                        onPress={() => handleLinkPress(clubData.instagram_url)}>
                        <Text style={styles.socialText}>Instagram</Text>
                      </TouchableOpacity>
                    )}
                  {clubData.youtube_url != 'null' &&
                    clubData.youtube_url != '' &&
                    clubData.youtube_url && (
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          {backgroundColor: '#FF0000'},
                        ]}
                        onPress={() => handleLinkPress(clubData.youtube_url)}>
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
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  clubImage: {
    padding: 10,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 24,
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  infoSection: {
    borderTopWidth: 1,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  socialIcon: {
    width: 100,
    height: 28,
  },
});

export default ClubDetailScreen;
