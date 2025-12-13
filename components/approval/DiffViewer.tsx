import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { DraculaColors } from '../../constants/theme';
import { DiffLine } from '../../types/approval';
import { collapseUnchangedLines, getDiffStats } from '../../utils/diffGenerator';

interface DiffViewerProps {
  diffLines: DiffLine[];
  collapsed?: boolean;
}

export default function DiffViewer({ diffLines, collapsed = true }: DiffViewerProps) {
  const displayLines = collapsed ? collapseUnchangedLines(diffLines, 3) : diffLines;
  const stats = getDiffStats(diffLines);

  return (
    <View style={styles.container}>
      <Surface style={styles.statsContainer} elevation={1}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, styles.additionColor]}>+{stats.additions}</Text>
            <Text style={styles.statLabel}>additions</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, styles.deletionColor]}>-{stats.deletions}</Text>
            <Text style={styles.statLabel}>deletions</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, styles.unchangedColor]}>{stats.unchanged}</Text>
            <Text style={styles.statLabel}>unchanged</Text>
          </View>
        </View>
      </Surface>

      <ScrollView style={styles.diffContainer} showsVerticalScrollIndicator={false}>
        {displayLines.map((line, index) => (
          <View
            key={index}
            style={[
              styles.line,
              line.type === 'add' && styles.addedLine,
              line.type === 'remove' && styles.removedLine,
            ]}
          >
            <View style={styles.lineNumberContainer}>
              {line.lineNumber && (
                <Text style={styles.lineNumber}>{line.lineNumber}</Text>
              )}
            </View>
            <View style={styles.lineIndicator}>
              {line.type === 'add' && <Text style={styles.addIndicator}>+</Text>}
              {line.type === 'remove' && <Text style={styles.removeIndicator}>-</Text>}
              {line.type === 'unchanged' && <Text style={styles.unchangedIndicator}> </Text>}
            </View>
            <Text
              style={[
                styles.lineContent,
                line.type === 'add' && styles.addedText,
                line.type === 'remove' && styles.removedText,
                line.type === 'unchanged' && styles.unchangedText,
              ]}
            >
              {line.content || ' '}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DraculaColors.background,
  },
  statsContainer: {
    backgroundColor: DraculaColors.current,
    padding: 16,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: DraculaColors.comment,
    marginTop: 4,
  },
  additionColor: {
    color: DraculaColors.green,
  },
  deletionColor: {
    color: DraculaColors.red,
  },
  unchangedColor: {
    color: DraculaColors.comment,
  },
  diffContainer: {
    flex: 1,
  },
  line: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addedLine: {
    backgroundColor: DraculaColors.green + '20', // 20 = 12.5% opacity
  },
  removedLine: {
    backgroundColor: DraculaColors.red + '20',
  },
  lineNumberContainer: {
    width: 40,
    marginRight: 8,
    alignItems: 'flex-end',
  },
  lineNumber: {
    fontSize: 12,
    color: DraculaColors.comment,
    fontFamily: 'monospace',
  },
  lineIndicator: {
    width: 20,
    marginRight: 8,
  },
  addIndicator: {
    color: DraculaColors.green,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  removeIndicator: {
    color: DraculaColors.red,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  unchangedIndicator: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  lineContent: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  addedText: {
    color: DraculaColors.green,
  },
  removedText: {
    color: DraculaColors.red,
  },
  unchangedText: {
    color: DraculaColors.foreground,
  },
});
