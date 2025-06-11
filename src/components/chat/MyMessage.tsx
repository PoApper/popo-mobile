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
          gap: 5,
        },
      ]}>
      <Text
        style={{
          color: textColor(isDarkMode),
          fontSize: 12,
          letterSpacing: -0.3,
          fontWeight: 'bold',
        }}>
        {moment(message.createdAt).format('HH:mm')}
      </Text>
      <View style={styles.messageBubble}>
        <Text
          style={{
            fontSize: 14,
            letterSpacing: -0.4,
            color: '#000',
            marginBottom: 4,
          }}>
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
    backgroundColor: '#f2f3f5',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
});
