import { Stack } from 'expo-router/stack';
import { GlobalStateProvider } from './context';
import { Slot } from 'expo-router';

export default function Layout() {
  return (
  <GlobalStateProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  </GlobalStateProvider>
  );
}
