import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@navigation/types';
import PoPoAxios from '../../utils/api'; // 실제 axios 인스턴스 경로에 맞게 수정 필요

// API 타입에 맞게 수정
interface IEquipment {
  uuid: string;
  name: string;
  description: string;
  fee: number;
  image_url?: string;
  max_minutes: number;
}

type EquipmentReservationScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'EquipmentReservation'
  >;
};

const tabs = [
  {label: '동아리연합회', value: 'dongyeon'},
  {label: '생활관자치회', value: 'dormunion'},
];

// 이모지 제거 함수 (숫자 등 일반 문자는 남기고 이모지만 제거)
function removeEmoji(str: string) {
  // 이모지 유니코드만 제거, 숫자/한글/영문 등은 남김
  return str.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83D[\uDE00-\uDE4F])/g,
    '',
  );
}

const EquipmentReservationScreen = ({
  navigation,
}: EquipmentReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedTab, setSelectedTab] = useState('dongyeon');
  const [equipmentList, setEquipmentList] = useState<IEquipment[]>([]);
  const [loading, setLoading] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#fff' : '#fff',
    flex: 1,
  };
  const textColor = isDarkMode ? '#000' : '#000';
  const borderColor = isDarkMode ? '#2C2C2C' : '#E5E7EB';

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const res = await PoPoAxios.get<IEquipment[]>(
          `equip/owner/${selectedTab}`,
        );
        // 이름순 정렬
        const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
        setEquipmentList(sorted);
      } catch (e) {
        setEquipmentList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [selectedTab]);

  const renderEquipmentItem = ({item}: {item: IEquipment}) => (
    <View style={styles.equipmentItem}>
      {item.image_url ? (
        <Image source={{uri: item.image_url}} style={styles.equipmentImage} />
      ) : (
        <View style={[styles.equipmentImage, {backgroundColor: '#eee'}]} />
      )}
      <View style={styles.equipmentInfo}>
        <Text style={[styles.equipmentName, {color: textColor}]}>
          {removeEmoji(item.name)}
        </Text>
        <Text style={styles.equipmentPrice}>{item.fee.toLocaleString()}원</Text>
      </View>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => {
          Alert.alert(
            '장비 상세정보',
            `이름: ${removeEmoji(item.name)}\n모델명/설명: ${
              item.description || '-'
            }\n가격: ${item.fee.toLocaleString()}원\n최대 사용 시간: ${
              item.max_minutes
            }분`,
            [{text: '닫기', style: 'cancel'}],
          );
        }}>
        <Text style={styles.detailButtonText}>상세정보</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'dark-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, {color: textColor}]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>장비 예약</Text>
        <View style={styles.placeholderButton} />
      </View>

      {/* 상단 탭 */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tab,
              selectedTab === tab.value && styles.selectedTab,
            ]}
            onPress={() => setSelectedTab(tab.value)}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.value && styles.selectedTabText,
              ]}>
              {tab.label}
            </Text>
            {selectedTab === tab.value && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* 장비 리스트 */}
      <View style={styles.equipmentListContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.equipmentList}>
          {equipmentList.length > 0 ? (
            equipmentList.map(item => (
              <View key={item.uuid}>{renderEquipmentItem({item})}</View>
            ))
          ) : (
            <Text style={styles.emptyListText}>
              {loading ? '불러오는 중...' : '장비가 없습니다.'}
            </Text>
          )}
        </ScrollView>
      </View>

      {/* 예약 신청하기 버튼 - 하단 고정 */}
      <View style={styles.reserveButtonWrapper}>
        <TouchableOpacity
          style={styles.reserveButton}
          onPress={() =>
            navigation.navigate('EquipmentReservationApply', {
              association: selectedTab,
            })
          }>
          <Text style={styles.reserveButtonText}>예약 신청하기</Text>
        </TouchableOpacity>
      </View>
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 4,
  },
  tab: {
    marginHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  selectedTab: {},
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  selectedTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  tabUnderline: {
    marginTop: 4,
    height: 2,
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 1,
  },
  equipmentListContainer: {
    flex: 1,
    marginBottom: 20,
  },
  equipmentList: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
  equipmentImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  equipmentDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  equipmentPrice: {
    fontSize: 13,
    color: '#888',
  },
  detailButton: {
    backgroundColor: '#F6F7F9',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginLeft: 10,
  },
  detailButtonText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '600',
  },
  reserveButtonWrapper: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reserveButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 40,
  },
});

export default EquipmentReservationScreen;
