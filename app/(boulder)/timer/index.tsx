import { useContext, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { TimerContext } from "@/context/TimerContext";
import { UserContext } from "@/context/UserContext";
import { SettingsContext } from "@/context/SettingsContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StopwatchStatusType } from "@/types/stopwatchStatusType";
import { TimerType } from "@/types/timerType";
import { ColorFormatsObject} from 'reanimated-color-picker';
import { TimerControls } from "@/components/TimerControls";
import { StyledColorPicker } from "@/components/StyledColorPicker";
import { TimerStatusType } from "@/types/timerStatusType";
import { normalizeName } from "@/scripts/utils";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'
import CommonStyles from "@/constants/CommonStyles";
import StyledMultiSlider from "@/components/StyledMultiSlider";
import Button from "@/components/HorizontalButton";



export default function TimerIndex(){
    const {
        savedTimers,
        setSavedTimers,
        currentTimersStatus,
        setCurrentTimersStatus,
        saveTimers,
    } = useContext(TimerContext);
    const { settings } = useContext(SettingsContext);
    const { loggedUser } = useContext(UserContext);
    const [ showStopwatch, setShowStopwatch ] = useState(false);
    const [ stopwatchStatus, setStopwatchStatus ] = useState<StopwatchStatusType>();
    const [ stopwatchTime, setStopwatchTime ] = useState<string | number>(0);
    const [ brightness, setBrightness ] = useState(100);
    const [ selectedMode, setSelectedMode ] = useState(0);

    const router = useRouter();


    const getTimersStatus = async () => {
        if (!settings.timerIP || !settings.timerPort) return;
        try {
            const response = await fetch(`http://${settings.timerIP}:${settings.timerPort}/timers`);
            const data = await response.json();
            setCurrentTimersStatus(data['timers']);
            setStopwatchStatus(data['stopwatch']);
        } catch (error) {
            console.error('Error polling endpoint:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const intervalId = setInterval(() => {
                getTimersStatus().catch(console.error);
            }, 1000);

            return () => clearInterval(intervalId);
        }, [])
    );

    const renderTimer = ({item, index}: {item: TimerType, index: number}) => {
        let thisTimerStatus: TimerStatusType | undefined;
        for (const timer of currentTimersStatus) {
            if (timer.name === `${normalizeName(item.name)}-${normalizeName(loggedUser)}`) {
                thisTimerStatus = timer;
                break;
            }
        }

        let bc = 'lightblue';
        let bw = 1;
        let textColor;
        let text;

        if (thisTimerStatus) {
            bc = Colors.primary;
            if (thisTimerStatus.shown) {
                bw = 3;
            }
            if (thisTimerStatus.finished) {
                textColor = 'red';
                text = 'Dokončeno';
            } else if (thisTimerStatus.paused) {
                textColor = 'orange';
                text = 'Pozastaven';
            } else if (thisTimerStatus.running) {
                textColor = 'green';
                text = 'Běží';
            }
        }

        return (
            <View style={[styles.timerContainer, {backgroundColor: bc, borderWidth: bw}]}>
                <TouchableOpacity onPress={() => showTimer(item)}>
                    <Text style={Fonts.h3}>{item.name}</Text>
                </TouchableOpacity>
                <View style={{flexDirection: 'row', gap: 10}}>
                    {
                        thisTimerStatus ? (
                            <Text style={[Fonts.h3, {color: textColor}]}>{text}</Text>
                        ) : null
                    }
                    <TouchableOpacity onPress={() => deleteTimer(index)}>
                        <Text style={[Fonts.h3, {color: 'red'}]}>Smazat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }


    const createNewTimer = ()=> {
        router.push(`/timer/Nový časovač`);
    }

    const showTimer = (timer: TimerType) => {
        router.push(`/timer/${timer.name}`);
    }

    const deleteTimer = (index: number) => {
        const newSavedTimers = [...savedTimers];
        newSavedTimers.splice(index, 1);
        setSavedTimers(newSavedTimers);
        saveTimers(newSavedTimers);
    }

    const sendSetShowStopwatch = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/show_stopwatch`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    const pauseStopwatch = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/pause_stopwatch`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    const startStopwatch = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/start_stopwatch`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    const stopStopwatch = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/stop_stopwatch`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    const setStopwatchColor = (color: ColorFormatsObject) => {
        const hsvNumbers = color['hsv']
          .replace(/hsv\(|\)|%/g, '')
          .split(',')
          .map(Number)

        fetch(`http://${settings.timerIP}:${settings.timerPort}/set_stopwatch_color?color=${hsvNumbers[0]}`, {method: 'POST'})
        .catch(console.error);
    }

    const sendSetBrightness = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/set_brightness?brightness=${brightness}`, {method: 'POST'})
        .catch(console.error);
    }

    const setMode = (mode: number) => {
        setSelectedMode(mode);
        fetch(`http://${settings.timerIP}:${settings.timerPort}/set_mode?mode=${mode}`, {method: 'POST'})
        .catch(console.error);
    }


    const calculateStopwatchTime = async () => {
        if (stopwatchStatus) {
            if (stopwatchStatus.running) {
                let now = new Date();
                if (stopwatchStatus.paused) {
                    const pausedAtJSFormat =
                        stopwatchStatus.paused_at.slice(0, 6).map((x, i) => i === 1 ? x - 1 : x) as [number, number, number, number, number, number];
                    now = new Date(Date.UTC(...pausedAtJSFormat));
                }
                const startTimeJSFormat = stopwatchStatus.started_at.slice(0, 6).map((x, i) => i === 1 ? x - 1 : x) as [number, number, number, number, number, number];
                const startTime = new Date(Date.UTC(...startTimeJSFormat));
                const diff = (now.getTime() - startTime.getTime())/1000 - stopwatchStatus.paused_for;
                const hours = Math.floor(diff / 60 / 60);
                const minutes = Math.floor(diff / 60) % 60;
                const seconds = Math.floor(diff) % 60;
                setStopwatchTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setStopwatchTime('Neběží');
            }
        }
    }


    useEffect(() => {
        calculateStopwatchTime().catch(console.error);
    }
    , [stopwatchStatus]);


    return (
        <SafeAreaView style={CommonStyles.paddedContainer}>
            {
                showStopwatch ? (
                    <>
                        <View style={styles.header}>
                            <Text style={Fonts.h1}>Stopky</Text>
                            <TouchableOpacity onPress={() => setShowStopwatch(false)}>
                                <Text style={[Fonts.h3, {color: 'gray'}]}>Časovače</Text>
                            </TouchableOpacity>
                        </View>
                        {
                            stopwatchStatus === null ? (
                                <ActivityIndicator size="large" color={Colors.primary} />
                            ) : (
                                stopwatchStatus &&
                                <>
                                    <Text style={Fonts.h3}>Čas: {stopwatchTime}</Text>
                                    <Text style={Fonts.h3}>Běží: {stopwatchStatus.running ? 'Ano' : 'Ne'}</Text>
                                    <Text style={Fonts.h3}>Pozastaveno: {stopwatchStatus.paused ? 'Ano' : 'Ne'}</Text>
                                    <Text style={Fonts.h3}>Zobrazeno: {stopwatchStatus.shown ? 'Ano' : 'Ne'}</Text>
                                    <TimerControls
                                        onPause={pauseStopwatch}
                                        onStop={stopStopwatch}
                                        onStart={startStopwatch}
                                        withShow={true}
                                        onShow={sendSetShowStopwatch}
                                    />
                                    <View style={{paddingHorizontal: 40, paddingVertical: 10}}>
                                        <StyledColorPicker onComplete={setStopwatchColor} />
                                        <View style={styles.row}>
                                            <Text style={Fonts.h3}>Jas:</Text>
                                            <Text style={Fonts.h3}>{brightness}%</Text>
                                        </View>
                                        <StyledMultiSlider
                                            min={0}
                                            max={100}
                                            step={1}
                                            values={[brightness]}
                                            onValuesChange={values => setBrightness(values[0])}
                                            onValuesChangeFinish={sendSetBrightness}
                                        />
                                    </View>
                                </>
                            )
                        }
                    </>
                ) : (
                    <>
                        <View style={styles.header}>
                            <Text style={Fonts.h1}>Časovače</Text>
                            <TouchableOpacity onPress={() => setShowStopwatch(true)}>
                                <Text style={[Fonts.h3, {color: 'gray'}]}>Stopky</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={savedTimers}
                            renderItem={renderTimer}
                            keyExtractor={item => item.name}
                        />
                        <View style={CommonStyles.justifiedRow}>
                            <Text style={Fonts.h3}>Jas:</Text>
                            <Text style={Fonts.h3}>{brightness}%</Text>
                        </View>
                        <StyledMultiSlider
                            min={0}
                            max={100}
                            step={1}
                            values={[brightness]}
                            onValuesChange={values => setBrightness(values[0])}
                            onValuesChangeFinish={sendSetBrightness}
                        />
                        <View style={styles.modeContainer}>
                            <TouchableOpacity onPress={() => setMode(0)} style={[styles.modeButton, {backgroundColor: selectedMode === 0 ? Colors.primary : 'lightgray'}]}>
                                <Text style={Fonts.h3}>Auto</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setMode(3)} style={[styles.modeButton, {backgroundColor: selectedMode === 3 ? Colors.primary : 'lightgray'}]}>
                                <Text style={Fonts.h3}>HH:MM</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setMode(2)} style={[styles.modeButton, {backgroundColor: selectedMode === 2 ? Colors.primary : 'lightgray'}]}>
                                <Text style={Fonts.h3}>MM:SS</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setMode(1)} style={[styles.modeButton, {backgroundColor: selectedMode === 1 ? Colors.primary : 'lightgray'}]}>
                                <Text style={Fonts.h3}>SSSS</Text>
                            </TouchableOpacity>
                        </View>
                        <Button label={"Nový časovač"} onPress={createNewTimer} />
                    </>
                )
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 10,
    },
    header: {
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modeButton: {
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
    },
    modeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
});
