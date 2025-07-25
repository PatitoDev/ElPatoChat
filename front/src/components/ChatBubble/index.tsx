import { useConfiguration } from '../../store/configuration';
import { ChatMessageData } from '../../types';
import ChatMsgHeader from './chatHeader';
import ChatMsgContent from './chatMsgContent';
import * as S from './styles';

export interface ChatMsgProps extends ChatMessageData {
}

const ChatMsg = (props: ChatMsgProps) => {
  const chatDirection = useConfiguration(state => state.chatDirection);

  return (
    <S.Message $direction={chatDirection}>
      <ChatMsgHeader direction={chatDirection} messageData={props} />
      <S.Content $userColor={props.color ?? 'black'} $effect={props.effect} $direction={chatDirection}>
        <ChatMsgContent userColor={props.color} messageParts={props.contentParts} />
      </S.Content>
    </S.Message>
  );
};

export default ChatMsg;