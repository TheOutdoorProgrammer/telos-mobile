import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, List, IconButton, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { DraculaColors } from '../constants/theme';
import { useTelosStore } from '../stores/useTelosStore';

export default function ChatHistory() {
  const router = useRouter();
  const {
    chatHistories,
    activeChatHistory,
    selectChatHistory,
    createNewChat,
    deleteChatHistory,
  } = useTelosStore();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleNewChat = async () => {
    await createNewChat();
    router.back();
  };

  const handleSelectChat = async (chatId: string) => {
    await selectChatHistory(chatId);
    router.back();
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChatHistory(chatId);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={DraculaColors.foreground} />
        <Appbar.Content title="Chat History" titleStyle={{ color: DraculaColors.foreground }} />
      </Appbar.Header>

      <FlatList
        data={[{ id: 'new-chat', isNewButton: true }, ...chatHistories]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chat history yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          // New Chat button
          if ('isNewButton' in item && item.isNewButton) {
            return (
              <List.Item
                title="New Chat"
                titleStyle={styles.newChatTitle}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="plus-circle"
                    color={DraculaColors.green}
                  />
                )}
                onPress={handleNewChat}
                style={styles.newChatItem}
              />
            );
          }

          // Chat history item
          return (
            <List.Item
              title={item.title}
              titleStyle={[
                styles.chatTitle,
                item.id === activeChatHistory?.id && styles.activeChatTitle,
              ]}
              description={formatDate(item.lastUpdatedAt)}
              descriptionStyle={styles.chatDescription}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="message-text"
                  color={
                    item.id === activeChatHistory?.id
                      ? DraculaColors.purple
                      : DraculaColors.comment
                  }
                />
              )}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="delete"
                  iconColor={DraculaColors.red}
                  size={20}
                  onPress={() => handleDeleteChat(item.id)}
                />
              )}
              onPress={() => {
                if (item.id !== activeChatHistory?.id) {
                  handleSelectChat(item.id);
                }
              }}
              style={[
                styles.chatItem,
                item.id === activeChatHistory?.id && styles.activeChatItem,
              ]}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DraculaColors.background,
  },
  header: {
    backgroundColor: DraculaColors.current,
  },
  listContainer: {
    padding: 16,
  },
  newChatItem: {
    backgroundColor: DraculaColors.current,
    marginBottom: 12,
    borderRadius: 8,
  },
  newChatTitle: {
    color: DraculaColors.green,
    fontWeight: '600',
  },
  chatItem: {
    marginBottom: 8,
    borderRadius: 8,
  },
  activeChatItem: {
    backgroundColor: DraculaColors.current,
  },
  chatTitle: {
    color: DraculaColors.foreground,
  },
  activeChatTitle: {
    color: DraculaColors.purple,
    fontWeight: '600',
  },
  chatDescription: {
    color: DraculaColors.comment,
    fontSize: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: DraculaColors.comment,
    fontStyle: 'italic',
  },
});
