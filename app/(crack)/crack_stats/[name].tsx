import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { apiURL } from '../../../constants/Other';
import { crackIdToCrackName } from '../../../scripts/utils';

export default function UserStats() {
    const { name } = useLocalSearchParams();
    const { crackStats } = useContext(GlobalStateContext);
    const [userCrackStats, setUserCrackStats] = useState(null)

    const thisUserStats = () => {
        if (crackStats) {
            crackStats['users'].forEach((user) => {
                if (user[0] == name) {
                    setUserCrackStats(user[1]);
                }
            });
        }
    }

    useEffect(() => {
        thisUserStats();
    }
    , [crackStats, name]);

    return (
        <SafeAreaView style={styles.container}>
            {
                userCrackStats &&
                <View style={{flex:1}}>
                    <View style={styles.userStats}>
                        <ScrollView>
                            <View style={styles.header}>
                                <Text style={Fonts.h1}>{name}</Text>
                            </View>
                            <View style={styles.genericStats}>
                                <Text style={Fonts.h1}>Horizontální spára</Text>
                                {
                                    Object.keys(userCrackStats['horizontal']).map((crack) => {
                                        return (
                                            <View>
                                                <Text style={Fonts.h2}>{crackIdToCrackName(parseInt(crack)+1)}</Text>
                                                <View style={styles.row}>
                                                    <Text style={Fonts.h3}>Celkově:</Text>
                                                    <Text style={Fonts.h3}>{userCrackStats['horizontal'][crack]['climbed_distance']} m</Text>
                                                </View>
                                                <View style={styles.row}>
                                                    <Text style={Fonts.h3}>Nejlepší po sobě:</Text>
                                                    <Text style={Fonts.h3}>{userCrackStats['horizontal'][crack]['best_consecutive']} m</Text>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                            <View style={styles.genericStats}>
                                <Text style={Fonts.h1}>Vertikální spára</Text>
                                {
                                    Object.keys(userCrackStats['vertical']).map((crack) => {
                                        return (
                                            <View>
                                                <Text style={Fonts.h2}>{crackIdToCrackName(parseInt(crack)+1)}</Text>
                                                <View style={styles.row}>
                                                    <Text style={Fonts.h3}>Celkově:</Text>
                                                    <Text style={Fonts.h3}>{userCrackStats['vertical'][crack]['climbed_distance']} m</Text>
                                                </View>
                                                <View style={styles.row}>
                                                    <Text style={Fonts.h3}>Nejlepší po sobě:</Text>
                                                    <Text style={Fonts.h3}>{userCrackStats['vertical'][crack]['best_consecutive']} m</Text>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        </ScrollView>
                    </View>

                </View>
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    userStats: {
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
        flex: 1,
        padding: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 25,
        backgroundColor: Colors.transparentWhite,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
        paddingBottom: 10,
        marginBottom: 20,
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