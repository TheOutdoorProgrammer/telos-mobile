import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'claude_api_key';
const SELECTED_MODEL_KEY = 'claude_selected_model';

/**
 * Save API key to secure storage
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
  } catch (error) {
    console.error('Error saving API key:', error);
    throw new Error('Failed to save API key securely');
  }
}

/**
 * Load API key from secure storage
 */
export async function loadApiKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error loading API key:', error);
    return null;
  }
}

/**
 * Delete API key from secure storage
 */
export async function deleteApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw new Error('Failed to delete API key');
  }
}

/**
 * Check if API key exists in secure storage
 */
export async function hasApiKey(): Promise<boolean> {
  try {
    const key = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
    return key !== null;
  } catch (error) {
    console.error('Error checking API key:', error);
    return false;
  }
}

/**
 * Save selected model to secure storage
 */
export async function saveSelectedModel(model: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SELECTED_MODEL_KEY, model);
  } catch (error) {
    console.error('Error saving selected model:', error);
    throw new Error('Failed to save selected model');
  }
}

/**
 * Load selected model from secure storage
 */
export async function loadSelectedModel(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SELECTED_MODEL_KEY);
  } catch (error) {
    console.error('Error loading selected model:', error);
    return null;
  }
}
