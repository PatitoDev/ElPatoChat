import { useEffect, useState } from 'react';
import Chat from '../../components/chat';
import { testMessages } from '../../examples';
import { ChatMessageData } from '../../types';
import { pickRandom } from '../../utils/randomUtils';
import * as S from './styles';
import { useDebounce } from '@uidotdev/usehooks';
import { elPatoApi } from '../../api/elpatoApi';
import { UserInformation } from '../../api/elpatoApi/types';
import { ChatWithTwitch } from '../../components/chat/ChatWithTwitch';
import { ChatVisualizerSettings } from './ChatVisualizerSettings.ts';
import { TTSSettings } from './TTSSettings/index.tsx';
import { UserReplacementSettings } from './UserReplacementSettings.ts/index.tsx';

const HomePage = () => {
  const [channelDetails, setChannelDetails] = useState<UserInformation | null>(null);
  const [channel, setChannel] = useState<string>('');
  const debouncedChannel = useDebounce(channel, 500);
  const [messages, setMessages] = useState<Array<ChatMessageData>>([]);

  useEffect(() => {
    const getUserDetails = async () => {
      const user = await elPatoApi.getUserDetails(debouncedChannel);
      if (!user.data) return;
      setChannelDetails(user.data);
    };

    getUserDetails();
  }, [debouncedChannel]);

  useEffect(() => {
    const onInterval = () => {
      setMessages((prevMessages) => (
        [
          { ...pickRandom(testMessages), id: `${Math.random()}` },
          ...prevMessages
        ].splice(0, 10)
      ));
    };
    const intervalRef = setInterval(onInterval, 1000);

    return () => { clearInterval(intervalRef); };
  }, []);

  return (
    <S.Page>

      <S.GlobalStyles />

      <S.ChatContainer>
        { channelDetails
          ? <ChatWithTwitch channelDetails={channelDetails} />
          : <Chat msgs={messages} /> 
        }
      </S.ChatContainer>

      <S.SettingsContainer>

        <S.SettingSectionCard>
          <S.InputSection>
            <h1>Channel</h1>
            <S.TextInput
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Nombre de twitch"
            />
          </S.InputSection>
        </S.SettingSectionCard>

        <S.ChatSettings>
          <ChatVisualizerSettings />
        </S.ChatSettings>

        <S.TTSSettings>
          <TTSSettings />
          <UserReplacementSettings />
        </S.TTSSettings>

      </S.SettingsContainer>
    </S.Page>
  );
};

export default HomePage;