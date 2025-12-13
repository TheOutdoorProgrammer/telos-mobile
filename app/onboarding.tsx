import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { DraculaColors } from '../constants/theme';
import { useTelosStore } from '../stores/useTelosStore';
import { PersonalTCFTemplate } from '../types/telos';

export default function Onboarding() {
  const router = useRouter();
  const { createFile } = useTelosStore();
  const [fileName, setFileName] = useState('My Personal Telos');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      setError(null);

      if (!fileName.trim()) {
        setError('Please enter a file name');
        return;
      }

      setIsCreating(true);
      await createFile(fileName.trim());

      // Navigate back to home (file list)
      router.replace('/');
    } catch (err) {
      console.error('Error creating file:', err);
      setError(err instanceof Error ? err.message : 'Failed to create file');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            Create Your Telos File
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Let's set up your personal Telos context file. You'll be able to fill in the details through conversations with your AI assistant.
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                What is Telos?
              </Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                Telos helps you create "deep context" about yourself or your organization.
                It's a structured framework that maps everything back to the fundamental problems you're solving.
              </Text>
              <Text variant="bodySmall" style={styles.conceptPath}>
                Problems → Mission → Goals → Strategies → Projects → Journal
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                How It Works
              </Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                • Start with a blank file{'\n'}
                • Chat with your AI assistant to fill it in{'\n'}
                • The AI will propose changes which you can review and approve{'\n'}
                • Keep multiple Telos files for different contexts{'\n'}
                • Journal regularly to track your progress
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                File Name
              </Text>
              <TextInput
                mode="outlined"
                label="File Name"
                value={fileName}
                onChangeText={setFileName}
                placeholder="My Personal Telos"
                style={styles.input}
                outlineColor={DraculaColors.current}
                activeOutlineColor={DraculaColors.purple}
                textColor={DraculaColors.foreground}
                placeholderTextColor={DraculaColors.comment}
                theme={{
                  colors: {
                    background: DraculaColors.background,
                  },
                }}
              />

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <Text variant="bodySmall" style={styles.hint}>
                This creates a blank Telos file. You can fill it in by chatting with your AI assistant.
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              disabled={isCreating}
              style={styles.button}
              textColor={DraculaColors.comment}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreate}
              disabled={isCreating || !fileName.trim()}
              style={styles.button}
              buttonColor={DraculaColors.purple}
              loading={isCreating}
            >
              Create File
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DraculaColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    color: DraculaColors.foreground,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  subtitle: {
    color: DraculaColors.comment,
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    backgroundColor: DraculaColors.current,
    marginBottom: 16,
  },
  cardTitle: {
    color: DraculaColors.foreground,
    marginBottom: 12,
  },
  cardText: {
    color: DraculaColors.foreground,
    marginBottom: 12,
    lineHeight: 22,
  },
  conceptPath: {
    color: DraculaColors.purple,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: DraculaColors.red,
    fontSize: 14,
    marginTop: 8,
  },
  hint: {
    color: DraculaColors.comment,
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});
