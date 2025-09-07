import React from 'react';
import {StyleSheet, Text, View, ScrollView, useColorScheme, StatusBar, Linking, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import CommonHeader from '@components/CommonHeader';

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

  const openLink = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (e) {
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

      <ScrollView style={styles.container} contentContainerStyle={{padding: 16}}>
        <View style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <Text style={[styles.title, {color: textColor}]}>POPO</Text>
          <Text style={[styles.subtitle, {color: isDarkMode ? '#AAAAAA' : '#6B7280'}]}>
            포스텍 구성원을 위한 서비스 허브
          </Text>
        </View>

        <View style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>버전 정보</Text>
          <Text style={{color: isDarkMode ? '#BBBBBB' : '#6B7280'}}>
            TODO: 버전/빌드 정보는 추후 패키지에서 불러오거나 주입 예정입니다.
          </Text>
        </View>

        {/* 앱 */}
        <View style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>앱</Text>
            <TouchableOpacity style={styles.iconButton} onPress={() => openLink(appRepo)}>
              <Icon name="code" size={20} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsWrap}>
            {appContributors.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.chip, {backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6', borderColor}]}
                onPress={() => openLink(getGithubUrl(h))}
                accessibilityRole="link"
                accessibilityLabel={`${h} GitHub`}>
                <Text style={{color: textColor}}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 백엔드 */}
        <View style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, {color: textColor}]}>백엔드</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={styles.iconButton} onPress={() => openLink(backendRepo2)} accessibilityLabel="POPO 백엔드">
                <Icon name="code" size={20} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => openLink(backendRepo1)} accessibilityLabel="Paxi 백엔드">
                <Icon name="code" size={20} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chipsWrap}>
            {backendContributors.map(c => (
              <TouchableOpacity
                key={c.handle}
                style={[styles.chip, {backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6', borderColor}]}
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
        <View style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>디자이너</Text>
          <View style={styles.chipsWrap}>
            {designContributors.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.chip, {backgroundColor: isDarkMode ? '#2A2A2A' : '#F3F4F6', borderColor}]}
                onPress={() => openLink(getGithubUrl(h))}
                accessibilityRole="link"
                accessibilityLabel={`${h} GitHub`}>
                <Text style={{color: textColor}}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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


