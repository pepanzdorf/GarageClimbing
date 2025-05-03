import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../context';
import { apiURL } from '../../constants/Other';
import { Fonts } from '../../constants/Fonts';
import { Colors } from '../../constants/Colors';
import { crackIdToCrackName } from '../../scripts/utils';


export default function CrackSendsScreen() {
    const { fetchCrackStats, crackStats, token } = useContext(GlobalStateContext);

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
        fetch(`${apiURL}/crack/send/${sendId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => fetchCrackStats());
    }



    const renderCrackSend = ({item, index}) => {
        const sent_date = new Date(item.sent_date);

        return (
            <TouchableOpacity onPress={() => confirmSendDelete(item.id)}>
                <View style={styles.sendContainer}>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            {item.username}
                        </Text>
                        <Text style={Fonts.h3}>
                            { item.is_vertical ? "Vertikální" : "Horizontální" }
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.small}>
                            {`${sent_date.toLocaleDateString()} ${sent_date.toLocaleTimeString()}`}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            { item.climbed_times + " krát" }
                        </Text>
                        <Text style={Fonts.h3}>
                            {crackIdToCrackName(item.crack_type + 1)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <SectionList
                sections={crackStats.sends}
                renderItem={renderCrackSend}
                renderSectionHeader={({ section: { date } }) => (
                    <View style={{ padding: 10, alignItems: 'center' }}>
                        <Text style={Fonts.h1}>{date}</Text>
                    </View>
                )}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={Fonts.h3}>Žádné výlezy</Text>
                    </View>
                }
            />
            <TouchableOpacity style={styles.button} onPress={fetchCrackStats}>
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
        backgroundColor: Colors.crackPrimary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 15,
    },
});