/**
 * Service for loading system prompts from generated TypeScript file
 * Prompts are maintained as markdown files in prompts/t_* directories
 * Run 'npm run generate-prompts' after editing any system.md files
 */

import * as GeneratedPrompts from '../prompts/generated-prompts';

/**
 * Prompt type definitions
 */
export type PromptType =
  | 'default'
  | 'onboarding'
  | 'journal'
  | 'maintenance'
  | 'analyze_challenge_handling'
  | 'check_dunning_kruger'
  | 'check_metrics'
  | 'create_h3_career'
  | 'create_opening_sentences'
  | 'describe_life_outlook'
  | 'extract_intro_sentences'
  | 'extract_panel_topics'
  | 'find_blindspots'
  | 'find_negative_thinking'
  | 'find_neglected_goals'
  | 'give_encouragement'
  | 'red_team_thinking'
  | 'threat_model_plans'
  | 'visualize_mission_goals_projects'
  | 'year_in_review';

/**
 * Metadata for each prompt type
 */
export interface PromptMetadata {
  id: PromptType;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: 'core' | 'analysis' | 'reflection' | 'planning';
}

/**
 * Map of prompt types to their generated content
 */
const promptMap: Record<PromptType, string> = {
  default: GeneratedPrompts.DEFAULT_PROMPT,
  onboarding: GeneratedPrompts.ONBOARDING_PROMPT,
  journal: GeneratedPrompts.JOURNAL_PROMPT,
  maintenance: GeneratedPrompts.MAINTENANCE_PROMPT,
  analyze_challenge_handling: GeneratedPrompts.ANALYZE_CHALLENGE_HANDLING_PROMPT,
  check_dunning_kruger: GeneratedPrompts.CHECK_DUNNING_KRUGER_PROMPT,
  check_metrics: GeneratedPrompts.CHECK_METRICS_PROMPT,
  create_h3_career: GeneratedPrompts.CREATE_H3_CAREER_PROMPT,
  create_opening_sentences: GeneratedPrompts.CREATE_OPENING_SENTENCES_PROMPT,
  describe_life_outlook: GeneratedPrompts.DESCRIBE_LIFE_OUTLOOK_PROMPT,
  extract_intro_sentences: GeneratedPrompts.EXTRACT_INTRO_SENTENCES_PROMPT,
  extract_panel_topics: GeneratedPrompts.EXTRACT_PANEL_TOPICS_PROMPT,
  find_blindspots: GeneratedPrompts.FIND_BLINDSPOTS_PROMPT,
  find_negative_thinking: GeneratedPrompts.FIND_NEGATIVE_THINKING_PROMPT,
  find_neglected_goals: GeneratedPrompts.FIND_NEGLECTED_GOALS_PROMPT,
  give_encouragement: GeneratedPrompts.GIVE_ENCOURAGEMENT_PROMPT,
  red_team_thinking: GeneratedPrompts.RED_TEAM_THINKING_PROMPT,
  threat_model_plans: GeneratedPrompts.THREAT_MODEL_PLANS_PROMPT,
  visualize_mission_goals_projects: GeneratedPrompts.VISUALIZE_MISSION_GOALS_PROJECTS_PROMPT,
  year_in_review: GeneratedPrompts.YEAR_IN_REVIEW_PROMPT,
};

/**
 * Metadata for all available prompts
 */
export const promptMetadata: PromptMetadata[] = [
  // Core prompts
  {
    id: 'journal',
    label: 'Add Journal Entry',
    description: 'Add a timestamped reflection',
    icon: 'notebook',
    color: '#50fa7b', // Dracula green
    category: 'core',
  },
  {
    id: 'maintenance',
    label: 'Update Section',
    description: 'Update any section of your TCF',
    icon: 'pencil',
    color: '#f1fa8c', // Dracula yellow
    category: 'core',
  },

  // Analysis prompts
  {
    id: 'analyze_challenge_handling',
    label: 'Analyze Challenges',
    description: "Analyze how well I'm handling my current challenges",
    icon: 'shield-check',
    color: '#8be9fd', // Dracula cyan
    category: 'analysis',
  },
  {
    id: 'check_dunning_kruger',
    label: 'Check Blind Spots',
    description: "Show me where I'm overconfident or underestimating myself",
    icon: 'eye-off',
    color: '#ffb86c', // Dracula orange
    category: 'analysis',
  },
  {
    id: 'check_metrics',
    label: 'Check Metrics',
    description: 'Review my personal KPIs and metrics',
    icon: 'chart-line',
    color: '#ff79c6', // Dracula pink
    category: 'analysis',
  },
  {
    id: 'find_blindspots',
    label: 'Find Blind Spots',
    description: 'Identify gaps in my self-awareness',
    icon: 'alert-circle',
    color: '#ffb86c', // Dracula orange
    category: 'analysis',
  },
  {
    id: 'find_negative_thinking',
    label: 'Find Negative Thinking',
    description: 'Point out negative thought patterns I have',
    icon: 'emoticon-sad',
    color: '#ff5555', // Dracula red
    category: 'analysis',
  },
  {
    id: 'find_neglected_goals',
    label: 'Find Neglected Goals',
    description: "Show me goals I'm not making progress on",
    icon: 'flag-remove',
    color: '#ffb86c', // Dracula orange
    category: 'analysis',
  },

  // Reflection prompts
  {
    id: 'describe_life_outlook',
    label: 'Describe Life Outlook',
    description: 'Describe my current perspective on life',
    icon: 'telescope',
    color: '#bd93f9', // Dracula purple
    category: 'reflection',
  },
  {
    id: 'give_encouragement',
    label: 'Get Encouragement',
    description: 'Give me encouragement based on my progress',
    icon: 'heart',
    color: '#ff79c6', // Dracula pink
    category: 'reflection',
  },
  {
    id: 'year_in_review',
    label: 'Year in Review',
    description: 'Reflect on what I accomplished this year',
    icon: 'calendar-star',
    color: '#bd93f9', // Dracula purple
    category: 'reflection',
  },

  // Planning prompts
  {
    id: 'create_h3_career',
    label: 'Create H3 Career Plan',
    description: 'Help me plan my career across three horizons',
    icon: 'briefcase',
    color: '#8be9fd', // Dracula cyan
    category: 'planning',
  },
  {
    id: 'red_team_thinking',
    label: 'Red Team Thinking',
    description: "Challenge my plans with devil's advocate perspective",
    icon: 'skull',
    color: '#ff5555', // Dracula red
    category: 'planning',
  },
  {
    id: 'threat_model_plans',
    label: 'Threat Model Plans',
    description: 'Identify risks and threats in my plans',
    icon: 'shield-alert',
    color: '#ff5555', // Dracula red
    category: 'planning',
  },
  {
    id: 'visualize_mission_goals_projects',
    label: 'Visualize Progress',
    description: 'Show my mission → goals → projects alignment',
    icon: 'chart-tree',
    color: '#50fa7b', // Dracula green
    category: 'planning',
  },
  {
    id: 'create_opening_sentences',
    label: 'Create Opening Sentences',
    description: 'Generate compelling introductions about who I am',
    icon: 'text',
    color: '#f1fa8c', // Dracula yellow
    category: 'planning',
  },
  {
    id: 'extract_intro_sentences',
    label: 'Extract Intro Sentences',
    description: 'Pull key sentences from my TCF for introductions',
    icon: 'format-quote-open',
    color: '#8be9fd', // Dracula cyan
    category: 'planning',
  },
  {
    id: 'extract_panel_topics',
    label: 'Extract Panel Topics',
    description: 'Find interesting topics from my TCF for discussions',
    icon: 'forum',
    color: '#bd93f9', // Dracula purple
    category: 'planning',
  },
];

/**
 * Get a system prompt by type
 */
export function getSystemPrompt(promptType: PromptType = 'default'): string {
  const promptContent = promptMap[promptType];

  if (!promptContent) {
    console.error(`Prompt ${promptType} not found`);
    return promptMap.default; // Fallback to default
  }

  return promptContent;
}

/**
 * Get metadata for a specific prompt type
 */
export function getPromptMetadata(promptType: PromptType): PromptMetadata | undefined {
  return promptMetadata.find(m => m.id === promptType);
}

/**
 * Get all prompts for a specific category
 */
export function getPromptsByCategory(category: PromptMetadata['category']): PromptMetadata[] {
  return promptMetadata.filter(m => m.category === category);
}

/**
 * Interpolate Telos file content into a system prompt
 */
export function interpolateTelosFile(
  systemPrompt: string,
  fileName: string,
  fileContent: string
): string {
  return `${systemPrompt}

# CURRENT TELOS FILE

File Name: ${fileName}

${fileContent}`;
}
