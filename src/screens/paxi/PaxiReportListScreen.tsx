import React, {useEffect, useState} from 'react';
import {
  Text,
  FlatList,
  StatusBar,
  useColorScheme,
  Alert,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {OtherStackParamList} from '@navigation/types';
import paxi_api from '@utils/paxi_api';
import ReportDataCard, {ReportData} from '@components/ReportDataCard';
import CommonHeader from '@components/CommonHeader';
import ReportProgressModal from '@components/ReportProgressModal';

type PaxiReportListScreenProps = {
  navigation: NativeStackNavigationProp<OtherStackParamList>;
};

const PaxiReportListScreen = ({navigation}: PaxiReportListScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const [reportList, setReportList] = useState<ReportData[]>([]);
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

  return (
    <SafeAreaView style={[backgroundStyle]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <CommonHeader navigation={navigation} title="Paxi 신고 목록" />

      <ReportProgressModal
        modalVisible={reportProgressModalVisible}
        setModalVisible={setReportProgressModalVisible}
        reportData={selectedReportData}
      />

      <FlatList
        style={{flex: 1}}
        data={reportList}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <ReportDataCard
            reportData={item}
            isDarkMode={isDarkMode}
            setReport={setReport}
          />
        )}
        contentContainerStyle={{padding: 15}}
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
            colors={['#000000']}
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
