import { useCallback, useEffect, useState } from 'react';
import { applyTTSMessageTransformations } from './useTwitchChat/configuration';
import { MessagePart } from '../types';

export interface TTSReplacement {
  regex: string,
  regexFlags?: string,
  replaceWith: string,
  replaceFullMessage?: boolean,
  replacement?: TTSReplacement,
}

export interface TTSConfiguration {
  selectedVoice?: string,
  userReplacement: Array<TTSReplacement>,
  replacements: Array<TTSReplacement>,
}

export interface TTSMessage {
  id: string,
  parts: Array<MessagePart>,
  content: string,
  sentBy?: string,
}

export const useTTS = (configuration: TTSConfiguration) => {
  const [messagesToRead, setMessagesToRead] = useState<Array<TTSMessage>>([]);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [voices, setVoices] = useState<Array<SpeechSynthesisVoice>>([]);

  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') {
      console.log('speach synthesis is not suported');
      return;
    }

    const onVoicesChange = () => {
      const voices = speechSynthesis.getVoices();
      setVoices(voices);
    };

    onVoicesChange();

    speechSynthesis.addEventListener('voiceschanged', onVoicesChange);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', onVoicesChange);
    };
  }, []);

  const speakInternal = useCallback((message: TTSMessage, onEnd: () => void) => {
    // parse
    const messageToRead = applyTTSMessageTransformations(message, configuration);

    // speak
    const utterance = new SpeechSynthesisUtterance(messageToRead);
    const voices = speechSynthesis.getVoices();
    const foundVoice = voices.find(v => (v.voiceURI === configuration.selectedVoice));
    utterance.voice = foundVoice ?? null;
    speechSynthesis.speak(utterance);
    utterance.addEventListener('end', onEnd);
  }, [configuration]);

  useEffect(() => {
    const continueReadingChat = () => {
      if (currentMessageId !== null)
        return;

      const messageToRead = messagesToRead.at(0);
      if (!messageToRead) return;

      setMessagesToRead(prev => prev
        .filter(msg => msg.id !== messageToRead.id)
      );

      setCurrentMessageId(messageToRead.id);
      speakInternal(messageToRead, () => {
        setCurrentMessageId(null);
      });
    };

    continueReadingChat();

  }, [messagesToRead, speakInternal, currentMessageId]);

  const onRemoveMessage = useCallback((messageIds: Array<string>) => {
    if (currentMessageId !== null && messageIds.includes(currentMessageId)) {
      // is currentlty playing a message we want to remove
      speechSynthesis.cancel();
      setCurrentMessageId(null);
    }

    setMessagesToRead(msgs => msgs.filter(msg =>
      !messageIds.includes(msg.id)
    ));
  }, [currentMessageId]);

  const speakExternal = useCallback((message: TTSMessage) => {
    setMessagesToRead(prev => [...prev, message]);
  }, []);

  const clearQueue = useCallback(() => {
    setMessagesToRead([]);
    setCurrentMessageId(null);
    speechSynthesis.cancel();
  }, []);

  return {
    clearQueue,
    onRemoveMessage,
    speak: speakExternal,
    voices,
  };
};