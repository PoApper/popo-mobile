import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import moment from 'moment';

import {MessageData} from '@interfaces/paxi';
import {textColor} from '@styles/default';
import {getColor} from '@utils/userchat-background';

interface ParticipantMessageProps {
  message: MessageData;
}

const ParticipantMessage = ({message}: ParticipantMessageProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.messageContainer}>
      <Image
        source={require('../../../assets/baby_phonix.png')}
        style={[styles.profileImg, {backgroundColor: getColor(message.senderNickname)}]}
        resizeMode="contain"
      />
      <View>
        <Text style={[styles.messageSender, {color: textColor(isDarkMode)}]}>
          {message.senderNickname ?? 'senderName'}
        </Text>
        <View style={styles.messageArea}>
          <View
            style={[
              styles.messageBubble,
              {backgroundColor: isDarkMode ? '#23262B' : '#f2f3f5'},
            ]}>
            <Text style={[styles.messageText, {color: textColor(isDarkMode)}]}>
              {message.message}
            </Text>
          </View>
          <Text style={[styles.createdTime, {color: textColor(isDarkMode)}]}>
            {moment(message.createdAt).format('HH:mm')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ParticipantMessage;

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '90%',
    gap: 5,
  },
  profileImg: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 8,
  },
  messageSender: {
    fontSize: 13,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  messageArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  messageBubble: {
    backgroundColor: '#f2f3f5',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    maxWidth: '90%',
  },
  messageText: {
    fontSize: 14,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  createdTime: {
    fontSize: 12,
    letterSpacing: -0.3,
    fontWeight: 'bold',
  },
});
