import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { FerrataContextProvider } from "@/context/FerrataContext";
import Colors from '@/constants/Colors'

export default function FerrataTabLayout() {
    return (
        <FerrataContextProvider>
            <Tabs screenOptions={{
                tabBarActiveTintColor: Colors.ferrataPrimary,
                tabBarInactiveTintColor: Colors.ferrataSecondary,
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
                    name="index"
                    options={{
                        title: 'Zápis',
                        tabBarIcon: ({ color }) => <FontAwesome6 size={28} name="file-pen" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="ferrata_sends"
                    options={{
                        title: 'Výlezy',
                        tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="list" color={color} />,
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
        </FerrataContextProvider>
    );
}
