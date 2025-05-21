import { Stack } from 'expo-router';

export default function SettingsStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack>
    );
}
