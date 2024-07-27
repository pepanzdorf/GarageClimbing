import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'


export default function Info(){
    const { holds, boulders, stats } = useContext(GlobalStateContext);
    const [ nHolds, setNHolds ] = useState(0);
    const [ nVolumes, setNVolumes ] = useState(0);

    const calculateSends = () => {
        let sends = 0;
        stats.forEach((stat) => {
            sends += stat[1]['all_sends'];
        });
        return sends;
    }

    useEffect(() => {
        if (holds && holds['true'] && holds['false']) {
            setNHolds(holds['false'].length);
            setNVolumes(holds['true'].length);
        }
    }
    , [holds]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={Fonts.h1}>Garážové lezení</Text>
                </View>
                <View style={styles.info}>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Youtube: </Text>
                        <Text style={styles.link} onPress={() => Linking.openURL('https://www.youtube.com/@KokosKokosovic')}>https://www.youtube.com/@KokosKokosovic</Text>
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Počet chytů: </Text>
                        {
                            holds && (<Text style={Fonts.plainBold}>{nHolds}</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Počet struktur: </Text>
                        {
                            holds && (<Text style={Fonts.plainBold}>{nVolumes}</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Počet boulderů: </Text>
                        {
                            boulders && (<Text style={Fonts.plainBold}>{boulders.length}</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Počet výlezů: </Text>
                        {
                            stats && (<Text style={Fonts.plainBold}>{calculateSends()}</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Autor aplikace: </Text>
                        <Text style={Fonts.plainBold}>Melichar Konečný</Text>
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Verze aplikace: </Text>
                        <Text style={Fonts.plainBold}>1.0.0</Text>
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
        backgroundColor: Colors.primary,
        marginBottom: 20,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    link: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    field: {
    },
});
