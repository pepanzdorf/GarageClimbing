import { Stack } from 'expo-router';

export default function CrackStatStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[name]" options={{ headerShown: false }} />
    </Stack>
  );
}
