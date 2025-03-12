import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useColorScheme,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type ReservationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reservation'>;
  route: RouteProp<RootStackParamList, 'Reservation'>;
};

// 임시 예약 데이터 인터페이스
interface Reservation {
  id: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  title: string;
}

// 임시 예약 데이터
const dummyReservations: Reservation[] = [
  {
    id: '1',
    date: '2024-03-15',
    time: '14:00-16:00',
    location: '공대 4호관 세미나실',
    status: 'confirmed',
    title: '팀 프로젝트 미팅',
  },
  {
    id: '2',
    date: '2024-03-18',
    time: '10:00-12:00',
    location: '학생회관 스터디룸 A',
    status: 'pending',
    title: '스터디 모임',
  },
  {
    id: '3',
    date: '2024-03-20',
    time: '15:30-17:30',
    location: '도서관 그룹 스터디룸',
    status: 'confirmed',
    title: '그룹 스터디',
  },
];

const ReservationScreen = ({ navigation }: ReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>(dummyReservations);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#F3F4F6',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';

  // 상태에 따른 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981'; // 초록색
      case 'pending':
        return '#F59E0B'; // 노란색
      case 'cancelled':
        return '#EF4444'; // 빨간색
      default:
        return '#6B7280'; // 회색
    }
  };

  // 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '예약 확정';
      case 'pending':
        return '승인 대기중';
      case 'cancelled':
        return '예약 취소';
      default:
        return '상태 없음';
    }
  };

  // 예약 취소 처리
  const handleCancelReservation = (id: string) => {
    Alert.alert(
      '예약 취소',
      '정말로 이 예약을 취소하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            // 실제 API 호출 대신 상태 업데이트
            setReservations(
              reservations.map(reservation =>
                reservation.id === id
                  ? { ...reservation, status: 'cancelled' as const }
                  : reservation
              )
            );
            Alert.alert('완료', '예약이 취소되었습니다.');
          },
        },
      ],
      { cancelable: false }
    );
  };

  // 개별 예약 항목 렌더링
  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <View style={[styles.reservationCard, { backgroundColor: cardBgColor, borderColor }]}>
      <View style={styles.reservationHeader}>
        <Text style={[styles.reservationTitle, { color: textColor }]}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.reservationDetail}>
        <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
          날짜 / 시간
        </Text>
        <Text style={[styles.detailValue, { color: textColor }]}>
          {new Date(item.date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} | {item.time}
        </Text>
      </View>

      <View style={styles.reservationDetail}>
        <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
          장소
        </Text>
        <Text style={[styles.detailValue, { color: textColor }]}>{item.location}</Text>
      </View>

      {item.status !== 'cancelled' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelReservation(item.id)}
        >
          <Text style={styles.cancelButtonText}>예약 취소</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: textColor }]}>뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>내 예약 목록</Text>
        <View style={styles.placeholderButton} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            예약 정보를 불러오는 중...
          </Text>
        </View>
      ) : reservations.length > 0 ? (
        <FlatList
          data={reservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/popo.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={[styles.emptyText, { color: textColor }]}>
            예약 내역이 없습니다.
          </Text>
          <TouchableOpacity
            style={styles.newReservationButton}
            onPress={() => Alert.alert('알림', '새 예약 기능은 준비 중입니다.')}
          >
            <Text style={styles.newReservationButtonText}>새 예약 만들기</Text>
          </TouchableOpacity>
        </View>
      )}
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
    borderBottomColor: '#E5E7EB',
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
  listContainer: {
    padding: 16,
  },
  reservationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservationTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  reservationDetail: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyImage: {
    width: 150,
    height: 60,
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 24,
  },
  newReservationButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '80%',
  },
  newReservationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReservationScreen;