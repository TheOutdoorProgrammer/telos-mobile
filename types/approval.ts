export interface Proposal {
  id: string;
  originalContent: string;
  proposedContent: string;
  diff: DiffLine[];
  timestamp: Date;
}

export interface DiffLine {
  type: 'add' | 'remove' | 'unchanged';
  content: string;
  lineNumber?: number;
}

export interface ApprovalState {
  pendingProposal: Proposal | null;
  isProcessing: boolean;
}
