import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, StatusBar, FlatList, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import api from '../utils/api';

type WhitebookScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Whitebook'>;
};

interface WhitebookItem {
  uuid: string;
  title: string;
  link: string;
  content: string;
  click_count: number;
}

const WhitebookScreen: React.FC<WhitebookScreenProps> = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const [isLoading, setIsLoading] = useState(true);
  const [whiteBookItems, setWhiteBookItems] = useState<WhitebookItem[]>([]);
  const [sortType, setSortType] = useState("조회순");


  useEffect(() => {
    const fetchWhitebookItems = async () => {
      setIsLoading(true);

      try {
      const response = await api.get<WhitebookItem[]>('/whitebook');
      setWhiteBookItems(response.data);
    } catch (error) {
      console.error('Whitebook 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhitebookItems();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

  if (sortType === "조회순") {
    whiteBookItems.sort((a, b) => b.click_count - a.click_count);
  } else if (sortType === "가나다순") {
    whiteBookItems.sort((a, b) => a.title.localeCompare(b.title));
  }

  const handleLinkPress = async (link: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(link);

      if (supported) {
        await Linking.openURL(link);
      } else {
        Alert.alert(
          "오류",
          "이 링크를 열 수 없습니다.",
          [{ text: "확인" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "오류",
        "링크를 여는 중 문제가 발생했습니다.",
        [{ text: "확인" }]
      );
      console.error('링크 오픈 오류:', error);
    }
  };

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
        <Text style={[styles.headerTitle, { color: textColor }]}>생활백서</Text>
        <View style={styles.placeholderButton} />
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={[styles.descriptionText, { color: textColor }]}>
          야생의 POSTECH에서 살아남기 위한 가이드! 📚{'\n'}
          카카오톡 플러스친구 'POSTECH 생활백서'를 통해서도 이용하실 수 있습니다
        </Text>
      </View>

      {/* 정렬 버튼 */}
      <View style={styles.sortButtons}>
        {["가나다순", "조회순"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.sortButton,
              { borderColor: isDarkMode ? '#555' : '#ccc' },
              sortType === type && [styles.activeSort, { backgroundColor: textColor }]
            ]}
            onPress={() => setSortType(type)}
          >
            <Text style={[
              styles.sortButtonText,
              { color: textColor },
              sortType === type && { color: isDarkMode ? '#000' : '#fff' }
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={whiteBookItems}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' }]}
            onPress={() => handleLinkPress(item.link, item.title)}
          >
            <View style={styles.textContainer}>
              <Text style={[styles.itemTitle, { color: textColor }]}>{item.title}</Text>
              <Text style={[styles.itemDescription, { color: isDarkMode ? '#888' : '#666' }]}>
                {item.content}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  descriptionContainer: {
    padding: 20,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  /* 정렬 버튼 */
  sortButtons: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginVertical: 10
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  activeSort: {
    borderColor: "#000"
  },
  sortButtonText: {
    fontSize: 14
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
  },
});

export default WhitebookScreen;
