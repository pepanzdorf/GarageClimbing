import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false}}>
            <Tabs.Screen
                name="index/index"
                options={{
                title: 'Home',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="random"
                options={{
                title: 'Random',
                tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="dice" color={color} />,
                }}
            />
            <Tabs.Screen
                name="index/[id]"
                options={{
                href: null,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                title: 'Settings',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                }}
            />
        </Tabs>
    );
}
