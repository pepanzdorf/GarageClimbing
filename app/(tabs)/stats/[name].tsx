import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView,Button, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { apiURL } from '../../../constants/Other';
import { gradeIdToGradeName } from '../../../scripts/utils';


export default function LogScreen() {
    const { name } = useLocalSearchParams();
    const { stats, settings } = useContext(GlobalStateContext);
    const router = useRouter();
    const [userStats, setUserStats] = useState(null)


    const thisUserStats = () => {
        if (stats) {
            stats.forEach((item) => {
                if (item[0] == name) {
                    setUserStats(item[1]);
                }
            });
        }
    }

    useEffect(() => {
        thisUserStats();
    }
    , [stats, name]);


    return (
        <SafeAreaView style={styles.container}>
            {
                userStats && (
                    <View style={styles.userStats}>
                        <ScrollView>
                            <View style={styles.header}>
                                <Text style={Fonts.h1}>{name}</Text>
                            </View>
                            <View style={styles.genericStats}>
                                <Text style={Fonts.h3}>Skóre:</Text>
                                <Text style={Fonts.plainBold}>{userStats['score']}</Text>
                                <Text style={Fonts.h3}>Počet výlezů (i duplicitní):</Text>
                                <Text style={Fonts.plainBold}>{userStats['all_sends']}</Text>
                                <Text style={Fonts.h3}>Splněných výzev (unikátní):</Text>
                                <Text style={Fonts.plainBold}>{userStats['challenges']}</Text>
                            </View>
                            <View style={{gap: 5}}>
                                {
                                    Object.keys(userStats['unique_sends']).map((key) => {
                                        return (
                                            <View key={key} style={styles.boulderStatsContainer}>
                                                <Text style={Fonts.h3}>{gradeIdToGradeName(key, settings.grading)}</Text>
                                                <View style={styles.row}>
                                                    <Text style={Fonts.plainBold}>Výlezů:</Text>
                                                    <Text style={Fonts.plainBold}>{userStats['unique_sends'][key]['sends']}</Text>
                                                    <Text style={Fonts.plainBold}>Z toho flashů:</Text>
                                                    <Text style={Fonts.plainBold}>{userStats['unique_sends'][key]['flashes']}</Text>
                                                </View>
                                            </View>
                                        )
                                    }
                                    )
                                }
                            </View>
                        </ScrollView>
                    </View>
                )
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    userStats: {
        backgroundColor: Colors.darkerBackground,
        borderRadius: 25,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        flex: 1,
        padding: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
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
    },
    boulderStatsContainer: {
        padding: 10,
        gap: 10,
        backgroundColor: Colors.primary,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    genericStats: {
        gap: 10,
        marginBottom: 20,
        padding: 10,
    },
});