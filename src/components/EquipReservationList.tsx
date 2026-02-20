import React from 'react';
import {Text, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import {
  ReservationList,
  BaseReservation,
  ReservationConfig,
  reservationListStyles,
} from './ReservationList';

interface Equipment {
  uuid: string;
  name: string;
  description: string;
  equipOwner: string;
  region: string;
  staffEmail: string;
  imageUrl: string;
}

interface EquipmentReservation extends BaseReservation {
  equipments: Equipment[];
}

const equipConfig: ReservationConfig<EquipmentReservation> = {
  fetchEndpoint: '/reservation-equip/user',
  deleteEndpoint: '/reservation-equip',
  getSubtitle: item => {
    const equipmentName =
      item.equipments.length > 0 ? item.equipments[0].name : '장비 정보 없음';
    const additionalEquipments =
      item.equipments.length > 1 ? ` 외 ${item.equipments.length - 1}개` : '';
    return `${equipmentName}${additionalEquipments}`;
  },
  renderModalDetails: (item, {labelColor, valueColor}) => (
    <View style={reservationListStyles.modalDetailSection}>
      <Text style={[reservationListStyles.modalLabel, {color: labelColor}]}>
        {`장비 목록 (${item.equipments.length})`}
      </Text>
      {item.equipments.map((equipment: Equipment) => (
        <Text
          key={equipment.uuid}
          style={[
            reservationListStyles.modalValue,
            {marginTop: 4, color: valueColor},
          ]}>
          - {equipment.name}
        </Text>
      ))}
    </View>
  ),
  emptyText: '장비 예약 내역이 없습니다.',
};

interface EquipReservationListProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyReservation'>;
  refreshKey?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const EquipReservationList: React.FC<EquipReservationListProps> = props => (
  <ReservationList<EquipmentReservation> config={equipConfig} {...props} />
);

export default EquipReservationList;
