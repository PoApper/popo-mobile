import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {MessageData} from '@interfaces/paxi';
import {textColor} from '@styles/default';
import moment from 'moment';

interface MyMessageProps {
  message: MessageData;
  handleMyMsgClick: (msgData: MessageData) => void;
}

const MyMessage = ({message, handleMyMsgClick}: MyMessageProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.messageContainer,
        {
          flexDirection: 'row',
          alignItems: 'flex-end',
          maxWidth: '90%',
          gap: 5,
        },
      ]}>
      <Text style={styles.timeText}>
        {moment(message.createdAt).format('HH:mm')}
      </Text>
      <TouchableOpacity
        onLongPress={() => !message.isDeleted && handleMyMsgClick(message)}
        disabled= {message.isDeleted}
        style={[
          styles.messageBubble,
          {
            backgroundColor: message.isDeleted
              ? isDarkMode
                ? '#2a2d31'
                : '#e9eaec'
              : isDarkMode
              ? '#23262B'
              : '#f2f3f5',
          },
        ]}>
        <Text
          style={[
            styles.messageText,
            {color: message.isDeleted ? '#9b9b9b' : textColor(isDarkMode)},
          ]}>
          {message.isDeleted ? '삭제됨' : message.message}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MyMessage;

const styles = StyleSheet.create({
  messageContainer: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    maxWidth: '90%',
  },
  timeText: {
    color: '#9b9b9b',
    fontSize: 12,
    letterSpacing: -0.3,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    letterSpacing: -0.4,
    flexWrap: 'wrap',
    lineHeight: 18,
  },
});
