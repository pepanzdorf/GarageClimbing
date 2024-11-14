import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity, Switch } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Fonts } from '../constants/Fonts'
import { Colors } from '../constants/Colors'
import ScrollPicker from "react-native-wheel-scrollview-picker";
import ColorPicker, { colorKit, Swatches, Preview, HueCircular, BrightnessSlider } from 'reanimated-color-picker';

const TimerInterval = (props) => {
    const [seconds, setSeconds] = useState(props.initial.time % 60);
    const [minutes, setMinutes] = useState(Math.floor(props.initial.time / 60) % 60);
    const [hours, setHours] = useState(Math.floor(props.initial.time / 3600));
    const [color, setColor] = useState(props.initial.color);
    const [onlyFirst, setOnlyFirst] = useState(props.initial.onlyFirst);
    const [onlyLast, setOnlyLast] = useState(props.initial.onlyLast);
    const [alarmSeconds, setAlarmSeconds] = useState(props.initial.beepTime % 60);
    const [alarmMinutes, setAlarmMinutes] = useState(Math.floor(props.initial.beepTime / 60) % 60);
    const [alarmHours, setAlarmHours] = useState(Math.floor(props.initial.beepTime / 3600));
    const [alarmSet, setAlarmSet] = useState(props.initial.beep);

    const [modalVisible, setModalVisible] = useState(false);
    const [alarmModalVisible, setAlarmModalVisible] = useState(false);
    const [previewColor, setPreviewColor] = useState('red');

    function renderLoopSwitch() {
        if (!onlyFirst && !onlyLast) {
            return (
                <FontAwesome name="repeat" size={40} color='black' onPress={() => setOnlyFirst(true)} />
            );
        } else if (onlyFirst) {
            return (
                <FontAwesome name="forward" size={40} color='black' onPress={() => {setOnlyFirst(false); setOnlyLast(true)}} />
            );
        }
        return (
            <FontAwesome name="backward" size={40} color='black' onPress={() => setOnlyLast(false)} />
        );
    }

    function padNumbers(num) {
        return (num < 10 ? `0${num}` : num)
    }

    function calculateTimeInSeconds(h, m, s) {
        return s + m*60 + h*3600;
    }

    function setTimer() {
        const setTimers = [...props.value];
        setTimers[props.index] = {
            time: calculateTimeInSeconds(hours, minutes, seconds),
            color: color,
            onlyFirst: onlyFirst,
            onlyLast: onlyLast,
            beep: alarmSet,
            beepTime: calculateTimeInSeconds(alarmHours, alarmMinutes, alarmSeconds),
        };
        props.setValue(setTimers);
    }

    function setColorFromPicker(color) {
        const hsvNumbers = color['hsv']
          .replace('hsv(', '')
          .replace(')', '')
          .replaceAll('%', '')
          .split(',')
          .map(Number)

        setColor(hsvNumbers[0]);
    }

    useEffect(() => {
        setPreviewColor(`hsl(${color}, 100%, 50%)`);
    }
    , [color]);

    useEffect(() => {
        setTimer();
    }
    , [seconds, minutes, hours, color, onlyFirst, onlyLast, alarmSet, alarmSeconds, alarmMinutes, alarmHours]);

    return (
        <View style={styles.container}>
            <View style={styles.timeContainer}>
                <View style={{flex: 1}}>
                    <ScrollPicker
                        dataSource={Array.from({length: 100}, (_, i) => padNumbers(i))}
                        selectedIndex={hours}
                        wrapperHeight={styles.pickerWrapperHeight}
                        wrapperBackground={Colors.primary}
                        itemHeight={styles.pickerItemHeight}
                        highlightColor={Colors.border}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={Fonts.h3}
                        onValueChange={(_, index) => setHours(index)}
                    />
                </View>
                <Text style={styles.colon}>:</Text>
                <View style={{flex: 1}}>
                    <ScrollPicker
                        dataSource={Array.from({length: 60}, (_, i) => padNumbers(i))}
                        selectedIndex={minutes}
                        wrapperHeight={styles.pickerWrapperHeight}
                        wrapperBackground={Colors.primary}
                        itemHeight={styles.pickerItemHeight}
                        highlightColor={Colors.border}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={Fonts.h3}
                        onValueChange={(_, index) => setMinutes(index)}
                    />
                </View>
                <Text style={styles.colon}>:</Text>
                <View style={{flex: 1}}>
                    <ScrollPicker
                        dataSource={Array.from({length: 60}, (_, i) => padNumbers(i))}
                        selectedIndex={seconds}
                        wrapperHeight={styles.pickerWrapperHeight}
                        wrapperBackground={Colors.primary}
                        itemHeight={styles.pickerItemHeight}
                        highlightColor={Colors.border}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={Fonts.h3}
                        onValueChange={(_, index) => setSeconds(index)}
                    />
                </View>
            </View>
            <View style={styles.iconsContainer}>
                <FontAwesome name="bell-o" size={40} color={alarmSet ? 'lime' : 'black'} onPress={() => setAlarmModalVisible(true)} />
                {
                    renderLoopSwitch()
                }
                <View style={{backgroundColor: 'white', paddingHorizontal: 3, borderWidth: 1, borderRadius: 20}}>
                    <FontAwesome name="circle" size={40} color={previewColor} onPress={() => setModalVisible(true)} />
                </View>
            </View>
            <Modal visible={modalVisible} >
                <View style={{flex:1, margin: 50}}>
                    <ColorPicker value={`hsv(${props.initial.color}, 100%, 100%)`} onComplete={setColorFromPicker} style={{flex: 1}}>
                        <HueCircular />
                        <Preview hideInitialColor={true} hideText={true} style={{height: 100}}/>
                    </ColorPicker>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Uložit</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal visible={alarmModalVisible} transparent={true}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={Fonts.h3}>Zapnout pípnutí:</Text>
                        <Switch
                            trackColor={styles.track}
                            thumbColor={alarmSet ? Colors.background : Colors.backgroundDarker}
                            onValueChange={setAlarmSet}
                            value={alarmSet}
                        />
                        {
                            alarmSet ? (
                                <View style={[styles.timeContainer, {maxHeight: 65}]}>
                                    <View style={{flex: 1}}>
                                        <ScrollPicker
                                            dataSource={Array.from({length: 100}, (_, i) => padNumbers(i))}
                                            selectedIndex={alarmHours}
                                            wrapperHeight={styles.pickerWrapperHeight}
                                            wrapperBackground={Colors.primary}
                                            itemHeight={styles.pickerItemHeight}
                                            highlightColor={Colors.border}
                                            itemTextStyle={Fonts.h3}
                                            activeItemTextStyle={Fonts.h3}
                                            onValueChange={(_, index) => setAlarmHours(index)}
                                        />
                                    </View>
                                    <Text style={styles.colon}>:</Text>
                                    <View style={{flex: 1}}>
                                        <ScrollPicker
                                            dataSource={Array.from({length: 60}, (_, i) => padNumbers(i))}
                                            selectedIndex={alarmMinutes}
                                            wrapperHeight={styles.pickerWrapperHeight}
                                            wrapperBackground={Colors.primary}
                                            itemHeight={styles.pickerItemHeight}
                                            highlightColor={Colors.border}
                                            itemTextStyle={Fonts.h3}
                                            activeItemTextStyle={Fonts.h3}
                                            onValueChange={(_, index) => setAlarmMinutes(index)}
                                        />
                                    </View>
                                    <Text style={styles.colon}>:</Text>
                                    <View style={{flex: 1}}>
                                        <ScrollPicker
                                            dataSource={Array.from({length: 60}, (_, i) => padNumbers(i))}
                                            selectedIndex={alarmSeconds}
                                            wrapperHeight={styles.pickerWrapperHeight}
                                            wrapperBackground={Colors.primary}
                                            itemHeight={styles.pickerItemHeight}
                                            highlightColor={Colors.border}
                                            itemTextStyle={Fonts.h3}
                                            activeItemTextStyle={Fonts.h3}
                                            onValueChange={(_, index) => setAlarmSeconds(index)}
                                        />
                                    </View>
                                </View>
                            ) : null
                        }
                        <TouchableOpacity onPress={() => setAlarmModalVisible(false)}>
                            <View style={styles.button}>
                                <Text style={Fonts.h3}>OK</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.darkerBorder,
        borderRadius: 5,
        backgroundColor: Colors.primary,
        paddingHorizontal: 5,
        justifyContent: 'space-between',
    },
    timeContainer: {
        flexDirection: 'row',
        flex: 1,
        maxWidth: 150,
    },
    iconsContainer: {
        alignItems: 'center',
        padding: 5,
        flexDirection: 'row',
        gap: 10,
    },
    colon: {
        fontSize: 24,
        color: Colors.darkerBorder,
        paddingTop: 14,
    },
    pickerWrapperHeight: 65,
    pickerItemHeight: 30,
    button: {
         backgroundColor: Colors.primary,
         padding: 10,
         alignItems: 'center',
         borderWidth: 1,
         borderRadius: 10,
         marginTop: 15,
         marginRight: 20,
         marginLeft: 20,
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
    },
    track: {
        false: Colors.darkerBorder,
        true: Colors.primary
    },
});


export { TimerInterval };
