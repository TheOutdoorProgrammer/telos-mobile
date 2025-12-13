export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  proposalId?: string; // If this message has proposed changes, links to the proposal
}

export interface ChatHistory {
  id: string;
  fileId: string;
  title: string; // Auto-generated from first user message or custom
  messages: Message[];
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
