import { CLAUDE_API_CONFIG } from '../constants/config';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeModelInfo {
  id: string;
  created_at: string;
  display_name: string;
  type: 'model';
}

export interface ClaudeModelsResponse {
  data: ClaudeModelInfo[];
  first_id: string;
  has_more: boolean;
  last_id: string;
}

export interface ClaudeStreamChunk {
  type: 'content_block_delta' | 'content_block_start' | 'content_block_stop' | 'message_start' | 'message_delta' | 'message_stop';
  delta?: {
    type: 'text_delta';
    text: string;
  };
  content_block?: {
    type: 'text';
    text: string;
  };
}

export interface ProposedChange {
  section: string;
  originalContent: string;
  proposedContent: string;
}

/**
 * Fetch available models from the Claude API
 */
export async function fetchAvailableModels(apiKey: string): Promise<ClaudeModelInfo[]> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  try {
    const response = await fetch(`${CLAUDE_API_CONFIG.BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': CLAUDE_API_CONFIG.API_VERSION,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data: ClaudeModelsResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

/**
 * Send a message to Claude and stream the response
 */
export async function* streamChatCompletion(
  messages: ClaudeMessage[],
  apiKey: string,
  model: string,
  systemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  console.log('Making request to Claude API:', {
    url: `${CLAUDE_API_CONFIG.BASE_URL}/messages`,
    model,
    messageCount: messages.length,
    hasSystemPrompt: !!systemPrompt,
  });

  const response = await fetch(`${CLAUDE_API_CONFIG.BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': CLAUDE_API_CONFIG.API_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: CLAUDE_API_CONFIG.MAX_TOKENS,
      messages,
      ...(systemPrompt && { system: systemPrompt }),
      stream: true,
    }),
  });

  console.log('Response received:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    hasBody: !!response.body,
    headers: Object.fromEntries(response.headers.entries()),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    console.error('Response body is null despite ok status');
    throw new Error(`Response body is null. This may indicate an invalid model (${model}) or API configuration issue.`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            return;
          }

          try {
            const chunk: ClaudeStreamChunk = JSON.parse(data);

            if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
              yield chunk.delta.text;
            } else if (chunk.type === 'content_block_start' && chunk.content_block?.text) {
              yield chunk.content_block.text;
            }
          } catch (error) {
            console.error('Error parsing SSE chunk:', error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Send a non-streaming message to Claude
 */
export async function sendMessage(
  messages: ClaudeMessage[],
  apiKey: string,
  model: string,
  systemPrompt?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const response = await fetch(`${CLAUDE_API_CONFIG.BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': CLAUDE_API_CONFIG.API_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: CLAUDE_API_CONFIG.MAX_TOKENS,
      messages,
      ...(systemPrompt && { system: systemPrompt }),
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

/**
 * Parse full document from Claude's response
 * Looks for <telos_document>...</telos_document> XML tags
 * Returns the full document content if found, null otherwise
 */
export function parseFullDocument(responseText: string): string | null {
  // Look for XML tags containing the full document
  const documentRegex = /<telos_document>\s*([\s\S]*?)\s*<\/telos_document>/;
  const match = responseText.match(documentRegex);

  if (match && match[1] && match[1].trim().length > 0) {
    return match[1].trim();
  }

  return null;
}

/**
 * Extract conversational summary from Claude's response
 * Returns everything before the <telos_document> tag
 * If no document tag found, returns the entire response
 */
export function extractSummary(responseText: string): string {
  const documentRegex = /<telos_document>/;
  const parts = responseText.split(documentRegex);

  if (parts && parts[0]) {
    return parts[0].trim();
  }

  // If no document tag found, return entire response
  return responseText.trim();
}

/**
 * Parse proposed changes from Claude's response (LEGACY FORMAT)
 * Looks for markdown code blocks with special markers
 * Returns ALL proposed changes found in the response
 *
 * @deprecated This is for backwards compatibility with old format.
 * New messages should use parseFullDocument() instead.
 */
export function parseProposedChanges(responseText: string): ProposedChange[] {
  const changes: ProposedChange[] = [];

  // Look for all markdown code blocks that indicate proposed changes
  // Format: ```markdown:section_name\n...content...\n```
  const codeBlockRegex = /```markdown:(\w+)\n([\s\S]*?)```/g;
  const matches = responseText.matchAll(codeBlockRegex);

  for (const match of matches) {
    const [, section, content] = match;
    changes.push({
      section,
      originalContent: '', // Will be filled in by the caller from the TCF file
      proposedContent: content.trim(),
    });
  }

  // If no markdown blocks found, try alternative format
  if (changes.length === 0) {
    const proposalRegex = /PROPOSED CHANGE:?\s*\n([\s\S]*?)(?:\n\n|$)/i;
    const proposalMatch = responseText.match(proposalRegex);

    if (proposalMatch) {
      changes.push({
        section: 'unknown',
        originalContent: '',
        proposedContent: proposalMatch[1].trim(),
      });
    }
  }

  return changes;
}

/**
 * Apply multiple section changes to a markdown file
 * Each change should contain the full section content to replace
 */
export function applySectionChanges(originalContent: string, changes: ProposedChange[]): string {
  let result = originalContent;

  for (const change of changes) {
    const { section, proposedContent } = change;

    // Try to find the section in the original content
    // Matches: ## SectionName\n...content until next ## or end of file
    const sectionRegex = new RegExp(
      `(^|\\n)(## ${section}.*?)(?=\\n## |$)`,
      'is'
    );

    const sectionMatch = result.match(sectionRegex);

    if (sectionMatch) {
      // Replace the existing section
      result = result.replace(sectionRegex, `$1${proposedContent}`);
    } else {
      // Section doesn't exist, append it at the end
      if (!result.endsWith('\n')) {
        result += '\n';
      }
      result += `\n${proposedContent}`;
    }
  }

  return result;
}

/**
 * Validate API key format (basic check)
 */
export function validateApiKey(apiKey: string): boolean {
  // Claude API keys start with "sk-ant-"
  return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
}

/**
 * Test API key by making a minimal request
 */
export async function testApiKey(apiKey: string, model: string): Promise<boolean> {
  try {
    const response = await fetch(`${CLAUDE_API_CONFIG.BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': CLAUDE_API_CONFIG.API_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}
