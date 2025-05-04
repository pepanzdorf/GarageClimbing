import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../context';
import { apiURL } from '../../constants/Other';
import { Fonts } from '../../constants/Fonts';
import { Colors } from '../../constants/Colors';
import { ferrataGradeIdToGradeName } from '../../scripts/utils';


export default function FerrataSendsScreen() {
    const { fetchFerrataStats, ferrataStats, token } = useContext(GlobalStateContext);

    const confirmSendDelete = (sendId) => {
        Alert.alert("Vymazat výlez", "Opravdu chcete smazat tento výlez?",
            [
                {
                    text: "Ano",
                    onPress: () => deleteSend(sendId),
                },
                {
                    text: "Ne",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
            ]
        );
    }


    const deleteSend = (sendId) => {
        fetch(`${apiURL}/ferrata/send/${sendId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => fetchFerrataStats());
    }



    const renderFerrataSend = ({item, index}) => {
        const sent_date = new Date(item.sent_date);
        const hours = Math.floor(item.time_seconds / 3600);
        const minutes = Math.floor((item.time_seconds % 3600) / 60);
        const seconds = item.time_seconds % 60;


        return (
            <TouchableOpacity onPress={() => confirmSendDelete(item.id)}>
                <View style={styles.sendContainer}>
                    <View style={styles.row}>
                        <Text style={Fonts.h2}>
                            {item.ferrata_name}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            {item.username}
                        </Text>
                        <Text style={Fonts.small}>
                            {`${sent_date.toLocaleDateString()} ${sent_date.toLocaleTimeString()}`}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            Vylezeno: { item.climbed_times } krát
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            Obtížnost: {ferrataGradeIdToGradeName(item.grade)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            Doba: {hours == 0 ? '' : hours + ' hodin '}{minutes == 0 ? '' : minutes + ' minut '}{seconds} sekund
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={ferrataStats.sends}
                renderItem={renderFerrataSend}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={Fonts.h3}>Žádné výlezy</Text>
                    </View>
                }
            />
            <TouchableOpacity style={styles.button} onPress={fetchFerrataStats}>
                <Text style={Fonts.h3}>Obnovit</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
        paddingBottom: 10,
    },
    sendContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        borderRadius: 10,
        marginBottom: 8,
        backgroundColor: Colors.darkerBackground,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
        width: "100%",
    },
    button: {
        backgroundColor: Colors.ferrataPrimary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 15,
    },
});