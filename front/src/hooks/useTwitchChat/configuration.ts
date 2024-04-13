import { TTSConfiguration, TTSMessage, TTSReplacement } from '../useTTS';

export const ttsDefaultConfig: TTSConfiguration = {
  selectedVoice: 'Microsoft Sabina - Spanish (Mexico)',
  userReplacement: [
    { regex: 'ckmu32', replaceWith: 'cristi' },
    { regex: 'bulbsum', replaceWith: 'bulbi' },
    { regex: 'guerra24_', replaceWith: 'lili' },
    { regex: 'ssmatiuri', replaceWith: 'matilda' },
  ],
  replacements: [
    { regex: '\\*quack\\*', regexFlags: 'gi', replaceWith: '' },
    { regex: '[g|j]+h*a+h*n+h*( ?)+[szx]+( ?)+o+', regexFlags: 'gi', replaceWith: 'pato' },
    { regex: 'cks+[o|ó|O|Ó]', regexFlags: 'gi', replaceWith: 'se caso' },
    { regex: '[\\uD83C-\\uFFFF]', regexFlags: 'g', replaceWith: '' },
    { regex: '_*', regexFlags: 'g', replaceWith: '' },
    { regex: '\\bck\\b', regexFlags: 'gi', replaceWith: 'cristi' },
    { regex: '\\bckmu\\b', regexFlags: 'gi',  replaceWith: 'cristi' },

    { regex: '[0-9a-zA-z]\\.[a-zA-Z][a-zA-Z]', replaceFullMessage: true, replaceWith: '$who a enviado un link.' },
    { regex: '^\\*.+\\*$', replaceWith: '$who $msg', replaceFullMessage: true,
      replacement: {
        regex: '\\*', regexFlags: 'gi', replaceWith: ''
      }
    },
  ]
};

export enum TTSMessageReplaceMentTokens {
  who = '$who',
  msg = '$msg'
}

export const applyTTSMessageTransformations = (message: TTSMessage, configuration: TTSConfiguration) => {
  const emotesToRead = 1;
  let emotesCount = 0;

  let messageToRead = message.parts
    .filter(msg => {
      if (msg.type === 'emote') {
        if (emotesCount >= emotesToRead) {
          return false;
        }
        emotesCount += 1;
        return true;
      }
      return true;
    })
    .map(msg => msg.originalContent)
    .join(' ');

  let sentBy = message.sentBy;

  configuration.userReplacement.forEach(replacement => {
    sentBy = applyReplacements(sentBy ?? '', {
      ...replacement,
      regex: `^${replacement.regex}$`,
      regexFlags: 'i'
    });
  });

  configuration.userReplacement.forEach(replacement => {
    messageToRead = applyReplacements(messageToRead, {
      ...replacement,
      regex: `\\b@?${replacement.regex}\\b`,
      regexFlags: 'gi',
    });
  });

  configuration.replacements.forEach(replacement => {
    messageToRead = applyReplacements(messageToRead, replacement, sentBy);
  });

  return messageToRead;
};

const applyReplacements = (msg: string, replacement: TTSReplacement, sentBy?: string): string => {
  let messageToRead = msg;

  const exp = new RegExp(replacement.regex, replacement.regexFlags);

  if (replacement.replaceFullMessage) {
    if (!exp.test(messageToRead)) return messageToRead;
    messageToRead = applyTokenReplacements(replacement.replaceWith, messageToRead, sentBy);
    if (replacement.replacement) {
      // do recurvie
      return applyReplacements(messageToRead, replacement.replacement, sentBy);
    }
    return messageToRead;
  }

  // TODO - weird cycle check at what point we want to replace
  const replaceWith = applyTokenReplacements(replacement.replaceWith, messageToRead, sentBy);
  const hasSomethingToReplace = exp.test(messageToRead);
  if (!hasSomethingToReplace) return messageToRead;

  messageToRead = messageToRead.replace(exp, replaceWith);
  if (!replacement.replacement) return messageToRead;
  // do recursive
  return applyReplacements(messageToRead, replacement.replacement, sentBy);
};

const applyTokenReplacements = (message: string, originalMsg: string, sentBy?: string) => {
  const whoExp = new RegExp('\\$who', 'gi');
  let parsedMessage = message.replace(whoExp, sentBy ?? '');

  const msgExp = new RegExp('\\$msg', 'gi');
  parsedMessage = parsedMessage.replace(msgExp, originalMsg);

  return parsedMessage;
};