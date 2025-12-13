import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

// Dracula color palette
export const DraculaColors = {
  background: '#282a36',
  current: '#44475a',
  foreground: '#f8f8f2',
  comment: '#6272a4',
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
};

export const draculaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: DraculaColors.purple,
    onPrimary: DraculaColors.foreground,
    primaryContainer: DraculaColors.current,
    onPrimaryContainer: DraculaColors.purple,

    secondary: DraculaColors.pink,
    onSecondary: DraculaColors.foreground,
    secondaryContainer: DraculaColors.current,
    onSecondaryContainer: DraculaColors.pink,

    tertiary: DraculaColors.cyan,
    onTertiary: DraculaColors.foreground,
    tertiaryContainer: DraculaColors.current,
    onTertiaryContainer: DraculaColors.cyan,

    error: DraculaColors.red,
    onError: DraculaColors.foreground,
    errorContainer: DraculaColors.current,
    onErrorContainer: DraculaColors.red,

    background: DraculaColors.background,
    onBackground: DraculaColors.foreground,

    surface: DraculaColors.background,
    onSurface: DraculaColors.foreground,
    surfaceVariant: DraculaColors.current,
    onSurfaceVariant: DraculaColors.comment,

    outline: DraculaColors.comment,
    outlineVariant: DraculaColors.current,

    inverseSurface: DraculaColors.foreground,
    inverseOnSurface: DraculaColors.background,
    inversePrimary: DraculaColors.purple,

    elevation: {
      level0: 'transparent',
      level1: DraculaColors.current + '0D',
      level2: DraculaColors.current + '14',
      level3: DraculaColors.current + '1F',
      level4: DraculaColors.current + '24',
      level5: DraculaColors.current + '29',
    },

    surfaceDisabled: DraculaColors.current + '1F',
    onSurfaceDisabled: DraculaColors.comment,
    backdrop: DraculaColors.background + 'CC',
  },
};
