import { View, StyleSheet, FlatList } from 'react-native';
import { Portal, Dialog, List, IconButton, Text, Divider } from 'react-native-paper';
import { ChatHistory } from '../../types/chat';
import { DraculaColors } from '../../constants/theme';

interface ChatHistoryModalProps {
  visible: boolean;
  onDismiss: () => void;
  chatHistories: ChatHistory[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatHistoryModal({
  visible,
  onDismiss,
  chatHistories,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatHistoryModalProps) {
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

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={styles.dialog}
      >
        <View style={styles.header}>
          <Dialog.Title style={styles.title}>Chat History</Dialog.Title>
          <IconButton
            icon="close"
            iconColor={DraculaColors.comment}
            size={20}
            onPress={onDismiss}
            style={styles.closeButton}
          />
        </View>

        <Dialog.Content style={styles.content}>
          {/* New Chat Button */}
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
            onPress={() => {
              onNewChat();
              onDismiss();
            }}
            style={styles.newChatItem}
          />

          <Divider style={styles.divider} />

          {/* Chat History List */}
          {chatHistories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No chat history yet</Text>
            </View>
          ) : (
            <FlatList
              data={chatHistories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <List.Item
                  title={item.title}
                  titleStyle={[
                    styles.chatTitle,
                    item.id === activeChatId && styles.activeChatTitle,
                  ]}
                  description={formatDate(item.lastUpdatedAt)}
                  descriptionStyle={styles.chatDescription}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="message-text"
                      color={
                        item.id === activeChatId
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
                      onPress={() => onDeleteChat(item.id)}
                    />
                  )}
                  onPress={() => {
                    if (item.id !== activeChatId) {
                      onSelectChat(item.id);
                      onDismiss();
                    }
                  }}
                  style={[
                    styles.chatItem,
                    item.id === activeChatId && styles.activeChatItem,
                  ]}
                />
              )}
              style={styles.list}
            />
          )}
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: DraculaColors.background,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  title: {
    color: DraculaColors.foreground,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  newChatItem: {
    backgroundColor: DraculaColors.current,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  newChatTitle: {
    color: DraculaColors.green,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: DraculaColors.comment,
    marginVertical: 8,
  },
  list: {
    maxHeight: 400,
  },
  chatItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
