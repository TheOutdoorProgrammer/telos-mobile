import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { draculaTheme } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={draculaTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: draculaTheme.colors.background,
            },
            headerTintColor: draculaTheme.colors.onBackground,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: draculaTheme.colors.background,
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Telos Files',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="chat"
            options={{
              title: 'Chat',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="approval"
            options={{
              title: 'Review Changes',
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              title: 'Create Telos File',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Settings',
            }}
          />
          <Stack.Screen
            name="preview"
            options={{
              title: 'Preview',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="chat-history"
            options={{
              title: 'Chat History',
              headerShown: false,
            }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
