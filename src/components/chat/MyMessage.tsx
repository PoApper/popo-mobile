import {View, Text, useColorScheme, StyleSheet} from 'react-native';
import {MessageData} from '@interfaces/paxi';
import {textColor} from '@styles/default';
import moment from 'moment';

const MyMessage = ({message}: {message: MessageData}) => {
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
      <View
        style={[
          styles.messageBubble,
          {backgroundColor: isDarkMode ? '#23262B' : '#f2f3f5'},
        ]}>
        <Text style={[styles.messageText, {color: textColor(isDarkMode)}]}>
          {message.message}
        </Text>
      </View>
    </View>
  );
};

export default MyMessage;

const styles = StyleSheet.create({
  messageContainer: {
    alignSelf: 'flex-end',
    marginBottom: 10,
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
