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
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import axios from 'axios';
import paxi_api from '../../utils/paxi_api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

interface RoomData {
  title: string;
  uuid: string;
  status: string;
  departureTime: string;
  departureLocation: string;
  destinationLocation: string;
}

interface TaxiChatListProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyReservation'>;
}

const TaxiChatList: React.FC<TaxiChatListProps> = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatRooms, setChatRooms] = useState<RoomData[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<FlatList>(null);

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#333333' : '#E5E7EB';

  const fetchReservations = async () => {
    try {
      const response = await paxi_api.get<RoomData[]>('/room/my');

      console.log(response.data);

      setChatRooms(response.data);
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
  }, []);

  const renderReservationItem = ({item}: {item: RoomData}) => (
    <TouchableOpacity
      style={{
        paddingVertical: 12,
        paddingHorizontal: 4,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
      }}
      onPress={() =>
        navigation.navigate('NewChat', {
          roomUuid: item.uuid,
          from: 'myReservation',
        })
      }>
      <View style={{flex: 1}}>
        <Text
          style={[styles.reservationTitle, {color: textColor}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text
          style={[styles.fromToText, {color: textColor}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {`${item.departureLocation} → ${item.destinationLocation}`}
        </Text>
        <Text
          style={[
            styles.detailValue,
            {color: textColor, marginTop: 4, fontSize: 14, fontWeight: '400'},
          ]}>
          {moment(item.departureTime).format('YYYY-MM-DD HH:mm')} 출발
        </Text>
      </View>
      <View
        style={{
          width: 48,
          height: 48,
          backgroundColor: '#F3F4F6',
          borderRadius: 8,
          marginLeft: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Icon name="message" size={22} color="#222" />
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoading) {
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

  if (chatRooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../../../assets/icon/POPO_typography_bg_removed_cropped.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={[styles.emptyText, {color: textColor}]}>
          택시 예약 내역이 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        ref={listRef}
        data={chatRooms}
        renderItem={renderReservationItem}
        keyExtractor={item => item.uuid}
        contentContainerStyle={styles.listContainer}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
    flex: 1,
    paddingHorizontal: 16,
  },
  reservationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
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
  fromToText: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
    marginBottom: 4,
  },
});

export default TaxiChatList;
