import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useColorScheme,
  Alert,
  RefreshControl,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import axios from 'axios';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';

interface Equipment {
  uuid: string;
  name: string;
  description: string;
  equip_owner: string;
  region: string;
  staff_email: string;
  image_url: string;
}

interface EquipmentReservation {
  uuid: string;
  booker_id: string;
  phone: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  status: '심사중' | '통과' | '거절';
  created_at: Date;
  equipments: Equipment[];
}

interface PaginatedResponse {
  items: EquipmentReservation[];
  total: number;
}

interface ReservationListProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyReservation'>;
  refreshKey?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const ReservationList: React.FC<ReservationListProps> = ({
  navigation,
  refreshKey,
  refreshing,
  onRefresh,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<EquipmentReservation[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<FlatList>(null);
  const itemsPerPage = 10;

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardBgColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';

  const fetchReservations = async (
    pageNum: number = 1,
    append: boolean = false,
  ) => {
    if (!hasMore && pageNum > 1) {
      return;
    }

    try {
      setIsLoadingMore(pageNum > 1);
      if (pageNum === 1) {
        setIsLoading(true);
      }

      const response = await api.get<PaginatedResponse>(
        '/reservation-equip/user',
        {
          params: {
            skip: (pageNum - 1) * itemsPerPage,
            take: itemsPerPage,
          },
        },
      );

      const {items} = response.data;
      const sortedReservations = [...items].sort((a, b) => {
        const dateA = new Date(formatDate(a.date));
        const dateB = new Date(formatDate(b.date));
        return dateB.getTime() - dateA.getTime();
      });

      setHasMore(items.length === itemsPerPage);
      if (append) {
        setReservations(prev => [...prev, ...sortedReservations]);
      } else {
        setReservations(sortedReservations);
      }
      setPage(pageNum);
    } catch (err) {
      console.error('예약 정보 조회 오류:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          Alert.alert('인증 만료', '다시 로그인해주세요.', [
            {text: '확인', onPress: () => navigation.navigate('Login')},
          ]);
        } else {
          setError('예약 정보를 불러오는데 실패했습니다.');
        }
      } else {
        setError('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchReservations(page + 1, true);
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 200);
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  useEffect(() => {
    fetchReservations();
  }, [refreshKey]);

  const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr.length !== 8) {
      return dateStr;
    }
    return `${dateStr.substring(0, 4)}-${dateStr.substring(
      4,
      6,
    )}-${dateStr.substring(6, 8)}`;
  };

  const formatTime = (timeStr: string): string => {
    if (!timeStr || timeStr.length !== 4) {
      return timeStr;
    }
    return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '통과':
        return '#10B981';
      case '심사중':
        return '#6B7280';
      case '거절':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

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
              await api.delete(`/reservation-equip/${id}`);
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
      {cancelable: false},
    );
  };

  const renderReservationItem = ({item}: {item: EquipmentReservation}) => (
    <View
      style={[
        styles.reservationCard,
        {backgroundColor: cardBgColor, borderColor},
      ]}>
      <View style={styles.reservationHeader}>
        <View style={styles.titleContainer}>
          <Text style={[styles.reservationTitle, {color: textColor}]}>
            {item.title || '제목 없음'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.reservationDetail}>
        <Text
          style={[
            styles.detailLabel,
            {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
          ]}>
          날짜 / 시간
        </Text>
        <Text style={[styles.detailValue, {color: textColor}]}>
          {new Date(formatDate(item.date)).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}{' '}
          | {formatTime(item.start_time)}-{formatTime(item.end_time)}
        </Text>
      </View>

      <View style={styles.reservationDetail}>
        <Text
          style={[
            styles.detailLabel,
            {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
          ]}>
          장비 목록 ({item.equipments.length})
        </Text>
        {item.equipments.map((equipment: Equipment) => (
          <View style={styles.equipmentItem} key={item.uuid + equipment.uuid}>
            <Text style={[styles.detailValue, {color: textColor}]}>
              - {equipment.name}
            </Text>
          </View>
        ))}
      </View>

      {item.description && (
        <View style={styles.reservationDetail}>
          <Text
            style={[
              styles.detailLabel,
              {color: isDarkMode ? '#BBBBBB' : '#6B7280'},
            ]}>
            설명
          </Text>
          <Text style={[styles.detailValue, {color: textColor}]}>
            {item.description}
          </Text>
        </View>
      )}

      {item.status !== '거절' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelReservation(item.uuid)}>
          <Text style={styles.cancelButtonText}>예약 취소</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={[styles.loadingText, {color: textColor}]}>
          예약 정보를 불러오는 중...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, {color: textColor}]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchReservations(1)}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (reservations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../../assets/icon/POPO_typography_bg_removed_cropped.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={[styles.emptyText, {color: textColor}]}>
          장비 예약 내역이 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        ref={listRef}
        data={reservations}
        renderItem={renderReservationItem}
        keyExtractor={item => item.uuid}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      />
      {showScrollTop && (
        <TouchableOpacity
          style={[
            styles.scrollTopButton,
            {
              backgroundColor: isDarkMode ? '#333' : '#fff',
              shadowColor: isDarkMode ? '#000' : 'rgba(0, 0, 0, 0.3)',
            },
          ]}
          onPress={scrollToTop}>
          <Text style={[styles.scrollTopText, {color: textColor}]}>↑</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  reservationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
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
    marginBottom: 4,
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
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  scrollTopText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default ReservationList;
