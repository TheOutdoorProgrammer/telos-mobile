import { diffLines, Change } from 'diff';
import { DiffLine } from '../types/approval';

/**
 * Generate a line-by-line diff between two strings
 */
export function generateDiff(original: string, proposed: string): DiffLine[] {
  const changes: Change[] = diffLines(original, proposed);
  const result: DiffLine[] = [];
  let lineNumber = 1;

  for (const change of changes) {
    const lines = change.value.split('\n');

    // Remove empty last line if present
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    for (const line of lines) {
      if (change.added) {
        result.push({
          type: 'add',
          content: line,
          lineNumber,
        });
        lineNumber++;
      } else if (change.removed) {
        result.push({
          type: 'remove',
          content: line,
        });
      } else {
        result.push({
          type: 'unchanged',
          content: line,
          lineNumber,
        });
        lineNumber++;
      }
    }
  }

  return result;
}

/**
 * Apply diff to get the new content
 * (reconstructs the proposed content from the diff)
 */
export function applyDiff(diffLines: DiffLine[]): string {
  return diffLines
    .filter(line => line.type !== 'remove')
    .map(line => line.content)
    .join('\n');
}

/**
 * Get summary statistics about the diff
 */
export function getDiffStats(diffLines: DiffLine[]): {
  additions: number;
  deletions: number;
  unchanged: number;
} {
  return {
    additions: diffLines.filter(line => line.type === 'add').length,
    deletions: diffLines.filter(line => line.type === 'remove').length,
    unchanged: diffLines.filter(line => line.type === 'unchanged').length,
  };
}

/**
 * Collapse consecutive unchanged lines (for better mobile UI)
 * Keeps N lines of context around changes
 */
export function collapseUnchangedLines(
  diffLines: DiffLine[],
  contextLines: number = 3
): DiffLine[] {
  const result: DiffLine[] = [];
  let i = 0;

  while (i < diffLines.length) {
    const line = diffLines[i];

    if (line.type !== 'unchanged') {
      // This is a change, include it
      result.push(line);
      i++;
    } else {
      // This is unchanged, check how many consecutive unchanged lines we have
      let unchangedStart = i;
      let unchangedCount = 0;

      while (
        i < diffLines.length &&
        diffLines[i].type === 'unchanged'
      ) {
        unchangedCount++;
        i++;
      }

      const hasChangesBefore = unchangedStart > 0;
      const hasChangesAfter = i < diffLines.length;

      if (unchangedCount <= contextLines * 2) {
        // Few unchanged lines, include them all
        for (let j = unchangedStart; j < unchangedStart + unchangedCount; j++) {
          result.push(diffLines[j]);
        }
      } else {
        // Many unchanged lines, collapse the middle
        if (hasChangesBefore) {
          // Show context lines after the previous change
          for (let j = unchangedStart; j < unchangedStart + contextLines; j++) {
            result.push(diffLines[j]);
          }
        }

        // Add a marker for collapsed lines
        result.push({
          type: 'unchanged',
          content: `... (${unchangedCount - (hasChangesBefore ? contextLines : 0) - (hasChangesAfter ? contextLines : 0)} lines hidden)`,
        });

        if (hasChangesAfter) {
          // Show context lines before the next change
          for (let j = i - contextLines; j < i; j++) {
            result.push(diffLines[j]);
          }
        }
      }
    }
  }

  return result;
}
