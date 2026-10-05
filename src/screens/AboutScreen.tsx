import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  StatusBar,
  Linking,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, {Path} from 'react-native-svg';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import CommonHeader from '@components/CommonHeader';
import DeviceInfo from 'react-native-device-info';

const GitHubIcon = ({
  size = 20,
  color = '#000000',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </Svg>
);

type AboutScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'About'>;
};

const AboutScreen = ({navigation}: AboutScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';
  const appVersion: string = DeviceInfo.getVersion();
  const buildNumber: string = DeviceInfo.getBuildNumber();

  const openLink = async (url?: string) => {
    if (!url) {
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      // no-op
    }
  };

  const appRepo = 'https://github.com/PoApper/popo-mobile';
  const backendRepo1 = 'https://github.com/PoApper/paxi-popo-nest-api';
  const backendRepo2 = 'https://github.com/PoApper/popo-nest-api';

  const appContributors = ['@BlueHorn07', '@nyeoglya', '@jjungnii'];
  const backendContributors: Array<{handle: string; isLead?: boolean}> = [
    {handle: '@khkim6040', isLead: true},
    {handle: '@hegelty'},
  ];
  const designContributors = ['@moonsoyul', '@kyuminism'];

  const getGithubUrl = (handle: string) => {
    const id = handle.replace(/^@/, '');
    return `https://github.com/${id}`;
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title="앱 정보 · 만든 사람들" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{padding: 16}}>
        <View
          style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <Text style={[styles.title, {color: textColor}]}>POPO</Text>
          <Text
            style={[
              styles.subtitle,
              {color: isDarkMode ? '#AAAAAA' : '#6B7280'},
            ]}>
            포스텍 구성원을 위한 서비스 허브
          </Text>
        </View>

        <View
          style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>
            버전 정보
          </Text>
          <Text style={{color: isDarkMode ? '#BBBBBB' : '#6B7280'}}>
            앱 버전: {appVersion}
          </Text>
          <Text style={{color: isDarkMode ? '#BBBBBB' : '#6B7280'}}>
            빌드 번호: {buildNumber}
          </Text>
        </View>

        {/* 개발자 모집 */}
        <TouchableOpacity
          style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Recruiting')}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              함께 만들어요
            </Text>
            <Icon
              name="group-add"
              size={22}
              color={isDarkMode ? '#818CF8' : '#4F46E5'}
            />
          </View>
          <Text style={{color: isDarkMode ? '#BBBBBB' : '#6B7280'}}>
            POPO 개발팀에서 새로운 팀원을 찾고 있습니다
          </Text>
        </TouchableOpacity>

        {/* 앱 */}
        <View
          style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>앱</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => openLink(appRepo)}>
              <GitHubIcon
                size={20}
                color={isDarkMode ? '#93C5FD' : '#2563EB'}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsWrap}>
            {appContributors.map(h => (
              <TouchableOpacity
                key={h}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6',
                    borderColor,
                  },
                ]}
                onPress={() => openLink(getGithubUrl(h))}
                accessibilityRole="link"
                accessibilityLabel={`${h} GitHub`}>
                <Text style={{color: textColor}}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 백엔드 */}
        <View
          style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>
              백엔드
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openLink(backendRepo2)}
                accessibilityLabel="POPO 백엔드">
                <GitHubIcon
                  size={20}
                  color={isDarkMode ? '#93C5FD' : '#2563EB'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openLink(backendRepo1)}
                accessibilityLabel="Paxi 백엔드">
                <GitHubIcon
                  size={20}
                  color={isDarkMode ? '#93C5FD' : '#2563EB'}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chipsWrap}>
            {backendContributors.map(c => (
              <TouchableOpacity
                key={c.handle}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6',
                    borderColor,
                  },
                ]}
                onPress={() => openLink(getGithubUrl(c.handle))}
                accessibilityRole="link"
                accessibilityLabel={`${c.handle} GitHub`}>
                <Text style={{color: textColor}}>
                  {c.handle} {c.isLead ? '👑' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 디자이너 */}
        <View
          style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>
            디자이너
          </Text>
          <View style={styles.chipsWrap}>
            {designContributors.map(h => (
              <TouchableOpacity
                key={h}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6',
                    borderColor,
                  },
                ]}
                onPress={() => openLink(getGithubUrl(h))}
                accessibilityRole="link"
                accessibilityLabel={`${h} GitHub`}>
                <Text style={{color: textColor}}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 오픈소스 라이선스 */}
        <TouchableOpacity
          style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('OpenSourceLicenses')}>
          <View style={[styles.sectionHeaderRow, styles.noMargin]}>
            <Text
              style={[
                styles.sectionTitle,
                styles.noMargin,
                {color: textColor},
              ]}>
              오픈소스 라이선스
            </Text>
            <Icon
              name="description"
              size={22}
              color={isDarkMode ? '#818CF8' : '#4F46E5'}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  /** 본문 없이 제목 행만 있는 카드의 아래 여백 제거 */
  noMargin: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  role: {
    width: 84,
    fontSize: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  link: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
});

export default AboutScreen;
