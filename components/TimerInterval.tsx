import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ColorFormatsObject } from 'reanimated-color-picker';
import { TimerIntervalType } from "@/types/timerIntervalType";
import { StyledColorPicker } from "@/components/StyledColorPicker";
import Colors from '@/constants/Colors'
import RowSwitch from "@/components/RowSwitch";
import Button from "@/components/HorizontalButton";
import StyledScrollPicker from "@/components/StyledScrollPicker";
import CommonStyles from "@/constants/CommonStyles";


type Props = {
    initial: TimerIntervalType
    index: number,
    value: TimerIntervalType[],
    setValue: (intervalArray: TimerIntervalType[]) => void
}


const TimerInterval = (props: Props) => {
    const [ seconds, setSeconds ] = useState(props.initial.time % 60);
    const [ minutes, setMinutes ] = useState(Math.floor(props.initial.time / 60) % 60);
    const [ hours, setHours ] = useState(Math.floor(props.initial.time / 3600));
    const [ color, setColor ] = useState(props.initial.color);
    const [ onlyFirst, setOnlyFirst ] = useState(props.initial.onlyFirst);
    const [ onlyLast, setOnlyLast ] = useState(props.initial.onlyLast);
    const [ alarmSeconds, setAlarmSeconds ] = useState(props.initial.beepTime % 60);
    const [ alarmMinutes, setAlarmMinutes ] = useState(Math.floor(props.initial.beepTime / 60) % 60);
    const [ alarmHours, setAlarmHours ] = useState(Math.floor(props.initial.beepTime / 3600));
    const [ alarmSet, setAlarmSet ] = useState(props.initial.beep);
    const [ modalVisible, setModalVisible ] = useState(false);
    const [ alarmModalVisible, setAlarmModalVisible ] = useState(false);
    const [ previewColor, setPreviewColor ] = useState('red');

    function renderLoopSwitch() {
        if (!onlyFirst && !onlyLast) {
            return (
                <TouchableOpacity onPress={() => setOnlyFirst(true)} >
                    <FontAwesome name="repeat" size={40} color='black'/>
                </TouchableOpacity>
            );
        } else if (onlyFirst) {
            return (
                <TouchableOpacity onPress={() => {setOnlyFirst(false); setOnlyLast(true)}} >
                    <FontAwesome name="forward" size={40} color='black' />
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity onPress={() => setOnlyLast(false)} >
                <FontAwesome name="backward" size={40} color='black' />
            </TouchableOpacity>
        );
    }

    function padNumbers(num: number) {
        return (num < 10 ? `0${num}` : num)
    }

    function calculateTimeInSeconds(h: number, m: number, s: number) {
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

    function setColorFromPicker(color: ColorFormatsObject) {
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
                <StyledScrollPicker
                    data={Array.from({length: 100}, (_, i) => ({value: i, label: padNumbers(i)}))}
                    value={hours}
                    onValueChange={setHours}
                    width={'30%'}
                    color={'black'}
                />
                <Text style={styles.colon}>:</Text>
                <StyledScrollPicker
                    data={Array.from({length: 60}, (_, i) => ({value: i, label: padNumbers(i)}))}
                    value={minutes}
                    onValueChange={setMinutes}
                    width={'30%'}
                    color={'black'}
                />
                <Text style={styles.colon}>:</Text>
                <StyledScrollPicker
                    data={Array.from({length: 60}, (_, i) => ({value: i, label: padNumbers(i)}))}
                    value={seconds}
                    onValueChange={setSeconds}
                    width={'30%'}
                    color={'black'}
                />
            </View>
            <View style={styles.iconsContainer}>
                <TouchableOpacity onPress={() => setAlarmModalVisible(true)} >
                    <FontAwesome name="bell-o" size={40} color={alarmSet ? 'lime' : 'black'} />
                </TouchableOpacity>
                {
                    renderLoopSwitch()
                }
                <TouchableOpacity onPress={() => setModalVisible(true)} >
                    <View style={{backgroundColor: 'white', paddingHorizontal: 3, borderWidth: 1, borderRadius: 20}}>
                        <FontAwesome name="circle" size={40} color={previewColor} />
                    </View>
                </TouchableOpacity>
            </View>

            <Modal visible={modalVisible} >
                <View style={styles.modalView}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <StyledColorPicker onComplete={setColorFromPicker} />
                    </View>
                    <Button label={"Uložit"} onPress={() => setModalVisible(false)} />
                </View>
            </Modal>

            <Modal visible={alarmModalVisible} transparent={true}>
                <View style={styles.modalViewOuter}>
                    <View style={styles.modalViewInner}>
                        <RowSwitch label={"Zapnout pípnutí:"} value={alarmSet} onValueChange={setAlarmSet} />
                        {
                            alarmSet ? (
                                (alarmSeconds !== -1 && alarmMinutes !== -1 && alarmHours !== -1) &&
                                <View style={CommonStyles.justifiedRow}>
                                    <StyledScrollPicker
                                        data={Array.from({length: 100}, (_, i) => ({value: i, label: padNumbers(i)}))}
                                        value={alarmHours}
                                        onValueChange={setAlarmHours}
                                        width={'30%'}
                                        color={'black'}
                                    />
                                    <Text style={styles.colon}>:</Text>
                                    <StyledScrollPicker
                                        data={Array.from({length: 60}, (_, i) => ({value: i, label: padNumbers(i)}))}
                                        value={alarmMinutes}
                                        onValueChange={setAlarmMinutes}
                                        width={'30%'}
                                        color={'black'}
                                    />
                                    <Text style={styles.colon}>:</Text>
                                    <StyledScrollPicker
                                        data={Array.from({length: 60}, (_, i) => ({value: i, label: padNumbers(i)}))}
                                        value={alarmSeconds}
                                        onValueChange={setAlarmSeconds}
                                        width={'30%'}
                                        color={'black'}
                                    />
                                </View>
                            ) : null
                        }
                        <Button label={"OK"} onPress={() => setAlarmModalVisible(false)} />
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
        borderRadius: 5,
        backgroundColor: Colors.primary,
        paddingHorizontal: 5,
        justifyContent: 'space-between',
    },
    timeContainer: {
        flexDirection: 'row',
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
        paddingTop: 23,
    },
    modalView: {
        flex: 1,
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalViewOuter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalViewInner: {
        backgroundColor: Colors.background,
        margin: 20,
        borderRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});


export { TimerInterval };
