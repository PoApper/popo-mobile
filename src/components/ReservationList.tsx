import React, {useState, useEffect, useRef, ReactNode} from 'react';
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
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import axios from 'axios';

import {RootStackParamList} from '@navigation/types';
import api from '@utils/api';
import {getAxiosErrorInfo} from '@utils/axios-error';

// --- Exported Generic Interfaces ---

export interface BaseReservation {
  uuid: string;
  bookerId: string;
  phone: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: '심사중' | '통과' | '거절';
  createdAt: Date;
}

export interface ModalColors {
  labelColor: string;
  valueColor: string;
}

export interface ReservationConfig<T> {
  fetchEndpoint: string;
  deleteEndpoint: string;
  getSubtitle: (item: T) => string;
  renderModalDetails: (item: T, colors: ModalColors) => ReactNode;
  emptyText: string;
}

export interface ReservationListProps<T extends BaseReservation> {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyReservation'>;
  config: ReservationConfig<T>;
  refreshKey?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

// --- Place-specific Types ---

interface Place {
  uuid: string;
  name: string;
  description: string;
  location: string;
  region: string;
  staffEmail: string;
  imageUrl: string;
}

export interface PlaceReservation extends BaseReservation {
  placeId: string;
  place: Place;
}

// --- Internal Types ---

interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

// --- Generic Component ---

export function ReservationList<T extends BaseReservation>({
  navigation,
  config,
  refreshKey,
  refreshing,
  onRefresh,
}: ReservationListProps<T>) {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<T | null>(
    null,
  );
  const listRef = useRef<FlatList>(null);
  const itemsPerPage = 10;

  // Modal animation values
  const {height: screenHeight} = Dimensions.get('window');
  const translateY = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

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

      const response = await api.get<PaginatedResponse<T>>(
        config.fetchEndpoint,
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
              await api.delete(`${config.deleteEndpoint}/${id}`);
              Alert.alert('완료', '예약이 취소되었습니다.');
              closeModal();
              fetchReservations();
            } catch (err) {
              const {isAxios, status, detail} = getAxiosErrorInfo(err);
              const itemToReopen = selectedReservation;
              // Close details modal first so Android Alert is not obscured
              closeModal();
              if (
                isAxios &&
                status === 400 &&
                detail === 'Cannot delete past reservation'
              ) {
                setTimeout(() => {
                  Alert.alert('오류', '과거 예약은 취소할 수 없습니다.', [
                    {
                      text: '확인',
                      onPress: () => {
                        if (itemToReopen) {
                          openModal(itemToReopen);
                        }
                      },
                    },
                  ]);
                }, 300);
              } else {
                console.error('예약 취소 오류:', err);
                setTimeout(() => {
                  Alert.alert(
                    '오류',
                    detail
                      ? String(detail)
                      : '예약 취소 중 문제가 발생했습니다.',
                    [
                      {
                        text: '확인',
                        onPress: () => {
                          if (itemToReopen) {
                            openModal(itemToReopen);
                          }
                        },
                      },
                    ],
                  );
                }, 300);
              }
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '통과':
        return {name: 'check-circle', color: '#10B981'};
      case '심사중':
        return {name: 'access-time', color: '#F59E0B'};
      case '거절':
        return {name: 'cancel', color: '#EF4444'};
      default:
        return {name: 'help', color: '#6B7280'};
    }
  };

  const openModal = (item: T) => {
    setSelectedReservation(item);
    setModalVisible(true);

    // Reset animation values and animate in
    translateY.setValue(screenHeight);
    modalOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Defer state updates to avoid scheduling during insertion effect
      setTimeout(() => {
        setModalVisible(false);
        setSelectedReservation(null);
      }, 0);
    });
  };

  // drag-to-close 제거(사이드바와 동일 패턴)

  const handleLongPress = (item: T) => {
    if (item.status !== '거절') {
      handleCancelReservation(item.uuid);
    }
  };

  const renderReservationItem = ({item}: {item: T}) => {
    const statusIcon = getStatusIcon(item.status);
    const subtitleColor = isDarkMode ? '#BBBBBB' : '#6B7280';
    const iconBgColor = isDarkMode ? '#2A2A2A' : '#F3F4F6';

    return (
      <TouchableOpacity
        style={[styles.simpleReservationItem, {borderBottomColor: borderColor}]}
        onPress={() => openModal(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}>
        <View style={styles.itemContent}>
          <Text
            style={[styles.itemTitle, {color: textColor}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.title || '제목 없음'}
          </Text>
          <Text
            style={[styles.itemSubtitle, {color: subtitleColor}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {config.getSubtitle(item)}
          </Text>
          <Text style={[styles.itemDateTime, {color: subtitleColor}]}>
            {new Date(formatDate(item.date)).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            {formatTime(item.startTime)}
          </Text>
        </View>
        <View
          style={[styles.statusIconContainer, {backgroundColor: iconBgColor}]}>
          <Icon name={statusIcon.name} size={24} color={statusIcon.color} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={textColor} />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={textColor} />
        <Text style={[styles.loadingText, {color: textColor}]}>
          {'예약 정보를 불러오는 중...'}
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
          <Text style={styles.retryButtonText}>{'다시 시도'}</Text>
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
          {config.emptyText}
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
            colors={['#000000']}
            tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        }
      />
      {showScrollTop && (
        <TouchableOpacity
          style={[
            styles.scrollTopButton,
            isDarkMode
              ? styles.scrollTopButtonDark
              : styles.scrollTopButtonLight,
          ]}
          onPress={scrollToTop}>
          <Text style={[styles.scrollTopText, {color: textColor}]}>{'↑'}</Text>
        </TouchableOpacity>
      )}

      {/* Details Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        statusBarTranslucent={Platform.OS === 'android'}
        hardwareAccelerated>
        <GestureHandlerRootView style={styles.gestureContainer}>
          <Pressable style={styles.modalOverlay} onPress={closeModal}>
            <Animated.View
              style={[styles.modalOverlayAnimated, {opacity: modalOpacity}]}
            />
          </Pressable>

          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: cardBgColor,
                transform: [{translateY}],
              },
            ]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={[styles.modalTitle, {color: textColor}]}>
                  {'예약 상세정보'}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={{paddingBottom: 24}}>
              {selectedReservation &&
                (() => {
                  const modalLabelColor = isDarkMode ? '#BBBBBB' : '#6B7280';
                  const modalValueColor = textColor;
                  const statusIcon = getStatusIcon(selectedReservation.status);

                  return (
                    <>
                      <View style={styles.modalDetailSection}>
                        <Text
                          style={[styles.modalLabel, {color: modalLabelColor}]}>
                          {'제목'}
                        </Text>
                        <Text
                          style={[styles.modalValue, {color: modalValueColor}]}>
                          {selectedReservation.title || '제목 없음'}
                        </Text>
                      </View>

                      <View style={styles.modalDetailSection}>
                        <Text
                          style={[styles.modalLabel, {color: modalLabelColor}]}>
                          {'상태'}
                        </Text>
                        <View style={styles.statusContainer}>
                          <Icon
                            name={statusIcon.name}
                            size={20}
                            color={statusIcon.color}
                          />
                          <Text
                            style={[
                              styles.modalValue,
                              styles.statusTextWithMargin,
                              {color: modalValueColor},
                            ]}>
                            {getStatusText(selectedReservation.status)}
                          </Text>
                        </View>
                      </View>

                      {config.renderModalDetails(selectedReservation, {
                        labelColor: modalLabelColor,
                        valueColor: modalValueColor,
                      })}

                      <View style={styles.modalDetailSection}>
                        <Text
                          style={[styles.modalLabel, {color: modalLabelColor}]}>
                          {'날짜'}
                        </Text>
                        <Text
                          style={[styles.modalValue, {color: modalValueColor}]}>
                          {new Date(
                            formatDate(selectedReservation.date),
                          ).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>

                      <View style={styles.modalDetailSection}>
                        <Text
                          style={[styles.modalLabel, {color: modalLabelColor}]}>
                          {'시간'}
                        </Text>
                        <Text
                          style={[styles.modalValue, {color: modalValueColor}]}>
                          {formatTime(selectedReservation.startTime)} -{' '}
                          {formatTime(selectedReservation.endTime)}
                        </Text>
                      </View>

                      {selectedReservation.description && (
                        <View style={styles.modalDetailSection}>
                          <Text
                            style={[
                              styles.modalLabel,
                              {color: modalLabelColor},
                            ]}>
                            {'설명'}
                          </Text>
                          <Text
                            style={[
                              styles.modalValue,
                              {color: modalValueColor},
                            ]}>
                            {selectedReservation.description}
                          </Text>
                        </View>
                      )}

                      {selectedReservation.phone && (
                        <View style={styles.modalDetailSection}>
                          <Text
                            style={[
                              styles.modalLabel,
                              {color: modalLabelColor},
                            ]}>
                            {'연락처'}
                          </Text>
                          <Text
                            style={[
                              styles.modalValue,
                              {color: modalValueColor},
                            ]}>
                            {selectedReservation.phone}
                          </Text>
                        </View>
                      )}

                      {selectedReservation.status !== '거절' && (
                        <TouchableOpacity
                          style={[
                            styles.modalCancelButton,
                            styles.cancelButtonBg,
                          ]}
                          onPress={() =>
                            handleCancelReservation(selectedReservation.uuid)
                          }>
                          <Icon name="cancel" size={20} color="#FFFFFF" />
                          <Text style={styles.modalCancelButtonText}>
                            {'예약 취소'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  );
                })()}
            </ScrollView>
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
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
    height: 100,
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 24,
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
  // New simplified item design
  simpleReservationItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemDateTime: {
    fontSize: 12,
    fontWeight: '400',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  gestureContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayAnimated: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalHeader: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalDetailSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 12,
    padding: 16,
  },
  modalCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusTextWithMargin: {
    marginLeft: 8,
  },
  cancelButtonBg: {
    backgroundColor: '#EF4444',
  },
  scrollTopButtonDark: {
    backgroundColor: '#333',
    shadowColor: '#000',
  },
  scrollTopButtonLight: {
    backgroundColor: '#fff',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  },
});

// --- Exported styles for use by wrappers ---

export const reservationListStyles = styles;

// --- Place Config & Default Export ---

const placeConfig: ReservationConfig<PlaceReservation> = {
  fetchEndpoint: '/reservation-place/user',
  deleteEndpoint: '/reservation-place',
  getSubtitle: item => item.place?.name || '장소 이름 없음',
  renderModalDetails: (item, {labelColor, valueColor}) => (
    <>
      <View style={styles.modalDetailSection}>
        <Text style={[styles.modalLabel, {color: labelColor}]}>{'장소'}</Text>
        <Text style={[styles.modalValue, {color: valueColor}]}>
          {item.place?.name || '장소 이름 없음'}
        </Text>
      </View>
      {item.place?.location && (
        <View style={styles.modalDetailSection}>
          <Text style={[styles.modalLabel, {color: labelColor}]}>{'위치'}</Text>
          <Text style={[styles.modalValue, {color: valueColor}]}>
            {item.place.location}
          </Text>
        </View>
      )}
    </>
  ),
  emptyText: '장소 예약 내역이 없습니다.',
};

interface PlaceReservationListProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyReservation'>;
  refreshKey?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const PlaceReservationList: React.FC<PlaceReservationListProps> = props => (
  <ReservationList<PlaceReservation> config={placeConfig} {...props} />
);

export default PlaceReservationList;
