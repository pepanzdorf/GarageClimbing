import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity } from 'react-native';
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

    const [modalVisible, setModalVisible] = useState(false);
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

    function calculateTimeInSeconds() {
        return seconds + minutes*60 + hours*3600;
    }

    function setTimer() {
        const setTimers = [...props.value];
        setTimers[props.index] = {
            time: calculateTimeInSeconds(),
            color: color,
            onlyFirst: onlyFirst,
            onlyLast: onlyLast,
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
    , [seconds, minutes, hours, color, onlyFirst, onlyLast]);

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
                {
                    renderLoopSwitch()
                }
                <View style={{backgroundColor: 'white', paddingHorizontal: 3, borderWidth: 1, borderRadius: 20}}>
                    <FontAwesome name="circle" size={40} color={previewColor} onPress={() => setModalVisible(true)} />
                </View>
            </View>
            <Modal visible={modalVisible} >
                <ColorPicker value={`hsv(${props.initial.color}, 100%, 100%)`} onComplete={setColorFromPicker}>
                    <HueCircular />
                    <Preview hideInitialColor={true} hideText={true} style={{height: 100}}/>
                </ColorPicker>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <View style={styles.button}>
                        <Text style={Fonts.h3}>Uložit</Text>
                    </View>
                </TouchableOpacity>
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
});


export { TimerInterval };
