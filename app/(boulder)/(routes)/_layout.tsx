import { Stack } from 'expo-router';

export default function RouteStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
            <Stack.Screen name="send/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="boulder_editor" options={{ headerShown: false }} />
            <Stack.Screen name="comp/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="comp/comp_editor" options={{ headerShown: false }} />
            <Stack.Screen name="timer" options={{ headerShown: false }} />
        </Stack>
    );
}
