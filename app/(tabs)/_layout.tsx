import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.secondary,
            tabBarStyle: {
                height: 55,
                borderWidth: 1,
                borderColor: Colors.border,
                borderTopColor: Colors.borderDark,
                backgroundColor: Colors.background,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
            headerShown: false
        }}>
            <Tabs.Screen
                name="(boulders)"
                options={{
                    title: 'Bouldery',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="random"
                options={{
                    title: 'Náhoda',
                    tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="dice" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Nastavení',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
                }}
            />
            <Tabs.Screen
                name="new_boulder"
                options={{
                    href: null
                }}
            />
            <Tabs.Screen
                name="edit_boulder"
                options={{
                    href: null
                }}
            />
        </Tabs>
    );
}
