export const CLAUDE_API_CONFIG = {
  BASE_URL: 'https://api.anthropic.com/v1',
  MAX_TOKENS: 4096,
  API_VERSION: '2023-06-01',
};

export const APP_CONFIG = {
  MAX_MESSAGES_HISTORY: 50,
  STREAM_CHUNK_TIMEOUT: 30000, // 30 seconds
};
