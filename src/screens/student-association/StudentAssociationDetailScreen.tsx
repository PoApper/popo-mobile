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
import Icon from 'react-native-vector-icons/MaterialIcons';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import CommonHeader from '@components/CommonHeader';

type StudentAssociationDetailScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'StudentAssociationDetail'
  >;
  route: RouteProp<RootStackParamList, 'StudentAssociationDetail'>;
};

interface StudentAssociationDetail {
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
}

const StudentAssociationDetailScreen: React.FC<
  StudentAssociationDetailScreenProps
> = ({navigation, route}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [data, setData] = useState<StudentAssociationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {studentAssociationName} = route.params;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get<StudentAssociationDetail>(
          `/introduce/student_association/name/${encodeURIComponent(
            studentAssociationName,
          )}`,
        );
        setData(response.data);
      } catch (error) {
        console.error('학생단체 상세 정보 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [studentAssociationName]);

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

  const isValidUrl = (url?: string) =>
    url && url !== 'null' && url.trim() !== '';

  if (isLoading) {
    return (
      <SafeAreaView style={backgroundStyle}>
        <CommonHeader navigation={navigation} title={studentAssociationName} />
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
      <CommonHeader navigation={navigation} title={studentAssociationName} />

      <ScrollView style={styles.container}>
        {data && (
          <>
            <View style={styles.imageContainer}>
              {data.imageUrl && data.imageUrl.trim() !== '' ? (
                <Image
                  source={{uri: data.imageUrl}}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="groups" size={60} color="#ccc" />
                </View>
              )}
            </View>
            <View style={styles.contentContainer}>
              <Text style={[styles.name, {color: textColor}]}>{data.name}</Text>
              <Text
                style={[
                  styles.shortDesc,
                  {color: isDarkMode ? '#999' : '#666'},
                ]}>
                {data.shortDesc}
              </Text>

              <View style={[styles.infoSection, {borderColor}]}>
                <Text
                  style={[
                    styles.content,
                    {color: isDarkMode ? '#888' : '#666'},
                  ]}>
                  {data.content}
                </Text>
              </View>

              <View style={[styles.infoSection, {borderColor}]}>
                {data.location?.trim() !== '' && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, {color: textColor}]}>
                      사무실 위치
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        {color: isDarkMode ? '#888' : '#666'},
                      ]}>
                      {data.location}
                    </Text>
                  </View>
                )}
                {data.office?.trim() !== '' && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, {color: textColor}]}>
                      협력 행정팀
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        {color: isDarkMode ? '#888' : '#666'},
                      ]}>
                      {data.office}
                    </Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, {color: textColor}]}>
                    대표자
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {color: isDarkMode ? '#888' : '#666'},
                    ]}>
                    {data.representative}
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
                    {data.contact}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoSection, {borderColor}]}>
                <View style={styles.socialLinks}>
                  {isValidUrl(data.homepageUrl) && (
                    <TouchableOpacity
                      style={[
                        styles.socialButton,
                        {backgroundColor: '#000000'},
                      ]}
                      onPress={() => handleLinkPress(data.homepageUrl!)}>
                      <Text style={styles.socialText}>홈페이지</Text>
                    </TouchableOpacity>
                  )}
                  {isValidUrl(data.facebookUrl) && (
                    <TouchableOpacity
                      style={[
                        styles.socialButton,
                        {backgroundColor: '#1877F2'},
                      ]}
                      onPress={() => handleLinkPress(data.facebookUrl!)}>
                      <Text style={styles.socialText}>Facebook</Text>
                    </TouchableOpacity>
                  )}
                  {isValidUrl(data.instagramUrl) && (
                    <TouchableOpacity
                      style={[
                        styles.socialButton,
                        {backgroundColor: '#E4405F'},
                      ]}
                      onPress={() => handleLinkPress(data.instagramUrl!)}>
                      <Text style={styles.socialText}>Instagram</Text>
                    </TouchableOpacity>
                  )}
                  {isValidUrl(data.youtubeUrl) && (
                    <TouchableOpacity
                      style={[
                        styles.socialButton,
                        {backgroundColor: '#FF0000'},
                      ]}
                      onPress={() => handleLinkPress(data.youtubeUrl!)}>
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
  contentContainer: {
    padding: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shortDesc: {
    fontSize: 16,
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
    width: 90,
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

export default StudentAssociationDetailScreen;
