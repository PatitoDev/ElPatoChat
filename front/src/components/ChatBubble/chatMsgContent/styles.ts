import styled from 'styled-components';

export const ContentExtras = styled.span`
  color: ${(props) => props.theme.chat.content.mention.text};
  background-color: ${(props) => props.theme.chat.content.mention.bg};
  border-radius: ${(props) => props.theme.chat.content.mention.borderRadius};
  border: ${(props) => props.theme.chat.content.mention.border};
  padding: ${(props) => props.theme.chat.content.mention.padding};

  display: inline-block;
  + * {
    margin-left: 0.3em;
  }
`;

export const Reply = styled(ContentExtras)`
  color: ${(props) => props.theme.chat.content.reply.text};
  background-color: ${(props) => props.theme.chat.content.reply.bg};
  border-radius: ${(props) => props.theme.chat.content.reply.borderRadius};
  border: ${(props) => props.theme.chat.content.reply.border};
  padding: ${(props) => props.theme.chat.content.reply.padding};
`;

export const Redemption = styled(ContentExtras)`
  display: block;

  color: ${(props) => props.theme.chat.content.reward.text};
  background-color: ${(props) => props.theme.chat.content.reward.bg};
  border-radius: ${(props) => props.theme.chat.content.reward.borderRadius};
  border: ${(props) => props.theme.chat.content.reward.border};
  padding: ${(props) => props.theme.chat.content.reward.padding};
`;