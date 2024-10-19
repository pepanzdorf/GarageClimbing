import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { apiURL } from '../../../constants/Other';


export default function TimerIndex(){
    const { savedTimers, setSavedTimers, setCurrentTimer } = useContext(GlobalStateContext);
    const router = useRouter();


    const renderTimer = ({item, index}) => {
        return (
            <View style={styles.timerContainer}>
                <TouchableOpacity onPress={() => showTimer(item)}>
                    <Text style={Fonts.h3}>{item.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTimer(index)}>
                    <Text style={[Fonts.h3, {color: 'red'}]}>Smazat</Text>
                </TouchableOpacity>
            </View>
        )
    }

    function createNewTimer() {
        router.push(`timers/Nový časovač`);
    }

    function showTimer(timer) {
        setCurrentTimer(timer);
        router.push(`timers/${timer.name}`);
    }

    function deleteTimer(index) {
        const newSavedTimers = [...savedTimers];
        newSavedTimers.splice(index, 1);
        setSavedTimers(newSavedTimers);
    }


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={Fonts.h1}>Časovače</Text>
            </View>
            {
                savedTimers === null ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                ) : (
                    <FlatList
                        data={savedTimers}
                        renderItem={renderTimer}
                        keyExtractor={item => item.name}
                    />
                )
            }
            <TouchableOpacity onPress={createNewTimer}>
                <View style={styles.button}>
                    <Text style={Fonts.h3}>Nový časovač</Text>
                </View>
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
         backgroundColor: Colors.primary,
         padding: 10,
         alignItems: 'center',
         borderWidth: 1,
         borderRadius: 10,
         marginTop: 15,
         marginRight: 20,
         marginLeft: 20,
    },
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.darkerBorder,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: Colors.primary,
    },
    header: {
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
    },
});
