import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Image,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';

import {MessageData} from '@interfaces/paxi';
import {textColor} from '@styles/default';
import {getColor} from '@utils/userchat-background';

interface ParticipantMessageProps {
  message: MessageData;
  handleUserClick: (msgData: MessageData) => void;
}

const ParticipantMessage = ({
  message,
  handleUserClick,
}: ParticipantMessageProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.messageContainer}>
      <TouchableOpacity onPress={() => handleUserClick(message)}>
        <Image
          source={require('../../../assets/baby_phonix.png')}
          style={[
            styles.profileImg,
            {backgroundColor: getColor(message.senderNickname)},
          ]}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View>
        <Text style={[styles.messageSender, {color: textColor(isDarkMode)}]}>
          {message.senderNickname ?? 'senderName'}
        </Text>
        <View style={styles.messageArea}>
            <View
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
              {message.isDeleted ? (
                <Text
                  style={[
                    styles.messageText,
                    {color: '#9b9b9b'},
                  ]}>
                  삭제됨
                </Text>
              ) : (
                <>
                  <Text
                    style={[
                      styles.messageText,
                      {color: textColor(isDarkMode)},
                    ]}>
                    {message.message}
                  </Text>
                  {message.isEdited && (
                    <Text style={styles.editedText}>수정됨</Text>
                  )}
                </>
              )}
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
    alignItems: 'flex-start',
    maxWidth: '80%',
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
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    maxWidth: '90%',
  },
  messageText: {
    fontSize: 14,
    letterSpacing: -0.4,
  },
  createdTime: {
    fontSize: 12,
    letterSpacing: -0.3,
    fontWeight: 'bold',
    color: '#9b9b9b',
  },
  editedText: {
    color: '#9b9b9b',
    fontSize: 12,
    letterSpacing: -0.3,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
});
