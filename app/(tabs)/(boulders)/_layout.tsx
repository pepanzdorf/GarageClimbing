import { Stack } from 'expo-router';

export default function BoulderStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="sends/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="comps/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
