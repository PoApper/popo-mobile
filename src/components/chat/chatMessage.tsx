import {View, Text, StyleSheet, useColorScheme} from 'react-native';
import {MessageData} from '../../types/paxi';
import {textColor} from '../../styles/default';

interface ChatMessageProps {
  message: MessageData;
}

const ChatMessage = ({message}: ChatMessageProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const alignment = message.isMe ? 'flex-end' : 'flex-start';
  const createdTime = message.createdAt.slice(11, 16);
  // const isSystemMsg = item.senderUuid == null;

  return (
    <View style={{alignSelf: alignment}}>
      <View style={messageStyle.messageContainer}>
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
          <Text
            style={[
              messageStyle.messageSender,
              {color: textColor(isDarkMode)},
            ]}>
            {message.senderName ?? 'senderName'}
          </Text>
          <View style={messageStyle.messageArea}>
            <View style={messageStyle.messageBubble}>
              <Text
                style={[
                  messageStyle.messageText,
                  {color: textColor(isDarkMode)},
                ]}>
                {message.message}
              </Text>
            </View>
            <Text
              style={[
                messageStyle.createdTime,
                {color: textColor(isDarkMode)},
              ]}>
              {createdTime}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ChatMessage;

const messageStyle = StyleSheet.create({
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
});
