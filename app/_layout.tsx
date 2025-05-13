import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserContextProvider } from '@/context/UserContext';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <UserContextProvider>
                <Stack>
                    <Stack.Screen name="(boulder)" options={{ headerShown: false }} />
                    <Stack.Screen name="(crack)" options={{ headerShown: false }} />
                    <Stack.Screen name="(ferrata)" options={{ headerShown: false }} />
                </Stack>
            </UserContextProvider>
        </SafeAreaProvider>
    );
}
