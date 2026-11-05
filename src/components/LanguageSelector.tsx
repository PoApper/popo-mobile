import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {useTheme} from '@styles/theme';
import {Locale} from '@utils/locale';
import {getLocalePreference, setLocalePreference} from '@utils/i18n';

/** null은 기기 언어를 따른다는 뜻이다. */
type Preference = Locale | null;

const OPTIONS: {value: Preference; labelKey: 'system' | Locale}[] = [
  {value: null, labelKey: 'system'},
  {value: 'ko', labelKey: 'ko'},
  {value: 'en', labelKey: 'en'},
];

const LanguageSelector = () => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [preference, setPreference] = useState<Preference>(null);

  useEffect(() => {
    getLocalePreference().then(setPreference);
  }, []);

  const select = async (next: Preference) => {
    setPreference(next);
    await setLocalePreference(next);
  };

  return (
    <View style={[styles.section, {borderColor: colors.border.primary}]}>
      <Text style={[styles.title, {color: colors.text.primary}]}>
        {t('language.title')}
      </Text>
      <View style={styles.row}>
        {OPTIONS.map(({value, labelKey}) => {
          const selected = value === preference;
          return (
            <TouchableOpacity
              key={labelKey}
              accessibilityRole="button"
              accessibilityState={{selected}}
              style={[
                styles.chip,
                {
                  backgroundColor: selected
                    ? colors.button.primaryBg
                    : colors.button.secondaryBg,
                },
              ]}
              onPress={() => select(value)}>
              <Text
                style={{
                  color: selected
                    ? colors.button.primaryText
                    : colors.button.secondaryText,
                }}>
                {t(`language.${labelKey}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    borderTopWidth: 1,
    paddingTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
});

export default LanguageSelector;
