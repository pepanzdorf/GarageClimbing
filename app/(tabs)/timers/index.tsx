import React, { useContext, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { apiURL } from '../../../constants/Other';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import ColorPicker, { colorKit, Swatches, Preview, HueCircular, BrightnessSlider } from 'reanimated-color-picker';
import MultiSlider from '@ptomasroos/react-native-multi-slider';


export default function TimerIndex(){
    const {
        savedTimers,
        setSavedTimers,
        setCurrentTimer,
        settings,
        currentTimersStatus,
        setCurrentTimersStatus,
        loggedUser,
    } = useContext(GlobalStateContext);
    const router = useRouter();
    const [ showStopwatch, setShowStopwatch ] = useState(false);
    const [ stopwatchStatus, setStopwatchStatus ] = useState(null);
    const [ stopwatchTime, setStopwatchTime ] = useState(0);
    const [ brightness, setBrightness ] = useState(100);
    const [ selectedMode, setSelectedMode ] = useState(0);
    const [ sliderLength, setSliderLength ] = useState(240);


    const handleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setSliderLength(width-80);
    }


    const getTimers = async () => {
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
                getTimers();
            }, 1000);

            return () => clearInterval(intervalId);
        }, [])
    );

    const renderTimer = ({item, index}) => {
        let thisTimerStatus = null;
        for (const timer of currentTimersStatus) {
            if (timer.name === `${item.name}-${loggedUser.normalize("NFD").replace(/\p{Diacritic}/gu, "")}`) {
                thisTimerStatus = timer;
                break;
            }
        }

        let bc = 'lightblue';
        let bw = 1;
        let textColor;
        let text;

        if (thisTimerStatus !== null) {
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
                        thisTimerStatus !== null ? (
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

    function createNewTimer() {
        router.push(`timers/Nový časovač`);
    }

    function showTimer(timer) {
        setCurrentTimer(timer);
        router.push(`timers/${timer.name}`);
    }

    function deleteTimer(index) {
        const newSavedTimers = [...savedTimers];
        newSavedTimers.splice(index, 1);
        setSavedTimers(newSavedTimers);
    }

    function sendSetShowStopwatch() {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/show_stopwatch`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    function pauseStopwatch() {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/pause_stopwatch`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    function startStopwatch() {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/start_stopwatch`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    function stopStopwatch() {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/stop_stopwatch`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    function setStopwatchColor(color) {
        console.log(color);
        const hsvNumbers = color['hsv']
          .replace('hsv(', '')
          .replace(')', '')
          .replaceAll('%', '')
          .split(',')
          .map(Number)

        fetch(`http://${settings.timerIP}:${settings.timerPort}/set_stopwatch_color?color=${hsvNumbers[0]}`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    function sendSetBrightness() {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/set_brightness?brightness=${brightness}`, {method: 'POST'})
        .catch(error => console.log(error));
    }

    function setMode(mode) {
        setSelectedMode(mode);
        fetch(`http://${settings.timerIP}:${settings.timerPort}/set_mode?mode=${mode}`, {method: 'POST'})
        .catch(error => console.log(error));
    }


    async function calculateStopwatchTime() {
        if (stopwatchStatus !== null) {
            if (stopwatchStatus.running) {
                let now = new Date();
                if (stopwatchStatus.paused) {
                    const pausedAtJSFormat = stopwatchStatus.paused_at.map((x, i) => i === 1 ? x - 1 : x);
                    now = new Date(Date.UTC(...pausedAtJSFormat));
                }
                const startTimeJSFormat = stopwatchStatus.started_at.map((x, i) => i === 1 ? x - 1 : x);
                const startTime = new Date(Date.UTC(...startTimeJSFormat));
                const diff = now - startTime - stopwatchStatus.paused_for*1000;
                const hours = Math.floor(diff / 1000 / 60 / 60);
                const minutes = Math.floor(diff / 1000 / 60) % 60;
                const seconds = Math.floor(diff / 1000) % 60;
                setStopwatchTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setStopwatchTime('Not running');
            }
        }
    }

    function rgbStringFromColor(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    useEffect(() => {
        calculateStopwatchTime();
    }
    , [stopwatchStatus]);


    return (
        <SafeAreaView style={styles.container}>
            { showStopwatch ? (
                <View style={{flex:1}}>
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
                            <View style={{flex: 1}}>
                                <Text style={Fonts.h3}>Čas: {stopwatchTime}</Text>
                                <Text style={Fonts.h3}>Běží: {stopwatchStatus.running ? 'Ano' : 'Ne'}</Text>
                                <Text style={Fonts.h3}>Pozastaveno: {stopwatchStatus.paused ? 'Ano' : 'Ne'}</Text>
                                <Text style={Fonts.h3}>Zobrazeno: {stopwatchStatus.shown ? 'Ano' : 'Ne'}</Text>

                                <View style={styles.menuContainer}>
                                    <TouchableOpacity onPress={sendSetShowStopwatch}>
                                        <FontAwesome name="eye" size={40} color={Colors.primary}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={pauseStopwatch}>
                                        <FontAwesome name="pause" size={40} color='orange'/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={stopStopwatch}>
                                        <FontAwesome name="stop" size={40} color='red'/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={startStopwatch}>
                                        <FontAwesome name="play" size={40} color='green'/>
                                    </TouchableOpacity>
                                </View>
                                <View style={{paddingHorizontal: 40, paddingVertical: 10}}>
                                    <ColorPicker value={rgbStringFromColor({r: 255, g: 0, b: 0})} onComplete={setStopwatchColor}>
                                        <HueCircular />
                                        <Preview hideInitialColor={true} hideText={true}/>
                                    </ColorPicker>
                                    <View style={styles.row}>
                                        <Text style={Fonts.h3}>Jas:</Text>
                                        <Text style={Fonts.h3}>{brightness}%</Text>
                                    </View>
                                    <MultiSlider
                                        values={[brightness]}
                                        sliderLength={sliderLength}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValuesChange={values => setBrightness(values[0])}
                                        onValuesChangeFinish={sendSetBrightness}
                                        markerStyle={styles.markerStyle}
                                        selectedStyle={{backgroundColor: Colors.primary}}
                                        unselectedStyle={{backgroundColor: Colors.border}}
                                        touchDimensions={styles.touchDimensions}
                                    />
                                </View>
                            </View>
                        )
                    }
                </View>
            ) : (
                <View style={{flex:1}}>
                    <View style={styles.header}>
                        <Text style={Fonts.h1}>Časovače</Text>
                        <TouchableOpacity onPress={() => setShowStopwatch(true)}>
                            <Text style={[Fonts.h3, {color: 'gray'}]}>Stopky</Text>
                        </TouchableOpacity>
                    </View>
                    {
                        savedTimers === null ? (
                            <ActivityIndicator size="large" color={Colors.primary} />
                        ) : (
                            <FlatList
                                data={savedTimers}
                                renderItem={renderTimer}
                                keyExtractor={item => item.name}
                            />
                        )
                    }
                    <View style={{paddingHorizontal: 40, paddingVertical: 10}} onLayout={handleLayout}>
                        <View style={styles.row}>
                            <Text style={Fonts.h3}>Jas:</Text>
                            <Text style={Fonts.h3}>{brightness}%</Text>
                        </View>
                        <MultiSlider
                            values={[brightness]}
                            sliderLength={sliderLength}
                            min={0}
                            max={100}
                            step={1}
                            onValuesChange={values => setBrightness(values[0])}
                            onValuesChangeFinish={sendSetBrightness}
                            markerStyle={styles.markerStyle}
                            selectedStyle={{backgroundColor: Colors.primary}}
                            unselectedStyle={{backgroundColor: Colors.border}}
                            touchDimensions={styles.touchDimensions}
                        />
                    </View>
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
                    <TouchableOpacity onPress={createNewTimer}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Nový časovač</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
        paddingBottom: 10,
    },
    button: {
         backgroundColor: Colors.primary,
         padding: 10,
         alignItems: 'center',
         borderWidth: 1,
         borderRadius: 10,
         marginRight: 20,
         marginLeft: 20,
    },
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.darkerBorder,
        borderRadius: 10,
        marginBottom: 10,
    },
    header: {
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
    },
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginRight: 0,
    },
    markerStyle: {
        height: 20,
        width: 20,
        backgroundColor: Colors.primary,
    },
    touchDimensions: {
        height: 60,
        width: 60,
        borderRadius: 20,
        slipDisplacement: 200
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
        marginHorizontal: 20,
        marginBottom: 10,
    },
});
