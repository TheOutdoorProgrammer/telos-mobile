import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Divider, HelperText, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { DraculaColors } from '../constants/theme';
import { useTelosStore } from '../stores/useTelosStore';
import { saveApiKey, deleteApiKey } from '../services/storageService';
import { validateApiKey, testApiKey, fetchAvailableModels, ClaudeModelInfo } from '../services/claudeService';

export default function Settings() {
  const router = useRouter();
  const { apiKey, setApiKey, selectedModel, setSelectedModel } = useTelosStore();
  const [inputKey, setInputKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<ClaudeModelInfo[]>([]);
  const [modelMenuVisible, setModelMenuVisible] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setInputKey(apiKey);
      // Fetch available models when API key is present
      loadAvailableModels();
    }
  }, [apiKey]);

  const loadAvailableModels = async () => {
    if (!apiKey) {
      setAvailableModels([]);
      return;
    }

    setIsFetchingModels(true);
    try {
      const models = await fetchAvailableModels(apiKey);
      setAvailableModels(models);

      // If no model is selected and we have models, select the first one
      if (!selectedModel && models.length > 0) {
        setSelectedModel(models[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setAvailableModels([]);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!inputKey.trim()) {
        setError('Please enter an API key');
        return;
      }

      if (!validateApiKey(inputKey)) {
        setError('Invalid API key format. Claude API keys start with "sk-ant-"');
        return;
      }

      setIsSaving(true);
      await saveApiKey(inputKey);
      setApiKey(inputKey);
      setSuccess('API key saved successfully!');
    } catch (err) {
      console.error('Error saving API key:', err);
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!inputKey.trim()) {
        setError('Please enter an API key');
        return;
      }

      setIsTesting(true);
      const isValid = await testApiKey(inputKey, selectedModel);

      if (isValid) {
        setSuccess('API key is valid!');
        // Fetch models after successful test
        await loadAvailableModels();
      } else {
        setError('API key test failed. Please check your key and selected model.');
      }
    } catch (err) {
      console.error('Error testing API key:', err);
      setError('Failed to test API key. Check your internet connection.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      setSuccess(null);
      await deleteApiKey();
      setApiKey('');
      setInputKey('');
      setSuccess('API key removed');
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError('Failed to delete API key');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Claude API Key
            </Text>
            <Text variant="bodyMedium" style={styles.cardSubtitle}>
              Your API key is stored securely on your device and never shared.
            </Text>

            <TextInput
              mode="outlined"
              label="API Key"
              value={showApiKey ? inputKey : inputKey ? '•'.repeat(inputKey.length) : ''}
              onChangeText={setInputKey}
              placeholder="sk-ant-..."
              style={styles.input}
              outlineColor={DraculaColors.current}
              activeOutlineColor={DraculaColors.purple}
              textColor={DraculaColors.foreground}
              placeholderTextColor={DraculaColors.comment}
              editable={showApiKey}
              right={
                <TextInput.Icon
                  icon={showApiKey ? "eye" : "eye-off"}
                  color={DraculaColors.comment}
                  onPress={() => setShowApiKey(!showApiKey)}
                />
              }
              theme={{
                colors: {
                  background: DraculaColors.background,
                },
              }}
              multiline
              numberOfLines={3}
            />

            {error && (
              <HelperText type="error" visible={!!error} style={styles.helperText}>
                {error}
              </HelperText>
            )}

            {success && (
              <HelperText type="info" visible={!!success} style={styles.successText}>
                {success}
              </HelperText>
            )}

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleTest}
                disabled={isTesting || isSaving || !inputKey.trim()}
                style={styles.button}
                textColor={DraculaColors.cyan}
                loading={isTesting}
              >
                Test
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                disabled={isTesting || isSaving || !inputKey.trim()}
                style={styles.button}
                buttonColor={DraculaColors.purple}
                loading={isSaving}
              >
                Save
              </Button>
            </View>

            {apiKey && (
              <>
                <Divider style={styles.divider} />
                <Button
                  mode="text"
                  onPress={handleDelete}
                  textColor={DraculaColors.red}
                  icon="delete"
                >
                  Remove API Key
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Model Selection
            </Text>
            <Text variant="bodyMedium" style={styles.cardSubtitle}>
              Choose which Claude model to use for conversations
            </Text>

            {!apiKey ? (
              <Text variant="bodyMedium" style={styles.warningText}>
                Please set an API key first to see available models
              </Text>
            ) : availableModels.length === 0 && !isFetchingModels ? (
              <Text variant="bodyMedium" style={styles.warningText}>
                No models available for this API key. Please check your API key or tier.
              </Text>
            ) : (
              <>
                <Menu
                  visible={modelMenuVisible}
                  onDismiss={() => setModelMenuVisible(false)}
                  contentStyle={styles.menuContent}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setModelMenuVisible(true)}
                      style={styles.modelButton}
                      textColor={DraculaColors.foreground}
                      disabled={isFetchingModels || availableModels.length === 0}
                      loading={isFetchingModels}
                      icon="chevron-down"
                    >
                      {availableModels.find(m => m.id === selectedModel)?.display_name || 'Select Model'}
                    </Button>
                  }
                >
                  {availableModels.map((model) => (
                    <Menu.Item
                      key={model.id}
                      onPress={() => {
                        setSelectedModel(model.id);
                        setModelMenuVisible(false);
                      }}
                      title={model.display_name}
                      titleStyle={{
                        color: model.id === selectedModel ? DraculaColors.purple : DraculaColors.foreground,
                        fontWeight: model.id === selectedModel ? 'bold' : 'normal',
                      }}
                      style={{
                        backgroundColor: model.id === selectedModel ? DraculaColors.background : 'transparent',
                      }}
                      leadingIcon={model.id === selectedModel ? 'check' : undefined}
                    />
                  ))}
                </Menu>

                {selectedModel && availableModels.length > 0 && (
                  <Text variant="bodySmall" style={styles.hint}>
                    Selected: {availableModels.find(m => m.id === selectedModel)?.display_name || selectedModel}
                  </Text>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              How to get an API key
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              1. Go to console.anthropic.com
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              2. Sign up or log in
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              3. Navigate to API Keys section
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              4. Create a new API key
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              5. Copy and paste it here
            </Text>
          </Card.Content>
        </Card>
      </View>
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
  card: {
    backgroundColor: DraculaColors.current,
    marginBottom: 16,
  },
  cardTitle: {
    color: DraculaColors.foreground,
    marginBottom: 8,
  },
  cardSubtitle: {
    color: DraculaColors.comment,
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  helperText: {
    color: DraculaColors.red,
  },
  successText: {
    color: DraculaColors.green,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: DraculaColors.comment,
  },
  infoText: {
    color: DraculaColors.foreground,
    marginBottom: 8,
  },
  modelButton: {
    marginTop: 8,
    marginBottom: 8,
    borderColor: DraculaColors.purple,
    borderWidth: 1,
  },
  menuContent: {
    backgroundColor: DraculaColors.current,
    borderWidth: 1,
    borderColor: DraculaColors.purple,
  },
  hint: {
    color: DraculaColors.comment,
    marginTop: 8,
    fontStyle: 'italic',
  },
  warningText: {
    color: DraculaColors.orange,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
