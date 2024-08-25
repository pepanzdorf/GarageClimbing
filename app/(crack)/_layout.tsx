import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'

export default function CrackTabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: Colors.crackPrimary,
            tabBarInactiveTintColor: Colors.crackSecondary,
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
                name="log"
                options={{
                    title: 'Zápis',
                    tabBarIcon: ({ color }) => <FontAwesome6 size={28} name="file-pen" color={color} />,
                }}
            />
            <Tabs.Screen
                name="info"
                options={{
                    title: 'Info',
                    tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="info" color={color} />,
                }}
            />
        </Tabs>
    );
}
