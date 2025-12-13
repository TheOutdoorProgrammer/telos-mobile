import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Portal, Dialog, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DraculaColors } from '../constants/theme';
import { useTelosStore } from '../stores/useTelosStore';
import { useClaudeChat } from '../hooks/useClaudeChat';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import QuickActions from '../components/chat/QuickActions';
import { parseProposedChanges, applySectionChanges } from '../services/claudeService';
import { generateDiff } from '../utils/diffGenerator';

export default function Chat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    messages,
    activeFile,
    apiKey,
    setProposal,
    selectedModel,
    updateMessage,
    justApprovedProposal,
    approvalTimestamp,
    activeChatHistory,
  } = useTelosStore();
  const { sendMessage, streamingMessage, isLoading } = useClaudeChat();
  const [error, setError] = useState<string | null>(null);
  const [isModelError, setIsModelError] = useState(false);
  const lastProcessedApprovalTime = useRef<number>(0);

  useEffect(() => {
    // Redirect if no active file
    if (!activeFile) {
      router.replace('/');
      return;
    }

    // Check for API key
    if (!apiKey) {
      router.push('/settings');
    }
  }, [activeFile, apiKey]);

  // Auto-send approval message when approval completes
  useEffect(() => {
    if (justApprovedProposal && !isLoading && approvalTimestamp > 0) {
      // Check if we've already processed this approval
      if (lastProcessedApprovalTime.current === approvalTimestamp) {
        console.log('Already processed approval at timestamp', approvalTimestamp);
        return;
      }

      // Reset the flag IMMEDIATELY before doing anything else to prevent race conditions
      useTelosStore.setState({ justApprovedProposal: false });
      lastProcessedApprovalTime.current = approvalTimestamp;

      console.log('Sending approval message to Claude for timestamp', approvalTimestamp);

      // Send the approval message which will trigger Claude to respond
      handleSendMessage('✓ Changes accepted and applied');
    }
  }, [justApprovedProposal, isLoading, approvalTimestamp]);

  const handleSendMessage = async (message: string, promptType?: any) => {
    try {
      setError(null);
      setIsModelError(false);
      const result = await sendMessage(message, promptType);

      // Result now contains { response, messageId }
      const { response, messageId } = result;

      // Check if response contains proposed changes
      const proposedChanges = parseProposedChanges(response);
      if (proposedChanges.length > 0 && activeFile) {
        console.log(`Found ${proposedChanges.length} proposed change(s)`);

        // Apply all section changes to the original content
        const newContent = applySectionChanges(activeFile.content, proposedChanges);

        // Generate diff showing all changes
        const diff = generateDiff(activeFile.content, newContent);

        const proposalId = `proposal_${Date.now()}`;

        // Store the proposal (don't navigate yet - user will click button to review)
        setProposal({
          id: proposalId,
          originalContent: activeFile.content,
          proposedContent: newContent,
          diff,
          timestamp: new Date(),
        });

        // Update the assistant message with the proposal ID
        console.log(`Updating message ${messageId} with proposalId ${proposalId}`);
        updateMessage(messageId, { proposalId });
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';

      // Check if it's a model availability error
      if (errorMessage.includes('not_found_error') || errorMessage.includes('404')) {
        setIsModelError(true);
        setError(`The selected model "${selectedModel}" is not available on your API tier. Please go to Settings and select a different model.`);
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleReviewChanges = (proposalId: string) => {
    router.push('/approval');
  };

  if (!activeFile) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor={DraculaColors.purple}
            size={24}
            onPress={() => router.back()}
          />
          <View style={styles.headerText}>
            <Text variant="titleMedium" style={styles.headerTitle}>
              {activeFile.name}
            </Text>
            <Text variant="bodySmall" style={styles.headerSubtitle}>
              {activeChatHistory?.title || new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </View>
          <IconButton
            icon="menu"
            iconColor={DraculaColors.purple}
            size={24}
            onPress={() => router.push('/chat-history')}
          />
        </View>
      </View>

      {messages.length === 0 && !isLoading ? (
        <QuickActions
          onSelectPrompt={handleSendMessage}
          isNewFile={activeFile.content.trim().length < 100}
        />
      ) : (
        <MessageList
          key={activeChatHistory?.id || 'no-chat'}
          messages={messages}
          isLoading={isLoading}
          emptyMessage="Start chatting with your Telos assistant! Try asking to update a section or add a journal entry."
          onReviewChanges={handleReviewChanges}
        />
      )}

      {streamingMessage && (
        <View style={styles.streamingContainer}>
          <Text style={styles.streamingText}>{streamingMessage}</Text>
        </View>
      )}

      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading || !apiKey}
        placeholder={!apiKey ? 'Configure API key in settings...' : 'Type a message...'}
      />

      <Portal>
        <Dialog visible={!!error} onDismiss={() => { setError(null); setIsModelError(false); }}>
          <Dialog.Title style={{ color: DraculaColors.foreground }}>
            {isModelError ? 'Model Not Available' : 'Error'}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: DraculaColors.foreground }}>{error}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {isModelError && (
              <Button
                onPress={() => {
                  setError(null);
                  setIsModelError(false);
                  router.push('/settings');
                }}
                textColor={DraculaColors.cyan}
              >
                Go to Settings
              </Button>
            )}
            <Button onPress={() => { setError(null); setIsModelError(false); }} textColor={DraculaColors.purple}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DraculaColors.background,
  },
  header: {
    padding: 16,
    backgroundColor: DraculaColors.current,
    borderBottomWidth: 1,
    borderBottomColor: DraculaColors.comment,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: DraculaColors.foreground,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: DraculaColors.comment,
    marginTop: 4,
  },
  streamingContainer: {
    padding: 12,
    backgroundColor: DraculaColors.current,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  streamingText: {
    color: DraculaColors.foreground,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
