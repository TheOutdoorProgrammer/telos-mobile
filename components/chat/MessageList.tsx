import { useRef, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { DraculaColors } from '../../constants/theme';
import { Message } from '../../types/chat';
import ChatBubble from './ChatBubble';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  emptyMessage?: string;
  onReviewChanges?: (proposalId: string) => void;
}

export default function MessageList({
  messages,
  isLoading = false,
  emptyMessage = 'No messages yet. Start a conversation!',
  onReviewChanges
}: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    if (messages.length > 0 && flatListRef.current) {
      // Try multiple times with delays to ensure it works
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 300);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 500);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble message={item} onReviewChanges={onReviewChanges} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={DraculaColors.purple} />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DraculaColors.background,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DraculaColors.background,
    padding: 20,
  },
  emptyText: {
    color: DraculaColors.comment,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: DraculaColors.current,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  loadingText: {
    color: DraculaColors.foreground,
    marginLeft: 8,
    fontSize: 14,
  },
});
