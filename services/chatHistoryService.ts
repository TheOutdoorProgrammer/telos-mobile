import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatHistory, Message } from '../types/chat';

const CHAT_HISTORY_PREFIX = 'chat_history_';
const CHAT_LIST_KEY = 'chat_history_list';

/**
 * Generate a storage key for a specific chat history
 */
function getChatKey(chatId: string): string {
  return `${CHAT_HISTORY_PREFIX}${chatId}`;
}

/**
 * Save a chat history to storage
 */
export async function saveChatHistory(chatHistory: ChatHistory): Promise<void> {
  try {
    const key = getChatKey(chatHistory.id);
    const serialized = JSON.stringify({
      ...chatHistory,
      createdAt: chatHistory.createdAt.toISOString(),
      lastUpdatedAt: chatHistory.lastUpdatedAt.toISOString(),
      messages: chatHistory.messages.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      })),
    });
    await AsyncStorage.setItem(key, serialized);

    // Update the chat list index
    await addToChatList(chatHistory.id, chatHistory.fileId);
  } catch (error) {
    console.error('Error saving chat history:', error);
    throw new Error('Failed to save chat history');
  }
}

/**
 * Load a specific chat history from storage
 */
export async function loadChatHistory(chatId: string): Promise<ChatHistory | null> {
  try {
    const key = getChatKey(chatId);
    const serialized = await AsyncStorage.getItem(key);

    if (!serialized) {
      return null;
    }

    const data = JSON.parse(serialized);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      lastUpdatedAt: new Date(data.lastUpdatedAt),
      messages: data.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    };
  } catch (error) {
    console.error('Error loading chat history:', error);
    return null;
  }
}

/**
 * Load all chat histories for a specific file
 */
export async function loadChatHistoriesForFile(fileId: string): Promise<ChatHistory[]> {
  try {
    const chatList = await getChatList();
    const fileChats = chatList.filter(item => item.fileId === fileId);

    const histories = await Promise.all(
      fileChats.map(item => loadChatHistory(item.chatId))
    );

    return histories.filter((h): h is ChatHistory => h !== null);
  } catch (error) {
    console.error('Error loading chat histories for file:', error);
    return [];
  }
}

/**
 * Delete a chat history
 */
export async function deleteChatHistory(chatId: string): Promise<void> {
  try {
    const key = getChatKey(chatId);
    await AsyncStorage.removeItem(key);
    await removeFromChatList(chatId);
  } catch (error) {
    console.error('Error deleting chat history:', error);
    throw new Error('Failed to delete chat history');
  }
}

/**
 * Create a new chat history
 */
export function createChatHistory(fileId: string, firstMessage?: Message): ChatHistory {
  const now = new Date();
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Format timestamp as title (e.g., "Dec 13, 2025 2:45 AM")
  let title = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (firstMessage && firstMessage.role === 'user') {
    // Use first 50 chars of first user message as title
    title = firstMessage.content.substring(0, 50).trim();
    if (firstMessage.content.length > 50) {
      title += '...';
    }
  }

  return {
    id: chatId,
    fileId,
    title,
    messages: firstMessage ? [firstMessage] : [],
    createdAt: now,
    lastUpdatedAt: now,
  };
}

/**
 * Update chat title
 */
export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  try {
    const chatHistory = await loadChatHistory(chatId);
    if (chatHistory) {
      chatHistory.title = title;
      chatHistory.lastUpdatedAt = new Date();
      await saveChatHistory(chatHistory);
    }
  } catch (error) {
    console.error('Error updating chat title:', error);
    throw new Error('Failed to update chat title');
  }
}

// Internal helper functions for maintaining chat list index

interface ChatListItem {
  chatId: string;
  fileId: string;
}

async function getChatList(): Promise<ChatListItem[]> {
  try {
    const serialized = await AsyncStorage.getItem(CHAT_LIST_KEY);
    return serialized ? JSON.parse(serialized) : [];
  } catch (error) {
    console.error('Error loading chat list:', error);
    return [];
  }
}

async function addToChatList(chatId: string, fileId: string): Promise<void> {
  try {
    const list = await getChatList();
    const exists = list.some(item => item.chatId === chatId);

    if (!exists) {
      list.push({ chatId, fileId });
      await AsyncStorage.setItem(CHAT_LIST_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.error('Error adding to chat list:', error);
  }
}

async function removeFromChatList(chatId: string): Promise<void> {
  try {
    const list = await getChatList();
    const filtered = list.filter(item => item.chatId !== chatId);
    await AsyncStorage.setItem(CHAT_LIST_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from chat list:', error);
  }
}
