import {View, Text, StyleSheet, useColorScheme} from 'react-native';
import {MessageData} from '@interfaces/paxi';
import {textColor} from '@styles/default';

interface ChatMessageProps {
  message: MessageData;
}

const MyMessage = ({message}: {message: MessageData}) => {
  const createdTime = message.createdAt.slice(11, 16);

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
          color: '#9b9b9b',
          fontSize: 12,
          letterSpacing: -0.3,
          fontWeight: 'bold',
        }}>
        {createdTime}
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

const SystemMessage = ({message}: {message: MessageData}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
      }}>
      <View style={styles.systemMessageBubble}>
        <Text
          style={{
            fontSize: 12,
            color: '#000',
          }}>
          {message.message}
        </Text>
      </View>
    </View>
  );
};

const NormalMessage = ({message}: {message: MessageData}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const createdTime = message.createdAt.slice(11, 16);

  console.log(message);

  return (
    <View style={styles.messageContainer}>
      <View
        style={{
          width: 35,
          height: 35,
          borderRadius: 17.5,
          backgroundColor: '#ddd',
          marginRight: 8,
        }}
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
            {createdTime}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ChatMessage = ({message}: ChatMessageProps) => {
  const alignment = message.isMe ? 'flex-end' : 'flex-start';
  const isSystemMsg = message.senderUuid == null;

  return (
    <View style={{alignSelf: alignment}}>
      {message.isMe ? (
        <MyMessage message={message} />
      ) : isSystemMsg ? (
        <SystemMessage message={message} />
      ) : (
        <NormalMessage message={message} />
      )}
    </View>
  );
};

export default ChatMessage;

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  messageBubble: {
    backgroundColor: '#f2f3f5',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    maxWidth: 250,
  },
  createdTime: {
    fontSize: 12,
    letterSpacing: -0.3,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14,
    letterSpacing: -0.4,
    marginBottom: 4,
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

  systemMessageBubble: {
    paddingVertical: 7,
    width: '100%',
    alignItems: 'center',
  },
});
