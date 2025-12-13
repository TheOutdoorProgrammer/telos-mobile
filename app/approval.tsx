import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { DraculaColors } from '../constants/theme';
import { useTelosStore } from '../stores/useTelosStore';
import DiffViewer from '../components/approval/DiffViewer';

export default function Approval() {
  const router = useRouter();
  const { pendingProposal, approveProposal, rejectProposal, isProcessingProposal } = useTelosStore();
  const [error, setError] = useState<string | null>(null);

  // Redirect if no proposal - must be in useEffect to avoid setState during render
  useEffect(() => {
    if (!pendingProposal) {
      router.back();
    }
  }, [pendingProposal, router]);

  if (!pendingProposal) {
    return null;
  }

  const handleApprove = async () => {
    try {
      setError(null);
      await approveProposal(() => {
        // Callback will be invoked after approval completes
        // This signals the chat screen to send the approval message
      });
      // Don't call router.back() - let the useEffect handle navigation
      // when pendingProposal becomes null
    } catch (err) {
      console.error('Error approving proposal:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply changes');
    }
  };

  const handleReject = () => {
    rejectProposal();
    // Don't call router.back() - let the useEffect handle navigation
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Review Proposed Changes
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Review the changes below. You can approve or reject.
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.diffContainer}>
        <DiffViewer diffLines={pendingProposal.diff} collapsed={false} />
      </View>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={handleReject}
          disabled={isProcessingProposal}
          style={styles.rejectButton}
          textColor={DraculaColors.red}
        >
          Reject
        </Button>
        <Button
          mode="contained"
          onPress={handleApprove}
          disabled={isProcessingProposal}
          style={styles.approveButton}
          buttonColor={DraculaColors.green}
          textColor={DraculaColors.background}
        >
          {isProcessingProposal ? (
            <ActivityIndicator size="small" color={DraculaColors.background} />
          ) : (
            'Approve & Apply'
          )}
        </Button>
      </View>
    </SafeAreaView>
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
  headerTitle: {
    color: DraculaColors.foreground,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: DraculaColors.comment,
    marginTop: 4,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: DraculaColors.red + '20',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: DraculaColors.red,
  },
  errorText: {
    color: DraculaColors.red,
    fontSize: 14,
  },
  diffContainer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: DraculaColors.current,
    borderTopWidth: 1,
    borderTopColor: DraculaColors.comment,
  },
  rejectButton: {
    flex: 1,
    borderColor: DraculaColors.red,
  },
  approveButton: {
    flex: 1,
  },
});
