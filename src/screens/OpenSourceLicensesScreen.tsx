import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import CommonHeader from '@components/CommonHeader';
import {useTheme} from '@styles/theme';
import ossLicenses from '@assets/oss-licenses.json';

const {packages, texts} = ossLicenses;

type OpenSourceLicensesScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'OpenSourceLicenses'
  >;
};

const OpenSourceLicensesScreen = ({
  navigation,
}: OpenSourceLicensesScreenProps) => {
  const {isDarkMode, colors} = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openHomepage = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      // 열 수 없는 URL은 무시한다
    }
  }, []);

  const renderItem = useCallback(
    ({item}: {item: (typeof packages)[number]}) => {
      const {homepage, publisher} = item;
      const id = `${item.name}@${item.version}`;
      const isExpanded = expandedId === id;
      const text = item.textIndex === -1 ? null : texts[item.textIndex];

      return (
        <View style={[styles.item, {borderBottomColor: colors.border.primary}]}>
          <TouchableOpacity
            style={styles.itemHeader}
            onPress={() => setExpandedId(isExpanded ? null : id)}
            accessibilityRole="button"
            accessibilityState={{expanded: isExpanded}}>
            <View style={styles.itemTitle}>
              <Text style={[styles.name, {color: colors.text.primary}]}>
                {item.name}
              </Text>
              <Text style={[styles.version, {color: colors.text.tertiary}]}>
                {item.version}
              </Text>
            </View>
            <Text style={[styles.license, {color: colors.text.secondary}]}>
              {item.license}
            </Text>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.detail}>
              {publisher && (
                <Text
                  style={[styles.publisher, {color: colors.text.secondary}]}>
                  저작권자: {publisher}
                </Text>
              )}
              {text ? (
                <Text
                  style={[styles.licenseText, {color: colors.text.secondary}]}>
                  {text}
                </Text>
              ) : (
                <Text
                  style={[styles.licenseText, {color: colors.text.tertiary}]}>
                  이 패키지는 라이선스 전문을 포함하고 있지 않습니다.
                  {'\n'}
                  아래 링크에서 원문을 확인할 수 있습니다.
                </Text>
              )}
              {homepage && (
                <TouchableOpacity
                  onPress={() => openHomepage(homepage)}
                  accessibilityRole="link">
                  <Text style={[styles.homepage, {color: colors.text.link}]}>
                    {homepage}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      );
    },
    [colors, expandedId, openHomepage],
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: colors.background.primary}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.primary}
      />
      <CommonHeader navigation={navigation} title="오픈소스 라이선스" />

      <FlatList
        data={packages}
        keyExtractor={item => `${item.name}@${item.version}`}
        renderItem={renderItem}
        ListHeaderComponent={
          <Text style={[styles.intro, {color: colors.text.secondary}]}>
            POPO는 아래 오픈소스 소프트웨어를 사용하고 있습니다. 각 프로젝트의
            개발자분들께 감사드립니다.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    padding: 16,
  },
  item: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  itemTitle: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  version: {
    fontSize: 12,
    marginTop: 2,
  },
  license: {
    fontSize: 12,
  },
  detail: {
    paddingBottom: 16,
  },
  publisher: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  licenseText: {
    fontSize: 12,
    lineHeight: 18,
  },
  homepage: {
    fontSize: 12,
    marginTop: 12,
    textDecorationLine: 'underline',
  },
});

export default OpenSourceLicensesScreen;
