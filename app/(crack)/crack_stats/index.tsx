import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { apiURL } from '../../../constants/Other';


export default function CrackStats(){
    const { crackStats, fetchCrackStats } = useContext(GlobalStateContext);
    const router = useRouter();

    const renderUser = ({item, index}) => {
        let bc = Colors.crackPrimary;
        if (index == 0) {
            bc = Colors.first;
        } else if (index == 1) {
            bc = Colors.second;
        } else if (index == 2) {
            bc = Colors.third;
        }

        return (
            <TouchableOpacity onPress={() => router.push(`crack_stats/${item[0]}`)}>
                <View style={[styles.userContainer, {backgroundColor: bc}]}>
                    <View style={styles.row}>
                        <Text style={Fonts.h2}>{index+1}. {item[0]}</Text>
                        <Text style={Fonts.h2}>{item[1]['overall_distance']} m</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
        {
            crackStats && (
            <View style={{flex:1}}>
                <View style={styles.allUserStats}>
                    <View style={styles.header}>
                        <Text style={Fonts.h1}>Žebříček</Text>
                    </View>
                    <FlatList
                        data={crackStats['users']}
                        renderItem={renderUser}
                        keyExtractor={item => item[0]}
                    />
                </View>
            </View>
            )
        }
        <TouchableOpacity style={styles.button} onPress={fetchCrackStats}>
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
        paddingBottom: 10,
    },
    button: {
        backgroundColor: Colors.crackPrimary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 15,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
    allUserStats: {
        padding: 10,
        gap: 10,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
        flex: 2
    },
    userContainer: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
});
