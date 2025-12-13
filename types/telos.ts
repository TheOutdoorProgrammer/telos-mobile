export interface TCFFile {
  id: string;
  name: string;
  path: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TCFSection {
  type: string;
  title: string;
  content: string;
}

export interface TCFMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const TCFSections = {
  HISTORY: 'history',
  PROBLEMS: 'problems',
  MISSION: 'mission',
  NARRATIVES: 'narratives',
  GOALS: 'goals',
  CHALLENGES: 'challenges',
  STRATEGIES: 'strategies',
  PROJECTS: 'projects',
  JOURNAL: 'journal',
  IDEAS: 'ideas',
  PREDICTIONS: 'predictions',
  WISDOM: 'wisdom',
  METRICS: 'metrics',
} as const;

export type TCFSectionType = typeof TCFSections[keyof typeof TCFSections];

export interface TCFTemplate {
  name: string;
  sections: string[];
  initialContent: string;
}

export const PersonalTCFTemplate: TCFTemplate = {
  name: 'Personal Telos',
  sections: Object.values(TCFSections),
  initialContent: `# My Personal Telos

## History


## Problems


## Mission


## Narratives


## Goals


## Challenges


## Strategies


## Projects


## Journal


## Ideas


## Predictions


## Wisdom


## Metrics

`,
};
