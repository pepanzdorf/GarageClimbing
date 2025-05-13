import { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoulderContext } from "@/context/BoulderContext";
import { SettingsContext } from "@/context/SettingsContext";
import { UserContext } from "@/context/UserContext";
import { apiURL } from '@/constants/Other';
import { NumberInput } from "@/components/NumberInput";
import { attemptIdToAttemptName, confirmAction, findBoulderById } from '@/scripts/utils';
import { FontAwesome } from '@expo/vector-icons';
import { CompSendType } from "@/types/compSendType";
import { BoulderType } from "@/types/boulderType";
import Fonts from '@/constants/Fonts';
import Colors from '@/constants/Colors';
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";
import StyledScrollPicker from "@/components/StyledScrollPicker";


export default function CompScreen() {
    const { id } = useLocalSearchParams();
    const { currentCompetition, boulders, setCurrentBoulder, fetchCompetitions } = useContext(BoulderContext);
    const { settings } = useContext(SettingsContext);
    const { token } = useContext(UserContext);
    const [ visible, setVisible ] = useState<boolean[]>([]);
    const [ zoneAttempts, setZoneAttempts ] = useState<number[]>([]);
    const [ topAttempts, setTopAttempts ] = useState<number[]>([]);
    const [ showModal, setShowModal ] = useState(false);
    const [ minutesPerBoulder, setMinutesPerBoulder ] = useState(5);
    const [ sends, setSends ] = useState<CompSendType[]>([]);

    const router = useRouter();
    const attemptData =
        Array.from({length: 12}, (_, i) => ({
            value: i,
            label: attemptIdToAttemptName(i - 1)
    }));


    useEffect(() => {
        if (!currentCompetition) return;
        setVisible(Array(currentCompetition.boulders.length).fill(false));
        setZoneAttempts(Array(currentCompetition.boulders.length).fill(0));
        setTopAttempts(Array(currentCompetition.boulders.length).fill(0));
        fetchCompSends().catch(console.error);
    }, [currentCompetition, id]);

    const renderBoulder = (boulder_id: number, index: number) => {
        const boulder = findBoulderById(boulder_id, boulders);
        if (!boulder) return null;

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


    const renderCompSend = (send: CompSendType) => {
        if (!currentCompetition) return;
        return (
            <TouchableOpacity key={send.id} style={styles.compSend} onPress={() =>
                confirmAction(
                    "Vymazat výlez",
                    "Opravdu chcete smazat tento výlez?",
                    () => deleteCompSend(send.id, currentCompetition.id)
                )
            }>
                <View style={CommonStyles.justifiedRow}>
                    <Text style={Fonts.h2}>{send.name}</Text>
                    <Text style={Fonts.small}>{new Date(send.sent_date).toLocaleDateString() + " " + new Date(send.sent_date).toLocaleTimeString()}</Text>
                </View>
                <View style={CommonStyles.justifiedRow}>
                    <Text style={Fonts.plain}>Čas na boulder: {send.time} min</Text>
                </View>
                {
                    currentCompetition &&
                    currentCompetition.boulders.map((_, index) => (
                        <View key={index} style={CommonStyles.justifiedRow}>
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


    const handleReroute = (boulder: BoulderType) => {
        setCurrentBoulder(boulder);
        router.push(`/${boulder.id}`);
    }


    const handleVisible = (index: number) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
    }


    const pickerSetZoneAttempts = (index: number, value: number) => {
        const newZoneAttempts = [...zoneAttempts];
        newZoneAttempts[index] = value;
        setZoneAttempts(newZoneAttempts);
    }


    const pickerSetTopAttempts = (index: number, value: number) => {
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
            const responseText = await response.text();
            alert(responseText);
            return;
        }

        if (currentCompetition) {
            setZoneAttempts(Array(currentCompetition.boulders.length).fill(0));
            setTopAttempts(Array(currentCompetition.boulders.length).fill(0));
        }
        setShowModal(false);
        fetchCompSends().catch(console.error);
    }


    const fetchCompSends = async () => {
        const response = await fetch(`${apiURL}/competition/${id}`);
        if (!response.ok) {
            return;
        }
        const jsonResponse = await response.json();
        setSends(jsonResponse);
    }


    const deleteCompSend = (sendId: number, compId: number) => {
        fetch(`${apiURL}/competition/send/${compId}?send_id=${sendId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => fetchCompSends());
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
            .finally(() => {
                fetchCompetitions();
                router.back();
            });
    }

    return (
        currentCompetition &&
        <SafeAreaView style={CommonStyles.paddedContainerHorizontal}>
            <View style={[CommonStyles.centered, {paddingVertical: 20}]}>
                <Text style={Fonts.h1}>{currentCompetition.name}</Text>
            </View>
            <ScrollView contentContainerStyle={[CommonStyles.centered, CommonStyles.gapped]}>
                <Text style={Fonts.h2}>Bouldery:</Text>
                {
                    currentCompetition.boulders.map((boulder_id, index) => (
                        renderBoulder(boulder_id, index)
                    ))
                }
                <Text style={Fonts.h2}>Výsledky:</Text>
                {
                    sends.map((send) => (
                        renderCompSend(send)
                    ))
                }
            </ScrollView>
            <View style={CommonStyles.smallGapped}>
                <Button label={"Zapsat výsledek"} onPress={() => setShowModal(true)}/>
                <Button label={"Vymazat"} onPress={() =>
                    confirmAction(
                        "Vymazat turnaj",
                        "Opravdu chcete smazat tento turnaj?",
                        () => deleteComp()
                    )
                } color={Colors.highlight}/>
            </View>

            <Modal visible={showModal} transparent={true}>
                <View style={styles.modalView}>
                    <ScrollView contentContainerStyle={styles.allAttemptsContainer}>
                        <View style={CommonStyles.justifiedRow}>
                            <Text style={Fonts.h3}>Minut na boulder:</Text>
                            <NumberInput value={minutesPerBoulder} setValue={setMinutesPerBoulder} minValue={1} size={30}/>
                        </View>
                        {
                            currentCompetition.boulders.map((_, pickerIndex) => (
                                <View key={pickerIndex}>
                                    <Text style={Fonts.h3}>Boulder {pickerIndex + 1}</Text>
                                    <View style={styles.scrollerContainer}>
                                        <StyledScrollPicker
                                            name={"Zóna:"}
                                            data={attemptData}
                                            value={zoneAttempts[pickerIndex]}
                                            onValueChange={(value) => pickerSetZoneAttempts(pickerIndex, value)}
                                            width={'50%'}
                                            boldText={false}
                                        />
                                        <StyledScrollPicker
                                            name={"Top:"}
                                            data={attemptData}
                                            value={topAttempts[pickerIndex]}
                                            onValueChange={(value) => pickerSetTopAttempts(pickerIndex, value)}
                                            width={'50%'}
                                            boldText={false}

                                        />
                                    </View>
                                </View>
                            ))
                        }
                    </ScrollView>
                    <View style={{width: "100%", gap: 10}}>
                        <Button label={"Odeslat"} onPress={logCompSend} />
                        <Button label={"Zavřít"} onPress={() => setShowModal(false)} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    compBoulder: {
        padding: 15,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalView: {
        flex: 1,
        margin: 15,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    scrollerContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    allAttemptsContainer: {
        gap: 10,
        width: '100%',
        paddingBottom: 15,
    },
    compSend: {
        padding: 15,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.border,
        width: '100%',
    },
});