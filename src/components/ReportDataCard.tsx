import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {textColor} from '@styles/default';

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

const ReportDataCard = ({
  reportData,
  isDarkMode,
  setReport,
}: ReportDataCardProps) => {
  const itemDescriptionStyle = [
    styles.itemDescription,
    {color: isDarkMode ? '#888' : '#666'},
  ];

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
          {new Date(reportData.createdAt).toLocaleString()} -{' '}
          {reportData.status === 'PENDING' ? '처리 중' : '처리 완료'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ReportDataCard;

const styles = StyleSheet.create({
  itemContainer: {
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
