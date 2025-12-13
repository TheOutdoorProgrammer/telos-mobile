import { View, StyleSheet } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { DraculaColors } from '../../constants/theme';
import { Message } from '../../types/chat';

interface ChatBubbleProps {
  message: Message;
  onReviewChanges?: (proposalId: string) => void;
}

export default function ChatBubble({ message, onReviewChanges }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const hasProposal = !isUser && message.proposalId;

  // Clean up message content to prevent rendering issues
  let cleanContent = message.content;

  if (!isUser) {
    // Normalize line endings and clean up excessive whitespace
    cleanContent = cleanContent
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <Surface
        style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}
        elevation={1}
      >
        {isUser ? (
          <Text style={[styles.text, styles.userText]}>
            {cleanContent}
          </Text>
        ) : (
          <View style={{ width: '100%' }}>
            <Markdown style={markdownStyles}>
              {cleanContent}
            </Markdown>
          </View>
        )}
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Surface>

      {hasProposal && onReviewChanges && (
        <Button
          mode="contained"
          onPress={() => onReviewChanges(message.proposalId!)}
          style={styles.reviewButton}
          buttonColor={DraculaColors.purple}
          textColor={DraculaColors.background}
          icon="file-document-edit"
          compact
        >
          Review Changes
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  userContainer: {
    alignItems: 'flex-end',
    width: '80%',
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
    width: '80%',
  },
  reviewButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    width: '100%',
  },
  userBubble: {
    backgroundColor: DraculaColors.purple,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: DraculaColors.current,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: DraculaColors.background,
  },
  assistantText: {
    color: DraculaColors.foreground,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    color: DraculaColors.comment,
  },
});

const markdownStyles = {
  body: {
    color: DraculaColors.foreground,
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  paragraph: {
    color: DraculaColors.foreground,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 0,
    marginBottom: 8,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  text: {
    color: DraculaColors.foreground,
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  heading1: {
    color: DraculaColors.purple,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    color: DraculaColors.purple,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
  },
  heading3: {
    color: DraculaColors.cyan,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: DraculaColors.background,
    color: DraculaColors.green,
    fontFamily: 'Courier',
    fontSize: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: DraculaColors.background,
    color: DraculaColors.green,
    fontFamily: 'Courier',
    fontSize: 14,
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  fence: {
    backgroundColor: DraculaColors.background,
    color: DraculaColors.green,
    fontFamily: 'Courier',
    fontSize: 14,
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  strong: {
    color: DraculaColors.orange,
    fontWeight: 'bold',
  },
  em: {
    color: DraculaColors.yellow,
    fontStyle: 'italic',
  },
  link: {
    color: DraculaColors.cyan,
    textDecorationLine: 'underline',
  },
  bullet_list: {
    marginVertical: 4,
    flexShrink: 1,
  },
  ordered_list: {
    marginVertical: 4,
    flexShrink: 1,
  },
  list_item: {
    color: DraculaColors.foreground,
    marginVertical: 2,
    flexDirection: 'row',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  blockquote: {
    backgroundColor: DraculaColors.background,
    borderLeftColor: DraculaColors.purple,
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  hr: {
    backgroundColor: DraculaColors.comment,
    height: 1,
    marginVertical: 12,
  },
};
