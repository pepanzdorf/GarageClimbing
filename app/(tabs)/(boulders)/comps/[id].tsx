import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../../context';
import { apiURL } from '../../../../constants/Other';
import ScrollPicker from "react-native-wheel-scrollview-picker";
import { NumberInput } from '../../../../components/NumberInput';
import { Fonts } from '../../../../constants/Fonts';
import { gradeIdToGradeName, attemptIdToAttemptName, findBoulderById } from '../../../../scripts/utils';
import { Colors } from '../../../../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';


export default function CompScreen() {
    const { id } = useLocalSearchParams();
    const { currentCompetition, boulders, setCurrentBoulder, settings, token } = useContext(GlobalStateContext);
    const router = useRouter();
    const [ visible, setVisible ] = useState([]);
    const [ zoneAttempts, setZoneAttempts ] = useState([]);
    const [ topAttempts, setTopAttempts ] = useState([]);
    const [ showModal, setShowModal ] = useState(false);
    const [ minutesPerBoulder, setMinutesPerBoulder ] = useState(5);
    const [ sends, setSends ] = useState([]);

    const attemptData = Array.from({length: 12}, (_, i) => attemptIdToAttemptName(i-1));


    useEffect(() => {
        setVisible(Array(currentCompetition.boulders.length).fill(false));
        setZoneAttempts(Array(currentCompetition.boulders.length).fill(0));
        setTopAttempts(Array(currentCompetition.boulders.length).fill(0));
        fetchSends();
    }, [currentCompetition, id]);

    const renderBoulder = (boulder_id, index) => {
        const boulder = findBoulderById(boulder_id, boulders);
        return (
            <View key={boulder.id} style={styles.compBoulder}>
                <TouchableOpacity onPress={visible[index] ? (() => handleReroute(boulder)) : (() => {})}>
                    <Text style={Fonts.h2}>
                        {
                            visible[index] ? ( boulder.name ) : ( '*'.repeat(boulder.name.length) )
                        }
                    </Text>
                </TouchableOpacity>
                <FontAwesome name="eye" size={35} color={Colors.primary} onPress={() => handleVisible(index)}/>
            </View>
        );
    }


    const renderCompSend = (send) => {
        return (
            <TouchableOpacity key={send.sent_date} style={styles.compSend} onPress={() => confirmSendDelete(send.id)}>
                <View style={styles.row}>
                    <Text style={Fonts.h2}>{send.name}</Text>
                    <Text style={Fonts.small}>{new Date(send.sent_date).toLocaleDateString() + " " + new Date(send.sent_date).toLocaleTimeString()}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={Fonts.plain}>Čas na boulder: {send.time} min</Text>
                </View>
                {
                    currentCompetition.boulders.map((_, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={Fonts.plainBold}>Boulder {index + 1}:</Text>
                            <Text style={Fonts.plain}>
                                {attemptIdToAttemptName(send.zone[index])} z/{attemptIdToAttemptName(send.top[index])} t
                            </Text>
                        </View>
                    ))
                }
            </TouchableOpacity>
        );
    }


    function handleReroute(boulder) {
        setCurrentBoulder(boulder);
        router.push(`${boulder.id}`);
    }

    function handleVisible(index) {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
    }

    function pickerSetZoneAttempts(index, value) {
        const newZoneAttempts = [...zoneAttempts];
        newZoneAttempts[index] = value;
        setZoneAttempts(newZoneAttempts);
    }

    function pickerSetTopAttempts(index, value) {
        const newTopAttempts = [...topAttempts];
        newTopAttempts[index] = value;
        setTopAttempts(newTopAttempts);
    }

    const logCompSend = async () => {
        const response = await fetch(`${apiURL}/competition/log_send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                comp_id: id,
                angle: settings.angle,
                zoneAttempts: zoneAttempts,
                topAttempts: topAttempts,
                time: minutesPerBoulder
            }),
        })
        if (!response.ok) {
            alert(jsonResponse);
            return;
        }
        const jsonResponse = await response.text();
        setShowModal(false);
        fetchSends();
    }


    const fetchSends = async () => {
        const response = await fetch(`${apiURL}/competition/${id}`);
        if (!response.ok) {
            return;
        }
        const jsonResponse = await response.json();
        setSends(jsonResponse);
    }


    const confirmSendDelete = (sendId) => {
        Alert.alert("Vymazat výsledek", "Opravdu chcete smazat tento výsledek?",
            [
                {
                    text: "Ano",
                    onPress: () => deleteCompSend(sendId),
                },
                {
                    text: "Ne",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
            ]
        );
    }

    const deleteCompSend = (sendId) => {
        fetch(`${apiURL}/competition/send/${sendId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => fetchSends());
    }

    const confirmCompDelete = () => {
        Alert.alert("Vymazat turnaj", "Opravdu chcete smazat tento turnaj?",
            [
                {
                    text: "Ano",
                    onPress: () => deleteComp(),
                },
                {
                    text: "Ne",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
            ]
        );
    }

    const deleteComp = () => {
        fetch(`${apiURL}/competition/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => router.push('/'));
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.title}>
                <Text style={Fonts.h1}>{currentCompetition.name}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={Fonts.h2}>Bouldery:</Text>
                {
                    currentCompetition.boulders.map((boulder_id, index) => (
                        renderBoulder(boulder_id, index)
                    ))
                }
                <Text style={Fonts.h2}>Výsledky:</Text>
                {
                    sends.map((send, index) => (
                        renderCompSend(send)
                    ))
                }
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
                <Text style={Fonts.h2}>Zapsat výsledek</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={confirmCompDelete}>
                <Text style={Fonts.h2}>Vymazat</Text>
            </TouchableOpacity>
            <Modal visible={showModal} transparent={true}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <ScrollView contentContainerStyle={styles.allAttemptsContainer}>
                            <View style={styles.row}>
                                <Text style={Fonts.h3}>Minut na boulder:</Text>
                                <NumberInput value={minutesPerBoulder} setValue={setMinutesPerBoulder} minValue={1} size={30}/>
                            </View>
                            {
                                currentCompetition.boulders.map((_, picker_index) => (
                                    <View style={styles.attemptsContainer} key={picker_index}>
                                        <Text style={Fonts.h3}>Boulder {picker_index + 1}</Text>
                                        <View style={styles.scrollerContainer}>
                                            <Text>Zóna:</Text>
                                            <ScrollPicker
                                                dataSource={attemptData}
                                                selectedIndex={zoneAttempts[picker_index]}
                                                wrapperHeight={styles.pickerWrapperHeight}
                                                wrapperBackground={Colors.background}
                                                itemHeight={styles.pickerItemHeight}
                                                highlightColor={Colors.border}
                                                itemTextStyle={Fonts.h3}
                                                activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                                                onValueChange={(_, index) => pickerSetZoneAttempts(picker_index, index)}
                                            />
                                            <Text>Top:</Text>
                                            <ScrollPicker
                                                dataSource={attemptData}
                                                selectedIndex={topAttempts[picker_index]}
                                                wrapperHeight={styles.pickerWrapperHeight}
                                                wrapperBackground={Colors.background}
                                                itemHeight={styles.pickerItemHeight}
                                                highlightColor={Colors.border}
                                                itemTextStyle={Fonts.h3}
                                                activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                                                onValueChange={(_, index) => pickerSetTopAttempts(picker_index, index)}
                                            />
                                        </View>
                                    </View>
                                ))
                            }
                        </ScrollView>
                        <TouchableOpacity onPress={logCompSend} style={[styles.button, {width: '100%'}]}>
                            <Text style={Fonts.h3}>Uložit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowModal(false)} style={[styles.button, {width: '100%'}]}>
                            <Text style={Fonts.h3}>Zrušit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        gap: 20,
    },
    title: {
        padding: 20,
        alignItems: 'center',
    },
    compBoulder: {
        padding: 15,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.border,
        width: "90%",
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginRight: 20,
        marginLeft: 20,
        marginBottom: 15,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '90%',
    },
    attemptsContainer: {
        width: '100%',
    },
    scrollerContainer: {
        flexDirection: 'row',
        height: 50,
        width: '100%',
        gap: 10,
        marginTop: 10,
    },
    allAttemptsContainer: {
        flexDirection: 'column',
        gap: 15,
        width: '100%',
        paddingBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerWrapperHeight: 50,
    pickerItemHeight: 25,
    compSend: {
        padding: 15,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.border,
        width: "90%",
    },
    deleteButton: {
        backgroundColor: Colors.highlight,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginRight: 20,
        marginLeft: 20,
        marginBottom: 15,
    },
});