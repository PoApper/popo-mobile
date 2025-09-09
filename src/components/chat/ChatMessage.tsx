import {View} from 'react-native';

import {MessageData} from '@interfaces/paxi';
import MyMessage from '@components/chat/MyMessage';
import SystemMessage from '@components/chat/SystemMessage';
import ParticipantMessage from '@components/chat/ParticipantMessage';

interface ChatMessageProps {
  message: MessageData;
  userUuid: string;
  handleUserClick: (msgData: MessageData) => void;
  handleMyMsgClick: (msgData: MessageData) => void;
}

const ChatMessage = ({
  message,
  userUuid,
  handleUserClick,
  handleMyMsgClick,
}: ChatMessageProps) => {
  const alignment = message.senderUuid === userUuid ? 'flex-end' : 'flex-start';
  const isSystemMsg = message.senderUuid == null;

  return (
    <View style={{alignSelf: alignment, marginBottom: 10}}>
      {message.senderUuid === userUuid ? (
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
