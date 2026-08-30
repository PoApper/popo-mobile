import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Linking,
  Modal,
  Pressable,
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
import packages from '@assets/oss-licenses.json';

type OssPackage = (typeof packages)[number];

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
  const [selected, setSelected] = useState<OssPackage | null>(null);

  const openUrl = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      // 열 수 없는 URL은 무시한다
    }
  }, []);

  /** 라이선스가 하나뿐이면 바로 열고, 여러 개거나 링크가 없으면 모달로 안내한다. */
  const handlePress = useCallback(
    (item: OssPackage) => {
      const [only] = item.licenses;
      if (item.licenses.length === 1 && only.url) {
        openUrl(only.url);
        return;
      }
      setSelected(item);
    },
    [openUrl],
  );

  const renderItem = useCallback(
    ({item}: {item: OssPackage}) => (
      <TouchableOpacity
        style={[styles.item, {borderBottomColor: colors.border.primary}]}
        onPress={() => handlePress(item)}
        accessibilityRole="link"
        accessibilityLabel={`${item.name} 라이선스 보기`}>
        <View style={styles.itemTitle}>
          <Text style={[styles.name, {color: colors.text.primary}]}>
            {item.name}
          </Text>
          <Text style={[styles.meta, {color: colors.text.tertiary}]}>
            {item.publisher
              ? `${item.version} · ${item.publisher}`
              : item.version}
          </Text>
        </View>
        <Text style={[styles.license, {color: colors.text.secondary}]}>
          {item.licenses.map(license => license.id).join(', ')}
        </Text>
      </TouchableOpacity>
    ),
    [colors, handlePress],
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
      />

      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}>
        <View style={[styles.overlay, {backgroundColor: colors.overlay}]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelected(null)}
            accessibilityLabel="닫기"
          />
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.background.elevated,
                borderColor: colors.border.primary,
              },
            ]}>
            <Text style={[styles.cardTitle, {color: colors.text.primary}]}>
              {selected?.name}
            </Text>

            {selected?.licenses.map(license =>
              license.url ? (
                <TouchableOpacity
                  key={license.id}
                  style={[
                    styles.licenseRow,
                    {borderColor: colors.border.primary},
                  ]}
                  onPress={() => {
                    setSelected(null);
                    openUrl(license.url as string);
                  }}
                  accessibilityRole="link">
                  <Text style={[styles.licenseName, {color: colors.text.link}]}>
                    {license.id}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  key={license.id}
                  style={[
                    styles.licenseRow,
                    {borderColor: colors.border.primary},
                  ]}>
                  <Text
                    style={[styles.licenseName, {color: colors.text.tertiary}]}>
                    {license.id}
                  </Text>
                  <Text
                    style={[styles.licenseHint, {color: colors.text.tertiary}]}>
                    표준 라이선스 페이지가 없습니다
                  </Text>
                </View>
              ),
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelected(null)}>
              <Text style={[styles.closeText, {color: colors.text.secondary}]}>
                닫기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
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
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  license: {
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  licenseRow: {
    borderTopWidth: 1,
    paddingVertical: 14,
  },
  licenseName: {
    fontSize: 15,
    fontWeight: '500',
  },
  licenseHint: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    alignItems: 'center',
    paddingTop: 16,
  },
  closeText: {
    fontSize: 15,
  },
});

export default OpenSourceLicensesScreen;
