/**
 * System prompts for Telos
 *
 * All prompts are now managed as markdown files in prompts/t_* directories.
 * To update a prompt:
 * 1. Edit the corresponding prompts/t_*/system.md file
 * 2. Run 'npm run generate-prompts' to regenerate the TypeScript
 * 3. The changes will be available immediately
 */

import { getSystemPrompt } from '../services/promptService';

/**
 * Default Telos system prompt
 */
export const TELOS_SYSTEM_PROMPT = getSystemPrompt('default');

/**
 * Onboarding prompt for new users
 */
export const ONBOARDING_PROMPT = getSystemPrompt('onboarding');

/**
 * Maintenance prompt for existing users (user request)
 */
export const MAINTENANCE_PROMPT = getSystemPrompt('maintenance');

/**
 * Journal entry prompt (user request)
 */
export const JOURNAL_PROMPT = getSystemPrompt('journal');
