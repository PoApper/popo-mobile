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
import api from '../utils/api';
import axios from 'axios';

type ReservationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reservation'>;
  route: RouteProp<RootStackParamList, 'Reservation'>;
};

interface Place {
  uuid: string;
  name: string;
  description: string;
  location: string;
  region: string;
  staff_email: string;
  image_url: string;
}

// 서버에서 오는 장소 예약 인터페이스
interface PlaceReservation {
  uuid: string;
  place_id: string;
  booker_id: string;
  phone: string;
  title: string;
  description: string;
  date: string; // YYYYMMDD
  start_time: string; // HHmm
  end_time: string; // HHmm
  status: '심사중' | '통과' | '거절';
  created_at: Date;
  place: Place;
}

const ReservationScreen = ({ navigation }: ReservationScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<PlaceReservation[]>([]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#F3F4F6',
    flex: 1,
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';

  // 서버에서 예약 정보 가져오기
  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/reservation-place/user');
      const data: PlaceReservation[] = response.data;

      console.log('서버 응답 데이터:', data);

      // 날짜 기준으로 정렬 (최신 날짜가 먼저 오도록)
      const sortedReservations = [...data].sort((a, b) => {
        const dateA = new Date(formatDate(a.date));
        const dateB = new Date(formatDate(b.date));
        return dateB.getTime() - dateA.getTime();
      });

      setReservations(sortedReservations);
    } catch (err) {
      console.error('예약 정보 조회 오류:', err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // 인증 오류 시 로그인 화면으로 이동
          Alert.alert('인증 만료', '다시 로그인해주세요.', [
            { text: '확인', onPress: () => navigation.navigate('Login') }
          ]);
        } else {
          setError('예약 정보를 불러오는데 실패했습니다.');
        }
      } else {
        setError('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // YYYYMMDD 형식의 날짜를 YYYY-MM-DD로 변환
  const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  };

  // HHmm 형식의 시간을 HH:mm으로 변환
  const formatTime = (timeStr: string): string => {
    if (!timeStr || timeStr.length !== 4) return timeStr;
    return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
  };

  // 컴포넌트 마운트 시 예약 정보 가져오기
  useEffect(() => {
    fetchReservations();
  }, []);

  // 상태에 따른 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case '통과':
        return '#10B981'; // 초록색
      case '심사중':
        return '#6B7280'; // 회색
      case '거절':
        return '#EF4444'; // 빨간색
      default:
        return '#6B7280'; // 회색
    }
  };

  // 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case '통과':
        return '예약 통과';
      case '심사중':
        return '대기중';
      case '거절':
        return '예약 거절';
      default:
        return status || '상태 없음';
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
          onPress: async () => {
            setIsLoading(true);
            try {
              // API 엔드포인트는 서버 설계에 따라 달라질 수 있습니다
              await api.post(`/reservation-place/${id}/cancel`);

              // 취소 성공 후 목록 새로고침
              Alert.alert('완료', '예약이 취소되었습니다.');
              fetchReservations();
            } catch (error) {
              console.error('예약 취소 오류:', error);
              Alert.alert('오류', '예약 취소 중 문제가 발생했습니다.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // 개별 예약 항목 렌더링
  const renderReservationItem = ({ item }: { item: PlaceReservation }) => (
    <View style={[styles.reservationCard, { backgroundColor: cardBgColor, borderColor }]}>
      <View style={styles.reservationHeader}>
        <View style={styles.titleContainer}>
          <Text style={[styles.reservationTitle, { color: textColor }]}>{item.title || '제목 없음'}</Text>
        </View>
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
          {new Date(formatDate(item.date)).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} | {formatTime(item.start_time)}-{formatTime(item.end_time)}
        </Text>
      </View>

      <View style={styles.reservationDetail}>
        <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
          장소
        </Text>
        <Text style={[styles.detailValue, { color: textColor }]}>
          {item.place?.name || '장소 이름 없음'}
        </Text>
      </View>

      {item.place?.location && (
        <View style={styles.reservationDetail}>
          <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
            위치
          </Text>
          <Text style={[styles.detailValue, { color: textColor }]}>{item.place.location}</Text>
        </View>
      )}

      {item.description && (
        <View style={styles.reservationDetail}>
          <Text style={[styles.detailLabel, { color: isDarkMode ? '#BBBBBB' : '#6B7280' }]}>
            설명
          </Text>
          <Text style={[styles.detailValue, { color: textColor }]}>{item.description}</Text>
        </View>
      )}

      {item.status !== '거절' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelReservation(item.uuid)}
        >
          <Text style={styles.cancelButtonText}>예약 취소</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // 새로고침 처리
  const handleRefresh = () => {
    fetchReservations();
  };

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
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Text style={[styles.refreshButtonText, { color: textColor }]}>새로고침</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            예약 정보를 불러오는 중...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchReservations}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : reservations.length > 0 ? (
        <FlatList
          data={reservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.uuid}
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
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 14,
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
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reservationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '80%',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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