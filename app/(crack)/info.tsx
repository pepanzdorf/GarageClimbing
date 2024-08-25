import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'
import { useRouter } from 'expo-router';


export default function Info(){
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={Fonts.h1}>Garážové lezení - spára</Text>
                </View>
                <View style={styles.info}>
                    <TouchableOpacity onPress={() => router.navigate('/')}>
                        <View style={styles.bouldersLink}>
                            <Text style={Fonts.h3}>Jít na bouldery</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Horizontální spára: </Text>
                        <Text style={Fonts.plainBold}>
                            Horizontální spára je samostojná délky 4 metry. Lze na ní lézt dlaň nebo pěst.
                        </Text>
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Vertikální spára: </Text>
                        <Text style={Fonts.plainBold}>
                            Vertikální spára má 5 metrů. Je nastavitelná, takže na ní lze lézt od prstů až po komín.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    info: {
        marginTop: 20,
        flex: 1,
        textAlign: 'center',
        padding: 10,
        paddingLeft: 30,
        paddingRight: 30,
        gap: 20,
    },
    header: {
        alignItems: 'center',
        backgroundColor: Colors.crackPrimary,
        marginBottom: 20,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    field: {
    },
    bouldersLink: {
        flex: 1,
        marginBottom: 20,
        backgroundColor: Colors.crackPrimary,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});
