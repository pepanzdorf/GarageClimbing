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
                    <Text style={Fonts.h1}>Garážové lezení - ferraty</Text>
                </View>
                <View style={styles.info}>
                    <TouchableOpacity onPress={() => router.navigate('/')}>
                        <View style={styles.bouldersLink}>
                            <Text style={Fonts.h3}>Jít na bouldery</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.navigate('/(crack)/log')}>
                        <View style={styles.crackLink}>
                            <Text style={Fonts.h3}>Jít na spáru</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Via ferrata</Text>
                        <Text style={Fonts.plainBold}>
                            Možnost zápisu výlezů ferrat.
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
        backgroundColor: Colors.ferrataPrimary,
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
        backgroundColor: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    crackLink: {
        flex: 1,
        backgroundColor: Colors.crackPrimary,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});
