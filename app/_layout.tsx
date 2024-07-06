import { Stack } from 'expo-router/stack';
import { GlobalStateProvider } from './context';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
      <SafeAreaProvider>
          <GlobalStateProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </GlobalStateProvider>
        </SafeAreaProvider>
  );
}
