import { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimerContext } from "@/context/TimerContext";
import { UserContext } from "@/context/UserContext";
import { SettingsContext } from "@/context/SettingsContext";
import { TimerInterval } from '@/components/TimerInterval';
import { NumberInput } from '@/components/NumberInput';
import { FontAwesome } from '@expo/vector-icons';
import { TimerIntervalType } from "@/types/timerIntervalType";
import { TimerType } from "@/types/timerType";
import { TimerControls } from "@/components/TimerControls";
import { normalizeName } from "@/scripts/utils";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'
import CommonStyles from "@/constants/CommonStyles";


export default function Timer(){
    const { name } = useLocalSearchParams();
    const { savedTimers, setSavedTimers, saveTimers } = useContext(TimerContext);
    const { settings } = useContext(SettingsContext);
    const { loggedUser } = useContext(UserContext);
    const [ intervals, setIntervals ] = useState<TimerIntervalType[]>([]);
    const [ loops, setLoops ] = useState<number>(1);
    const [ timerName, setTimerName ] = useState<string>(String(name));


    const addTimerInterval = () => {
        const newIntervals = [...intervals];
        newIntervals.push({time: 0, color: 0, onlyFirst: false, onlyLast: false, beep: false, beepTime: 0});
        setIntervals(newIntervals);
    }

    const saveTimer = () => {
        const newTimer: TimerType = {
            name: timerName,
            intervals: intervals,
            loops: loops,
        };
        const newSavedTimers = [...savedTimers];
        const timerIndex = newSavedTimers.findIndex((element) => element.name === timerName);
        if (timerIndex !== -1) {
            newSavedTimers[timerIndex] = newTimer;
        } else {
            newSavedTimers.push(newTimer);
        }
        setSavedTimers(newSavedTimers);
        saveTimers(newSavedTimers);
    }

    const createTimerOnServer = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: normalizeName(timerName),
                    intervals: intervals,
                    loops: loops,
                    owner: normalizeName(loggedUser),
                }),
            }
        )
        .catch(error => console.log(error));
    }


    const setShownTimer = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/show?name=${normalizeName(timerName)}-${normalizeName(loggedUser)}`, {method: 'POST'})
        .catch(console.error);
    }

    const startTimer = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/start?name=${normalizeName(timerName)}-${normalizeName(loggedUser)}`, {method: 'POST'})
        .catch(console.error);
    }

    const stopTimer = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/stop?name=${normalizeName(timerName)}-${normalizeName(loggedUser)}`, {method: 'POST'})
        .catch(console.error);
    }

    const pauseTimer = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/pause?name=${normalizeName(timerName)}-${normalizeName(loggedUser)}`, {method: 'POST'})
        .catch(console.error);
    }

    useEffect(() => {
        if (name === 'Nový časovač') {
            setIntervals([{time: 0, color: 0, onlyFirst: false, onlyLast: false, beep: false, beepTime: 0}]);
            setLoops(1);
        } else {
            const timer = savedTimers.find((element) => element.name === name);
            if (timer) {
                setTimerName(timer.name);
                setIntervals(timer.intervals);
                setLoops(timer.loops);
            }
        }
    }
    , [name]);


    return (
        <SafeAreaView style={[CommonStyles.paddedContainer, {marginBottom: 10}]}>
            <View style={styles.menuContainer}>
                <Text style={Fonts.h3}>Jméno:</Text>
                <TextInput style={styles.textInput} value={timerName} onChangeText={setTimerName}/>
                <TouchableOpacity onPress={saveTimer}>
                    <FontAwesome name="save" size={40} color={'green'}/>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.timerContainer}>
                {
                    intervals.map((_, index) => {
                        return (
                            <TimerInterval
                                key={index}
                                index={index}
                                value={intervals}
                                setValue={setIntervals}
                                initial={{...intervals[index]}}
                            />
                        );
                    })
                }
            </ScrollView>
            <View style={styles.menuContainer}>
                <TouchableOpacity onPress={() => {
                        if (intervals.length > 1) {
                            const newIntervals = [...intervals];
                            newIntervals.pop();
                            setIntervals(newIntervals);
                        }
                    }
                }>
                    <FontAwesome name="trash" size={40} color={Colors.highlight}/>
                </TouchableOpacity>
                <NumberInput value={loops} setValue={setLoops} minValue={1} size={30} border={true}/>
                <TouchableOpacity onPress={addTimerInterval}>
                    <FontAwesome name="plus" size={40} color={Colors.primary}/>
                </TouchableOpacity>
            </View>
            <TimerControls
                onPause={pauseTimer}
                onStop={stopTimer}
                onStart={startTimer}
                withSend={true}
                withShow={true}
                onSend={createTimerOnServer}
                onShow={setShownTimer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    timerContainer: {
        flexDirection: 'column',
        padding: 10,
        gap: 10,
    },
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginRight: 0,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 5,
        padding: 5,
        marginHorizontal: 10,
    },
});
