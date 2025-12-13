import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { DraculaColors } from '../../constants/theme';
import { TCFFile } from '../../types/telos';

interface TCFPreviewProps {
  file: TCFFile;
}

export default function TCFPreview({ file }: TCFPreviewProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          {file.name}
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Last updated: {file.updatedAt.toLocaleDateString()}
        </Text>
      </View>

      <Divider style={styles.divider} />

      <Surface style={styles.contentSurface} elevation={0}>
        {file.content.trim() ? (
          <Markdown style={markdownStyles}>{file.content}</Markdown>
        ) : (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              This Telos file is empty
            </Text>
            <Text variant="bodyMedium" style={styles.emptyHint}>
              Start a chat to build your Telos context
            </Text>
          </View>
        )}
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DraculaColors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: DraculaColors.foreground,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: DraculaColors.comment,
  },
  divider: {
    backgroundColor: DraculaColors.comment,
    marginBottom: 16,
  },
  contentSurface: {
    backgroundColor: DraculaColors.current,
    borderRadius: 12,
    padding: 16,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: DraculaColors.comment,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    color: DraculaColors.comment,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

const markdownStyles = {
  body: {
    color: DraculaColors.foreground,
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    color: DraculaColors.purple,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  heading2: {
    color: DraculaColors.purple,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 10,
  },
  heading3: {
    color: DraculaColors.cyan,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  heading4: {
    color: DraculaColors.cyan,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    color: DraculaColors.foreground,
    marginVertical: 4,
    lineHeight: 24,
  },
  code_inline: {
    backgroundColor: DraculaColors.background,
    color: DraculaColors.green,
    fontFamily: 'Courier',
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: DraculaColors.background,
    color: DraculaColors.green,
    fontFamily: 'Courier',
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  fence: {
    backgroundColor: DraculaColors.background,
    color: DraculaColors.green,
    fontFamily: 'Courier',
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
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
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    color: DraculaColors.foreground,
    marginVertical: 3,
    lineHeight: 22,
  },
  blockquote: {
    backgroundColor: DraculaColors.background,
    borderLeftColor: DraculaColors.purple,
    borderLeftWidth: 4,
    paddingLeft: 16,
    paddingVertical: 12,
    marginVertical: 12,
  },
  hr: {
    backgroundColor: DraculaColors.comment,
    height: 2,
    marginVertical: 16,
  },
};
