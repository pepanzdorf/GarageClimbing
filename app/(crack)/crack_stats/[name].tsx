import { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrackContext } from "@/context/CrackContext";
import { crackIdToCrackName } from '@/scripts/utils';
import { UserCrackStatsType } from "@/types/userCrackStatsType";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'
import CommonStyles from "@/constants/CommonStyles";


export default function CrackUserStats() {
    const { name } = useLocalSearchParams();
    const { crackStats } = useContext(CrackContext);
    const [ userCrackStats, setUserCrackStats ] = useState<UserCrackStatsType>()

    const thisUserStats = () => {
        crackStats['users'].forEach((user) => {
            if (user[0] === name) {
                setUserCrackStats(user[1]);
            }
        });
    }

    useEffect(() => {
        thisUserStats();
    }
    , [crackStats, name]);

    return (
        <SafeAreaView style={[CommonStyles.paddedContainer, {paddingBottom: 20}]}>
            {
                userCrackStats &&
                <ScrollView contentContainerStyle={styles.userStatsContainer}>
                    <View style={styles.header}>
                        <Text style={Fonts.h1}>{name}</Text>
                    </View>
                    <View style={styles.genericStats}>
                        <Text style={Fonts.h1}>Horizontální spára</Text>
                        {
                            userCrackStats['horizontal'] &&
                            Object.keys(userCrackStats['horizontal']).map((crack) => {
                                return (
                                    <View key={crack}>
                                        <Text style={Fonts.h2}>{crackIdToCrackName(parseInt(crack)+1)}</Text>
                                        <View style={CommonStyles.justifiedRow}>
                                            <Text style={Fonts.plain}>Celkově:</Text>
                                            <Text style={Fonts.plain}>{userCrackStats['horizontal'][crack]['climbed_distance']} m</Text>
                                        </View>
                                        <View style={CommonStyles.justifiedRow}>
                                            <Text style={Fonts.plain}>Nejlepší po sobě:</Text>
                                            <Text style={Fonts.plain}>{userCrackStats['horizontal'][crack]['best_consecutive']} m</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>
                    <View style={styles.genericStats}>
                        <Text style={Fonts.h1}>Vertikální spára</Text>
                        {
                            userCrackStats['vertical'] &&
                            Object.keys(userCrackStats['vertical']).map((crack) => {
                                return (
                                    <View key={crack}>
                                        <Text style={Fonts.h2}>{crackIdToCrackName(parseInt(crack)+1)}</Text>
                                        <View style={CommonStyles.justifiedRow}>
                                            <Text style={Fonts.plain}>Celkově:</Text>
                                            <Text style={Fonts.plain}>{userCrackStats['vertical'][crack]['climbed_distance']} m</Text>
                                        </View>
                                        <View style={CommonStyles.justifiedRow}>
                                            <Text style={Fonts.plain}>Nejlepší po sobě:</Text>
                                            <Text style={Fonts.plain}>{userCrackStats['vertical'][crack]['best_consecutive']} m</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>
                </ScrollView>
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    userStatsContainer: {
        padding: 10,
        gap: 10,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
        flex: 1
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 25,
        backgroundColor: Colors.transparentWhite,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    genericStats: {
        gap: 10,
        marginBottom: 20,
        padding: 10,
        backgroundColor: Colors.transparentWhite,
        borderRadius: 25,
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
});