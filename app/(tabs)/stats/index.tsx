import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView,Button, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { apiURL } from '../../../constants/Other';
import { gradeIdToGradeName } from '../../../scripts/utils';


export default function Stats(){
    const { token, settings, loggedUser } = useContext(GlobalStateContext);
    const [stats, setStats] = useState(null);
    const [userStats, setUserStats] = useState(null)

    const fetchUserStats = () => {
        fetch(`${apiURL}/climbing/stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({angle: settings.angle})
        })
            .then(response => response.json())
            .then(response => setStats(response))
            .catch(error => console.log(error));
    }

    const thisUserStats = () => {
        if (loggedUser == 'Nepřihlášen') {
            return;
        }
        if (stats) {
            stats.forEach((item) => {
                if (item[0] == loggedUser) {
                    setUserStats(item[1]);
                }
            });
        }
    }

    useEffect(() => {
        fetchUserStats();
        thisUserStats();
    }
    , [token]);

    useEffect(() => {
        thisUserStats();
    }
    , [stats]);

    const renderUser = ({item, index}) => {
        return (
            <View style={styles.row}>
                <Text style={Fonts.h2}>{index+1}. {item[0]}</Text>
                <Text style={Fonts.h2}>{item[1]['sum_flashes']}/{item[1]['sum_sends']}</Text>
                <Text style={Fonts.h2}>{item[1]['score']}</Text>
            </View>
        )
    }


    return (
        <SafeAreaView style={styles.container}>
        <View style={{flex: 1}}>
        {
            stats && (
            <View>
                <ScrollView>
                    {
                        loggedUser == 'Nepřihlášen' ? (null) : (
                            userStats && (
                                <View style={{gap:2}}>
                                    <View style={styles.header}>
                                        <Text style={Fonts.h1}>{loggedUser}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={Fonts.h3}>Skóre:</Text>
                                        <Text style={Fonts.plainBold}>{userStats['score']}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={Fonts.h3}>Počet výlezů (i duplicitní):</Text>
                                        <Text style={Fonts.plainBold}>{userStats['all_sends']}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={Fonts.h3}>Splněných výzev (unikátní):</Text>
                                        <Text style={Fonts.plainBold}>{userStats['challenges']}</Text>
                                    </View>
                                    <View>
                                        {
                                            Object.keys(userStats['unique_sends']).map((key) => {
                                                return (
                                                    <View>
                                                        <Text style={Fonts.h3}>{gradeIdToGradeName(key, settings.grading)}:</Text>
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
                                </View>
                            )
                        )
                    }
                </ScrollView>
                <View>
                    <View style={[styles.header, {marginTop: 30}]}>
                        <Text style={Fonts.h1}>Žebříček</Text>
                    </View>
                    <FlatList
                        data={stats}
                        renderItem={renderUser}
                        keyExtractor={item => item[0]}
                    />
                </View>
            </View>
            )
        }
        </View>
        <TouchableOpacity style={styles.button} onPress={fetchUserStats}>
            <Text style={Fonts.h3}>Obnovit</Text>
        </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 15,
    },
    header: {
        alignItems: 'center',
        paddingTop: 10,
        marginBottom: 20,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
});
