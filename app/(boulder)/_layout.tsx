import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors'
import { SettingsContextProvider } from "@/context/SettingsContext";
import { TimerContextProvider } from "@/context/TimerContext";
import { BoulderContextProvider } from "@/context/BoulderContext";

export default function BoulderTabLayout() {
    return (
        <SettingsContextProvider>
            <TimerContextProvider>
                <BoulderContextProvider>
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
                            name="(routes)"
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
                            name="timer"
                            options={{
                                title: 'Časovač',
                                tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="clock" color={color} />,
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
                            name="stats"
                            options={{
                                title: 'Žebříček',
                                tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="medal" color={color} />,
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
                </BoulderContextProvider>
            </TimerContextProvider>
        </SettingsContextProvider>
    );
}
