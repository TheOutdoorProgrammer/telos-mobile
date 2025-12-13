import { create } from 'zustand';
import { TCFFile } from '../types/telos';
import { Message, ChatHistory } from '../types/chat';
import { Proposal } from '../types/approval';
import { CLAUDE_API_CONFIG } from '../constants/config';
import * as tcfService from '../services/tcfService';
import * as chatHistoryService from '../services/chatHistoryService';

interface TelosStore {
  // Files state
  files: TCFFile[];
  activeFile: TCFFile | null;
  isLoadingFiles: boolean;

  // Chat state
  messages: Message[]; // Current chat messages (for backward compatibility)
  activeChatHistory: ChatHistory | null;
  chatHistories: ChatHistory[]; // All chat histories for active file
  isLoadingMessage: boolean;

  // Approval state
  pendingProposal: Proposal | null;
  isProcessingProposal: boolean;
  justApprovedProposal: boolean;
  approvalTimestamp: number;

  // API Key
  apiKey: string | null;

  // Model selection
  selectedModel: string;

  // File actions
  loadFiles: () => Promise<void>;
  selectFile: (fileId: string) => Promise<void>;
  createFile: (name: string) => Promise<TCFFile>;
  updateFile: (fileId: string, content: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  exportFile: (fileId: string) => Promise<string>;
  importFile: (name: string, content: string) => Promise<TCFFile>;

  // Chat actions
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  setLoadingMessage: (isLoading: boolean) => void;

  // Chat history actions
  loadChatHistories: (fileId: string) => Promise<void>;
  createNewChat: () => Promise<void>;
  selectChatHistory: (chatId: string) => Promise<void>;
  deleteChatHistory: (chatId: string) => Promise<void>;
  saveCurrentChatHistory: () => Promise<void>;

  // Approval actions
  setProposal: (proposal: Proposal) => void;
  approveProposal: (onApproved?: () => void) => Promise<void>;
  rejectProposal: () => void;
  updateProposal: (proposedContent: string) => void;

  // API Key actions
  setApiKey: (key: string) => void;

  // Model actions
  setSelectedModel: (model: string) => Promise<void>;

  // Initialization
  initialize: () => Promise<void>;
}

export const useTelosStore = create<TelosStore>((set, get) => ({
  // Initial state
  files: [],
  activeFile: null,
  isLoadingFiles: false,
  messages: [],
  activeChatHistory: null,
  chatHistories: [],
  isLoadingMessage: false,
  pendingProposal: null,
  isProcessingProposal: false,
  justApprovedProposal: false,
  approvalTimestamp: 0,
  apiKey: null,
  selectedModel: '', // Will be set from API-fetched models

  // File actions
  loadFiles: async () => {
    set({ isLoadingFiles: true });
    try {
      const files = await tcfService.loadTCFFiles();
      set({ files, isLoadingFiles: false });
    } catch (error) {
      console.error('Error loading files:', error);
      set({ isLoadingFiles: false });
    }
  },

  selectFile: async (fileId: string) => {
    const file = get().files.find(f => f.id === fileId);
    if (file) {
      set({ activeFile: file, messages: [], activeChatHistory: null });

      // Load chat histories for this file
      const histories = await chatHistoryService.loadChatHistoriesForFile(fileId);
      set({ chatHistories: histories });

      // Don't auto-load any chat - let the caller decide what to do
      // (e.g., create new chat or load a specific one from history)
    }
  },

  createFile: async (name: string) => {
    const newFile = await tcfService.createTCF(name);
    set(state => ({
      files: [newFile, ...state.files],
      activeFile: newFile,
    }));
    return newFile;
  },

  updateFile: async (fileId: string, content: string) => {
    await tcfService.updateTCF(fileId, content);

    // Reload files to get updated content
    const files = await tcfService.loadTCFFiles();
    const activeFile = files.find(f => f.id === fileId) || null;

    set({ files, activeFile });
  },

  deleteFile: async (fileId: string) => {
    await tcfService.deleteTCF(fileId);
    set(state => ({
      files: state.files.filter(f => f.id !== fileId),
      activeFile: state.activeFile?.id === fileId ? null : state.activeFile,
    }));
  },

  renameFile: async (fileId: string, newName: string) => {
    await tcfService.renameTCF(fileId, newName);
    await get().loadFiles();
  },

  exportFile: async (fileId: string) => {
    return await tcfService.exportTCF(fileId);
  },

  importFile: async (name: string, content: string) => {
    const newFile = await tcfService.importTCF(name, content);
    set(state => ({
      files: [newFile, ...state.files],
    }));
    return newFile;
  },

  // Chat actions
  addMessage: (message: Message) => {
    set(state => ({
      messages: [...state.messages, message],
    }));

    // Auto-save chat history after adding message (non-blocking)
    setTimeout(() => {
      get().saveCurrentChatHistory();
    }, 100);
  },

  updateMessage: (messageId: string, updates: Partial<Message>) => {
    set(state => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setLoadingMessage: (isLoading: boolean) => {
    set({ isLoadingMessage: isLoading });
  },

  // Chat history actions
  loadChatHistories: async (fileId: string) => {
    try {
      const histories = await chatHistoryService.loadChatHistoriesForFile(fileId);
      set({ chatHistories: histories });
    } catch (error) {
      console.error('Error loading chat histories:', error);
    }
  },

  createNewChat: async () => {
    const { activeFile, saveCurrentChatHistory } = get();
    if (!activeFile) {
      return;
    }

    // Save current chat if it has messages
    await saveCurrentChatHistory();

    // Create new chat history
    const newChat = chatHistoryService.createChatHistory(activeFile.id);
    set({
      activeChatHistory: newChat,
      messages: [],
      chatHistories: [newChat, ...get().chatHistories],
    });
  },

  selectChatHistory: async (chatId: string) => {
    const { saveCurrentChatHistory } = get();

    // Save current chat before switching
    await saveCurrentChatHistory();

    const chatHistory = await chatHistoryService.loadChatHistory(chatId);
    if (chatHistory) {
      // Deduplicate messages when loading
      const uniqueMessages = Array.from(
        new Map(chatHistory.messages.map(msg => [msg.id, msg])).values()
      );
      set({
        activeChatHistory: chatHistory,
        messages: uniqueMessages,
      });
    }
  },

  deleteChatHistory: async (chatId: string) => {
    await chatHistoryService.deleteChatHistory(chatId);
    set(state => ({
      chatHistories: state.chatHistories.filter(ch => ch.id !== chatId),
      // If we deleted the active chat, clear messages
      activeChatHistory: state.activeChatHistory?.id === chatId ? null : state.activeChatHistory,
      messages: state.activeChatHistory?.id === chatId ? [] : state.messages,
    }));
  },

  saveCurrentChatHistory: async () => {
    const { activeChatHistory, messages, activeFile } = get();

    // Only save if we have messages
    if (messages.length === 0) {
      return;
    }

    // Deduplicate messages before saving
    const uniqueMessages = Array.from(
      new Map(messages.map(msg => [msg.id, msg])).values()
    );

    if (activeChatHistory) {
      // Update existing chat history
      const updated: ChatHistory = {
        ...activeChatHistory,
        messages: uniqueMessages,
        lastUpdatedAt: new Date(),
        // Keep existing title (either timestamp or user-set)
        title: activeChatHistory.title,
      };
      await chatHistoryService.saveChatHistory(updated);
      set({ activeChatHistory: updated });
    } else if (activeFile) {
      // Create new chat history if one doesn't exist
      const now = new Date();
      const newChat: ChatHistory = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileId: activeFile.id,
        title: uniqueMessages[0]?.role === 'user'
          ? uniqueMessages[0].content.substring(0, 50).trim() + (uniqueMessages[0].content.length > 50 ? '...' : '')
          : now.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
        messages: uniqueMessages,
        createdAt: now,
        lastUpdatedAt: now,
      };
      await chatHistoryService.saveChatHistory(newChat);
      set({
        activeChatHistory: newChat,
        chatHistories: [newChat, ...get().chatHistories],
      });
    }
  },

  // Approval actions
  setProposal: (proposal: Proposal) => {
    set({ pendingProposal: proposal });
  },

  approveProposal: async (onApproved?: () => void) => {
    const { pendingProposal, activeFile, updateFile, messages } = get();

    if (!pendingProposal || !activeFile) {
      return;
    }

    set({ isProcessingProposal: true });

    try {
      await updateFile(activeFile.id, pendingProposal.proposedContent);

      // Clear the proposalId from any messages that link to this proposal
      const updatedMessages = messages.map(msg =>
        msg.proposalId === pendingProposal.id
          ? { ...msg, proposalId: undefined }
          : msg
      );

      set({
        pendingProposal: null,
        isProcessingProposal: false,
        justApprovedProposal: true,
        approvalTimestamp: Date.now(),
        messages: updatedMessages
      });

      // Call the callback after approval is complete
      if (onApproved) {
        onApproved();
      }
    } catch (error) {
      console.error('Error approving proposal:', error);
      set({ isProcessingProposal: false });
      throw error;
    }
  },

  rejectProposal: () => {
    const { pendingProposal, messages } = get();

    // Clear the proposalId from any messages that link to this proposal
    if (pendingProposal) {
      const updatedMessages = messages.map(msg =>
        msg.proposalId === pendingProposal.id
          ? { ...msg, proposalId: undefined }
          : msg
      );
      set({ pendingProposal: null, messages: updatedMessages });
    } else {
      set({ pendingProposal: null });
    }
  },

  updateProposal: (proposedContent: string) => {
    const { pendingProposal } = get();
    if (pendingProposal) {
      set({
        pendingProposal: {
          ...pendingProposal,
          proposedContent,
        },
      });
    }
  },

  // API Key actions
  setApiKey: (key: string) => {
    set({ apiKey: key });
  },

  // Model actions
  setSelectedModel: async (model: string) => {
    set({ selectedModel: model });
    // Persist the selected model
    const { saveSelectedModel } = require('../services/storageService');
    await saveSelectedModel(model);
  },

  // Initialize store (load API key and selected model from secure storage)
  initialize: async () => {
    const { loadApiKey, loadSelectedModel } = require('../services/storageService');
    const apiKey = await loadApiKey();
    const selectedModel = await loadSelectedModel();
    if (apiKey) {
      set({ apiKey });
    }
    if (selectedModel) {
      set({ selectedModel });
    }
  },
}));
