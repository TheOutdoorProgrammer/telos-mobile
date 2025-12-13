# Telos System Prompts

This directory contains all system prompts for the Telos app, organized as markdown files for easy management.

## Directory Structure

Each prompt is stored in a directory following the pattern `t_{name}/`:

```
prompts/
├── t_default/              # Default Telos assistant prompt
├── t_onboarding/           # New user onboarding
├── t_journal/              # Journal entry assistance
├── t_maintenance/          # Section updates
├── t_analyze_challenge_handling/
├── t_check_dunning_kruger/
├── t_check_metrics/
├── t_create_h3_career/
├── t_create_opening_sentences/
├── t_describe_life_outlook/
├── t_extract_intro_sentences/
├── t_extract_panel_topics/
├── t_find_blindspots/
├── t_find_negative_thinking/
├── t_find_neglected_goals/
├── t_give_encouragement/
├── t_red_team_thinking/
├── t_threat_model_plans/
├── t_visualize_mission_goals_projects/
└── t_year_in_review/
```

Each directory contains a `system.md` file with the prompt content.

## How It Works

1. **Edit Markdown Files**: Modify any `system.md` file in the prompt directories
2. **Regenerate TypeScript**: Run `npm run generate-prompts` to convert markdown to TypeScript
3. **Use in App**: The generated prompts are automatically available in the app

### Build Process

The `scripts/generate-prompts.js` script:
- Scans all `t_*/` directories
- Reads each `system.md` file
- Generates `generated-prompts.ts` with all prompts as TypeScript constants
- Each prompt becomes a constant like `DEFAULT_PROMPT`, `JOURNAL_PROMPT`, etc.

### Loading Prompts

The `services/promptService.ts` provides:
- `getSystemPrompt(type)` - Get a prompt by type
- `interpolateTelosFile()` - Inject current Telos file into prompt
- `promptMetadata` - UI metadata (labels, icons, colors, categories)

### Integration

When a user selects a quick action:
1. QuickActions passes the prompt type to the chat
2. useClaudeChat loads the appropriate system prompt
3. The current Telos file content is interpolated into the prompt
4. Claude receives the combined context

## Adding New Prompts

1. Create a new directory: `prompts/t_your_prompt_name/`
2. Add a `system.md` file with your prompt content
3. Run `npm run generate-prompts`
4. Add metadata to `promptService.ts` in the `promptMetadata` array:
   ```typescript
   {
     id: 'your_prompt_name',
     label: 'Display Name',
     description: 'What this prompt does',
     icon: 'material-icon-name',
     color: '#hexcolor', // Use Dracula colors
     category: 'core' | 'analysis' | 'reflection' | 'planning',
   }
   ```
5. The prompt will automatically appear in QuickActions

## Prompt Structure

Each `system.md` should follow this structure:

```markdown
# IDENTITY

You are an expert at [role description]

# STEPS (or GOAL)

1. Step one
2. Step two
3. Step three

# OUTPUT INSTRUCTIONS

- How to format the output
- What to include/exclude
```

## Telos File Interpolation

The current Telos file is automatically added to every system prompt:

```
[Your system prompt content]

# CURRENT TELOS FILE

File Name: my-telos-file.md

[Complete file content here]
```

This ensures Claude always has full context about the user's Telos file.

## Categories

- **core**: Basic actions (journal, maintenance)
- **analysis**: Deep analysis prompts (blindspots, challenges, metrics)
- **reflection**: Retrospective prompts (year in review, life outlook)
- **planning**: Forward-looking prompts (career planning, threat modeling)

## Dracula Color Palette

When adding new prompts, use these colors for consistency:

- `#50fa7b` - Green (success, growth)
- `#f1fa8c` - Yellow (caution, updates)
- `#8be9fd` - Cyan (info, analysis)
- `#ffb86c` - Orange (warnings, attention)
- `#ff79c6` - Pink (goals, planning)
- `#bd93f9` - Purple (primary, main actions)
- `#ff5555` - Red (critical, challenges)
