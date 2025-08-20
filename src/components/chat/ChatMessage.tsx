import {View} from 'react-native';

import {MessageData} from '@interfaces/paxi';
import MyMessage from '@components/chat/MyMessage';
import SystemMessage from '@components/chat/SystemMessage';
import ParticipantMessage from '@components/chat/ParticipantMessage';

interface ChatMessageProps {
  message: MessageData;
  user_uuid: string;
  setShowChatOptions: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedMsgData: React.Dispatch<React.SetStateAction<MessageData>>;
}

const ChatMessage = ({
  message,
  user_uuid,
  setShowChatOptions,
  setSelectedMsgData,
}: ChatMessageProps) => {
  const alignment =
    message.senderUuid === user_uuid ? 'flex-end' : 'flex-start';
  const isSystemMsg = message.senderUuid == null;

  return (
    <View style={{alignSelf: alignment, marginBottom: 10}}>
      {message.senderUuid === user_uuid ? (
        <MyMessage
          message={message}
          setShowChatOptions={setShowChatOptions}
          setSelectedMsgData={setSelectedMsgData}
        />
      ) : isSystemMsg ? (
        <SystemMessage message={message} />
      ) : (
        <ParticipantMessage message={message} />
      )}
    </View>
  );
};

export default ChatMessage;
