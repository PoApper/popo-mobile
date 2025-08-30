import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {textColor} from '@styles/default';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface ReportData {
  id: number;
  reporterUuid: string;
  reporterEmail: string;
  reporterNickname: string;
  targetUserUuid: string;
  targetUserEmail: string;
  targetUserNickname: string;
  targetRoomUuid: string;
  targetRoomName: string;
  reason: string;
  status: string;
  resolverName: string;
  resolutionMessage: string;
  createdAt: string;
}

interface ReportDataCardProps {
  reportData: ReportData;
  isDarkMode: boolean;
  setReport: (report: ReportData) => void;
}

const getReportStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return {name: 'task-alt', color: '#10B981'};
    case 'PENDING':
      return {name: 'hourglass-empty', color: '#F59E0B'};
    default:
      return {name: 'help', color: '#6B7280'};
  }
};

const ReportDataCard = ({
  reportData,
  isDarkMode,
  setReport,
}: ReportDataCardProps) => {
  const itemDescriptionStyle = [
    styles.itemDescription,
    {color: isDarkMode ? '#888' : '#666'},
  ];

  const iconData = getReportStatusIcon(reportData.status);

  return (
    <TouchableOpacity
      style={[styles.itemContainer]}
      onPress={() => setReport(reportData)}>
      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, {color: textColor(isDarkMode)}]}>
          ID{reportData.id} {reportData.targetUserNickname} 신고
        </Text>
        <Text style={[itemDescriptionStyle, {color: '#cacaca'}]}>
          사유) {reportData.reason}
        </Text>
        <Text style={itemDescriptionStyle}>
          {new Date(reportData.createdAt).toLocaleString()}
        </Text>
      </View>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#222',
        }}>
        <Icon name={iconData.name} size={24} color={iconData.color} />
      </View>
    </TouchableOpacity>
  );
};

export default ReportDataCard;

const styles = StyleSheet.create({
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  textContainer: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
  },
});
