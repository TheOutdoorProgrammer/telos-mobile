import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { DraculaColors } from '../../constants/theme';
import { promptMetadata, type PromptType, getPromptsByCategory } from '../../services/promptService';

interface QuickActionsProps {
  onSelectPrompt: (prompt: string, promptType: PromptType) => void;
  isNewFile?: boolean;
}

interface QuickAction {
  label: string;
  icon: string;
  prompt: string;
  promptType: PromptType;
  color: string;
  category?: string;
}

export default function QuickActions({ onSelectPrompt, isNewFile = false }: QuickActionsProps) {
  // For new files, show onboarding actions
  const newFileActions: QuickAction[] = [
    {
      label: 'Start Building',
      icon: 'rocket-launch',
      prompt: "Help me build my Telos file. Let's start with my core problems and mission.",
      promptType: 'onboarding',
      color: DraculaColors.purple,
    },
    {
      label: 'Learn About Telos',
      icon: 'information',
      prompt: 'What is Telos and how does it work? Explain the framework.',
      promptType: 'default',
      color: DraculaColors.cyan,
    },
  ];

  // For existing files, show core actions and specialized prompts
  const coreActions: QuickAction[] = promptMetadata
    .filter(m => m.category === 'core')
    .map(m => ({
      label: m.label,
      icon: m.icon,
      prompt: `Let's work on: ${m.description}`,
      promptType: m.id,
      color: m.color,
      category: m.category,
    }));

  const analysisActions: QuickAction[] = promptMetadata
    .filter(m => m.category === 'analysis')
    .map(m => ({
      label: m.label,
      icon: m.icon,
      prompt: m.description,
      promptType: m.id,
      color: m.color,
      category: m.category,
    }));

  const reflectionActions: QuickAction[] = promptMetadata
    .filter(m => m.category === 'reflection')
    .map(m => ({
      label: m.label,
      icon: m.icon,
      prompt: m.description,
      promptType: m.id,
      color: m.color,
      category: m.category,
    }));

  const planningActions: QuickAction[] = promptMetadata
    .filter(m => m.category === 'planning')
    .map(m => ({
      label: m.label,
      icon: m.icon,
      prompt: m.description,
      promptType: m.id,
      color: m.color,
      category: m.category,
    }));

  const sections = isNewFile
    ? [{ title: 'Get Started', actions: newFileActions }]
    : [
        { title: `Quick Actions (${coreActions.length})`, actions: coreActions },
        { title: `Analysis (${analysisActions.length})`, actions: analysisActions },
        { title: `Reflection (${reflectionActions.length})`, actions: reflectionActions },
        { title: `Planning (${planningActions.length})`, actions: planningActions },
      ];

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text variant="labelMedium" style={styles.label}>
              {section.title}
            </Text>
            <View style={styles.chipsContainer}>
              {section.actions.map((action, index) => (
                <Chip
                  key={index}
                  icon={action.icon}
                  onPress={() => onSelectPrompt(action.prompt, action.promptType)}
                  style={[styles.chip, { borderColor: action.color }]}
                  textStyle={{ color: action.color }}
                  mode="outlined"
                >
                  {action.label}
                </Chip>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: DraculaColors.comment,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: DraculaColors.current,
    borderWidth: 1,
  },
});
