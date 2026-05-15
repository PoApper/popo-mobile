import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import CommonHeader from '@components/CommonHeader';
import StudentAssociationItem, {
  StudentAssociationItemType,
} from '@components/student-association/StudentAssociationItem';

type StudentAssociationScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'StudentAssociation'
  >;
};

const sortTypes = ['가나다순', '조회순'];

const StudentAssociationScreen: React.FC<StudentAssociationScreenProps> = ({
  navigation,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [sortType, setSortType] = useState('가나다순');
  const [isLoading, setIsLoading] = useState(true);
  const [studentAssociations, setStudentAssociations] = useState<
    StudentAssociationItemType[]
  >([]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  const getSortedItems = (items: StudentAssociationItemType[]) => {
    if (sortType === '가나다순') {
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [...items].sort((a, b) => b.views - a.views);
    }
  };

  useEffect(() => {
    const fetchStudentAssociations = async () => {
      try {
        const response = await api.get<StudentAssociationItemType[]>(
          '/introduce/student_association',
        );
        setStudentAssociations(response.data);
      } catch (error) {
        console.error('학생단체 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentAssociations();
  }, []);

  const renderItem = ({item}: {item: StudentAssociationItemType}) => {
    return (
      <StudentAssociationItem
        item={item}
        onPress={() =>
          navigation.navigate('StudentAssociationDetail', {
            studentAssociationName: item.name,
          })
        }
      />
    );
  };

  const ListEmpty = () => {
    return (
      <View
        style={[
          styles.emptyContainer,
          isDarkMode ? styles.cardDark : styles.cardLight,
        ]}>
        <Text style={[styles.emptyText, {color: textColor}]}>
          {isLoading ? '로딩중...' : '등록된 학생단체가 없습니다.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title="학생단체" />

      <View style={styles.sortButtons}>
        {sortTypes.map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.sortButton,
              {borderColor: isDarkMode ? '#555' : '#ccc'},
              sortType === type && [
                styles.activeSort,
                {backgroundColor: textColor},
              ],
            ]}
            onPress={() => setSortType(type)}>
            <Text
              style={[
                styles.sortButtonText,
                {color: textColor},
                sortType === type && {color: isDarkMode ? '#000' : '#fff'},
              ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        style={styles.container}
        contentContainerStyle={styles.listContent}
        data={getSortedItems(studentAssociations)}
        keyExtractor={item => item.uuid}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  sortButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginVertical: 10,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeSort: {
    borderColor: '#000',
  },
  sortButtonText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 16,
    borderRadius: 12,
  },
  cardDark: {
    backgroundColor: '#1A1A1A',
  },
  cardLight: {
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default StudentAssociationScreen;
