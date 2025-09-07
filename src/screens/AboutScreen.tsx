import React from 'react';
import {StyleSheet, Text, View, ScrollView, useColorScheme, StatusBar} from 'react-native';
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

  // 추후 사용자 제공 데이터로 교체 예정
  const creators: Array<{role: string; name: string; email?: string; link?: string}> = [];

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
          <Text style={[styles.sectionTitle, {color: textColor}]}>만든 사람들</Text>
          {creators.length === 0 ? (
            <Text style={{color: isDarkMode ? '#BBBBBB' : '#6B7280'}}>추가 예정</Text>
          ) : (
            creators.map((c, idx) => (
              <View key={idx} style={[styles.row, {borderBottomColor: borderColor}]}>
                <Text style={[styles.role, {color: isDarkMode ? '#BBBBBB' : '#6B7280'}]}>{c.role}</Text>
                <View style={{flex: 1}}>
                  <Text style={[styles.name, {color: textColor}]}>{c.name}</Text>
                  {c.email ? (
                    <Text style={{color: isDarkMode ? '#AAAAAA' : '#6B7280'}}>{c.email}</Text>
                  ) : null}
                  {c.link ? (
                    <Text style={{color: isDarkMode ? '#AAAAAA' : '#6B7280'}}>{c.link}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={[styles.card, {backgroundColor: cardBgColor, borderColor}]}>
          <Text style={[styles.sectionTitle, {color: textColor}]}>버전 정보</Text>
          <Text style={{color: isDarkMode ? '#BBBBBB' : '#6B7280'}}>
            버전/빌드 정보는 추후 패키지에서 불러오거나 주입 예정입니다.
          </Text>
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
});

export default AboutScreen;


