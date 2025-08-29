import React, {useEffect, useState} from 'react';
import {
  Text,
  FlatList,
  StatusBar,
  useColorScheme,
  Alert,
  RefreshControl,
  StyleSheet,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {OtherStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import ReportDataCard, {ReportData} from '@components/ReportDataCard';
import CommonHeader from '@components/CommonHeader';
import {disassemble, getChoseong} from 'es-hangul';
import ReportProgressModal from '@components/ReportProgressModal';

type PaxiReportListScreenProps = {
  navigation: NativeStackNavigationProp<OtherStackParamList>;
};

function hangulIncludes(x: string, y: string) {
  const disassembledX = disassemble(x.toLowerCase());
  const disassembledY = disassemble(y.toLowerCase());

  return disassembledX.includes(disassembledY) || getChoseong(x).includes(y);
}

const PaxiReportListScreen = ({navigation}: PaxiReportListScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reportList, setReportList] = useState<ReportData[]>([]);
  const [filteredReportList, setFilteredReportList] = useState<ReportData[]>(
    [],
  );
  const [selectedReportData, setSelectedReportData] = useState<ReportData>(
    {} as ReportData,
  );
  const [reportProgressModalVisible, setReportProgressModalVisible] =
    useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    getReportList();
  }, []);

  const getReportList = async () => {
    paxi_api
      .get('/report/my')
      .then(res => {
        const tempReportList = (res.data as ReportData[]).reverse();
        setReportList(tempReportList);
        setFilteredReportList(tempReportList);
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('실패', '방을 불러오는데 실패했습니다: ' + error.message);
      });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getReportList();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const setReport = (report: ReportData) => {
    setSelectedReportData(report);
    setReportProgressModalVisible(true);
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#fff',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  useEffect(() => {
    const q = searchQuery.trim();

    if (q.length === 0) {
      setFilteredReportList(reportList);
      return;
    }

    const searchQueryList = searchQuery.trim().split(/\s+/);

    setFilteredReportList(
      reportList.filter((item: ReportData) => {
        const fields = [
          item.reason,
          item.targetRoomName,
          item.targetUserNickname,
        ].filter(Boolean) as string[];

        return searchQueryList.every(queryChar =>
          fields.some(text => hangulIncludes(text, queryChar)),
        );
      }),
    );
  }, [searchQuery, reportList]);

  return (
    <SafeAreaView style={[backgroundStyle]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title="Paxi 신고 목록" />

      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: isDarkMode ? '#222' : '#eee',
            color: textColor,
          },
        ]}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="띄어쓰기 단위로 검색어를 입력하세요"
        placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
        multiline={false}
        maxLength={200}
      />

      <ReportProgressModal
        modalVisible={reportProgressModalVisible}
        setModalVisible={setReportProgressModalVisible}
        reportData={selectedReportData}
      />

      <FlatList
        style={{flex: 1}}
        data={filteredReportList}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <ReportDataCard
            reportData={item}
            isDarkMode={isDarkMode}
            setReport={setReport}
          />
        )}
        contentContainerStyle={{padding: 15, paddingTop: 0, paddingBottom: 100}}
        ListEmptyComponent={() => (
          <Text style={{fontSize: 16, textAlign: 'center', color: textColor}}>
            신고 내역이 없습니다.
          </Text>
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={isDarkMode ? ['#000000'] : ['#ffffff']}
            tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        }
        initialNumToRender={10}
        windowSize={10}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
};

export default PaxiReportListScreen;

const styles = StyleSheet.create({
  textInput: {
    flexGrow: 0,
    height: 40,
    textAlignVertical: 'top',
    borderRadius: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
});
