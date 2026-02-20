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
      item.equipments.length > 0 ? item.equipments[0].name : '\uc7a5\ube44 \uc815\ubcf4 \uc5c6\uc74c';
    const additionalEquipments =
      item.equipments.length > 1 ? ` \uc678 ${item.equipments.length - 1}\uac1c` : '';
    return `${equipmentName}${additionalEquipments}`;
  },
  renderModalDetails: (item, {labelColor, valueColor}) => (
    <View style={reservationListStyles.modalDetailSection}>
      <Text style={[reservationListStyles.modalLabel, {color: labelColor}]}>
        {`\uc7a5\ube44 \ubaa9\ub85d (${item.equipments.length})`}
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
  emptyText: '\uc7a5\ube44 \uc608\uc57d \ub0b4\uc5ed\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.',
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
