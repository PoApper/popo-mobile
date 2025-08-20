import {View} from 'react-native';

import {MessageData} from '@interfaces/paxi';
import MyMessage from '@components/chat/MyMessage';
import SystemMessage from '@components/chat/SystemMessage';
import ParticipantMessage from '@components/chat/ParticipantMessage';

interface ChatMessageProps {
  message: MessageData;
  user_uuid: string;
  handleUserClick: (msgData: MessageData) => void;
  handleMyMsgClick: (msgData: MessageData) => void;
}

const ChatMessage = ({
  message,
  user_uuid,
  handleUserClick,
  handleMyMsgClick,
}: ChatMessageProps) => {
  const alignment =
    message.senderUuid === user_uuid ? 'flex-end' : 'flex-start';
  const isSystemMsg = message.senderUuid == null;

  return (
    <View style={{alignSelf: alignment, marginBottom: 10}}>
      {message.senderUuid === user_uuid ? (
        <MyMessage message={message} handleMyMsgClick={handleMyMsgClick} />
      ) : isSystemMsg ? (
        <SystemMessage message={message} />
      ) : (
        <ParticipantMessage
          message={message}
          handleUserClick={handleUserClick}
        />
      )}
    </View>
  );
};

export default ChatMessage;
