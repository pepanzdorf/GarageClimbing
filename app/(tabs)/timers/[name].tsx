import React, { useEffect, useState, useContext } from 'react';
import { Alert, View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, ImageBackground, ScrollView, Dimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../context';
import { gradeIdToGradeName, attemptIdToAttemptName, numberToStrokeColor, numberToFillColor, tagIdToIconName } from '../../../scripts/utils';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { TimerInterval } from '../../../components/TimerInterval';
import { NumberInput } from '../../../components/NumberInput';
import { FontAwesome } from '@expo/vector-icons';


export default function Timer(){
    const { savedTimers, setSavedTimers } = useContext(GlobalStateContext);
    const [ intervals, setIntervals ] = useState();
    const [ loops, setLoops ] = useState();
    const { name } = useLocalSearchParams();
    const [ timerName, setTimerName ] = useState(name);
    const router = useRouter();

    function addTimerInterval() {
        const newIntervals = [...intervals];
        newIntervals.push({time: 0, color: {r: 25, g: 0, b: 0}, onlyFirst: false, onlyLast: false});
        setIntervals(newIntervals);
    }

    function saveTimer() {
        const newTimer = {
            name: timerName,
            intervals: intervals,
            loops: loops,
        };
        const newSavedTimers = [...savedTimers];
        const timerIndex = newSavedTimers.findIndex((element) => element.name==timerName);
        if (timerIndex != -1) {
            newSavedTimers[timerIndex] = newTimer;
        } else {
            newSavedTimers.push(newTimer);
        }
        setSavedTimers(newSavedTimers);
        router.push('timers');
    }

    useEffect(() => {
        if (name) {
            if (name == 'Nový časovač') {
                setIntervals([{time: 0, color: {r: 25, g: 0, b: 0}, onlyFirst: false, onlyLast: false}]);
                setLoops(1);
            } else {
                const timer = savedTimers.find((element) => element.name==name);
                if (timer) {
                    setIntervals(timer.intervals);
                    setLoops(timer.loops);
                    console.log(timer);
                }
            }
        }
    }
    , [name]);

    return (
        <SafeAreaView style={{flex: 1, paddingHorizontal: 20, marginTop: 10, marginBottom: 10 }}>
            {
                intervals === undefined ? <ActivityIndicator size="large" color={Colors.primary} /> : (
                <View style={{flex:1}}>
                    <View style={styles.menuContainer}>
                        <Text style={Fonts.h3}>Jméno:</Text>
                        <TextInput style={styles.textInput} value={timerName} onChangeText={setTimerName}/>
                        <FontAwesome name="save" size={40} color={'green'} onPress={saveTimer}/>
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
                        <NumberInput value={loops} setValue={setLoops} minValue={1}/>
                        <FontAwesome name="plus" size={40} color={Colors.primary} onPress={addTimerInterval}/>
                    </View>
                </View>
                )
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    timerContainer: {
        flexDirection: 'column',
        padding: 10,
        gap: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        paddingHorizontal: 20,
    },
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginRight: 0,
    },
    timerIntervalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 5,
        padding: 5,
        marginHorizontal: 10,
    },
});
