import React from 'react';
import {Text, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@navigation/types';
import i18next from '@utils/i18n';
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
      item.equipments.length > 0
        ? item.equipments[0].name
        : i18next.t('myReservation.equipInfoMissing');
    const extra = item.equipments.length - 1;
    return extra > 0
      ? i18next.t('reservation.equipmentWithMore', {
          first: equipmentName,
          count: extra,
        })
      : equipmentName;
  },
  renderModalDetails: (item, {labelColor, valueColor}) => (
    <View style={reservationListStyles.modalDetailSection}>
      <Text style={[reservationListStyles.modalLabel, {color: labelColor}]}>
        {i18next.t('myReservation.equipList', {count: item.equipments.length})}
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
  getEmptyText: () => i18next.t('myReservation.equipEmpty'),
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
