import { useState, useCallback } from 'react';
import { sendMessage as sendClaudeMessage, ClaudeMessage } from '../services/claudeService';
import { Message } from '../types/chat';
import { useTelosStore } from '../stores/useTelosStore';
import { getSystemPrompt, interpolateTelosFile, type PromptType } from '../services/promptService';

export function useClaudeChat() {
  const { messages, addMessage, setLoadingMessage, apiKey, activeFile, selectedModel } = useTelosStore();
  const [streamingMessage, setStreamingMessage] = useState('');

  const sendMessage = useCallback(async (userMessage: string, promptType: PromptType = 'default') => {
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    if (!activeFile) {
      throw new Error('No active Telos file');
    }

    // Add user message to store
    const userMsg: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // Prepare messages for Claude
    const claudeMessages: ClaudeMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    claudeMessages.push({ role: 'user', content: userMessage });

    // Get the appropriate system prompt and interpolate Telos file content
    const baseSystemPrompt = getSystemPrompt(promptType);
    const systemPrompt = interpolateTelosFile(
      baseSystemPrompt,
      activeFile.name,
      activeFile.content
    );

    setLoadingMessage(true);

    try {
      // Use non-streaming API call (streaming not supported in React Native fetch)
      const fullResponse = await sendClaudeMessage(claudeMessages, apiKey, selectedModel, systemPrompt);

      // Add complete assistant message
      const assistantMsg: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      };
      addMessage(assistantMsg);

      // Return both response and message ID so caller can update the message if needed
      return { response: fullResponse, messageId: assistantMsg.id };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setLoadingMessage(false);
    }
  }, [apiKey, activeFile, messages, addMessage, setLoadingMessage, selectedModel]);

  return {
    sendMessage,
    streamingMessage,
    isLoading: useTelosStore(state => state.isLoadingMessage),
  };
}
