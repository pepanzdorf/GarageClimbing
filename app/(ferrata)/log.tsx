import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../context';
import { apiURL } from '../../constants/Other';
import ScrollPicker from "react-native-wheel-scrollview-picker";
import { Fonts } from '../../constants/Fonts';
import { ferrataGradeIdToGradeName } from '../../scripts/utils';
import { Colors } from '../../constants/Colors';


export default function FerrataLogScreen() {
    const { token } = useContext(GlobalStateContext);
    const [ferrataName, setFerrataName] = useState('');
    const [selectedGrade, setSelectedGrade] = useState(0);
    const [selectedTimes, setSelectedTimes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [hours, setHours] = useState(0);

    const gradeData = Array(7).fill().map((_, i) => ferrataGradeIdToGradeName(i-1));
    const timesData = Array(52).fill().map((_, i) => i === 0 ? "-" : `${i}`);
    const gradeRef = React.useRef();
    const timesRef = React.useRef();
    const secondsRef = React.useRef();
    const minutesRef = React.useRef();
    const hoursRef = React.useRef();

    function padNumbers(num) {
        return (num < 10 ? `0${num}` : num)
    }

    const logSend = async () => {
        if (ferrataName === '') {
            alert("Musíte zadat jméno ferraty.");
            return;
        }
        if (selectedGrade === 0) {
            alert("Musíte zadat obtížnost.");
            return;
        }
        if (selectedTimes === 0) {
            alert("Musíte zadat počet vylezení.");
            return;
        }
        const response = await fetch(`${apiURL}/ferrata/log_send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                ferrata_name: ferrataName,
                grade: selectedGrade-1,
                climbed_times: selectedTimes,
                time_seconds: seconds + minutes * 60 + hours * 3600,
            }),
        })
        const jsonResponse = await response.text();
        if (!response.ok) {
            alert(jsonResponse);
            return;
        } else {
            alert("Zápis byl úspěšný.");
            setDefaults();
        }
    }

    const setDefaults = () => {
        setFerrataName('');
        setSelectedGrade(0);
        setSelectedTimes(0);
        setSeconds(0);
        setMinutes(0);
        setHours(0);
        gradeRef.current && gradeRef.current.scrollToTargetIndex(0);
        timesRef.current && timesRef.current.scrollToTargetIndex(0);
        secondsRef.current && secondsRef.current.scrollToTargetIndex(0);
        minutesRef.current && minutesRef.current.scrollToTargetIndex(0);
        hoursRef.current && hoursRef.current.scrollToTargetIndex(0);
    }

    useEffect(() => {
        setDefaults();
    }, []);

    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={Fonts.h2}>Jméno ferraty:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Jméno ferraty"
                    value={ferrataName}
                    onChangeText={setFerrataName}
                    maxLength={100}
                />
                <Text style={Fonts.h2}>Obtížnost:</Text>
                <View style={styles.picker}>
                    <ScrollPicker
                        ref={gradeRef}
                        dataSource={gradeData}
                        selectedIndex={selectedGrade}
                        wrapperHeight={styles.pickerHeight}
                        wrapperBackground="#FFFFFF"
                        itemHeight={styles.pickerHeight-10}
                        highlightColor={Colors.border}
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: Colors.ferrataPrimary}]}
                        onValueChange={(_, index) => setSelectedGrade(index)}
                    />
                </View>
                <Text style={Fonts.h2}>Opakováno v řadě:</Text>
                <View style={styles.picker}>
                    <ScrollPicker
                        ref={timesRef}
                        dataSource={timesData}
                        selectedIndex={selectedTimes}
                        wrapperHeight={styles.pickerHeight}
                        wrapperBackground="#FFFFFF"
                        itemHeight={styles.pickerHeight-10}
                        highlightColor={Colors.border}
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: Colors.ferrataPrimary}]}
                        onValueChange={(_, index) => setSelectedTimes(index)}
                    />
                </View>
                <Text style={Fonts.h2}>Čas (hh:mm:ss):</Text>
                <View style={styles.timeContainer}>
                    <View style={{flex: 1}}>
                        <ScrollPicker
                            ref={hoursRef}
                            dataSource={Array.from({length: 100}, (_, i) => padNumbers(i))}
                            selectedIndex={hours}
                            wrapperHeight={styles.pickerWrapperHeight}
                            wrapperBackground="#FFFFFF"
                            itemHeight={styles.pickerItemHeight}
                            highlightColor={Colors.border}
                            itemTextStyle={Fonts.h3}
                            activeItemTextStyle={[Fonts.h3, {color: Colors.ferrataPrimary}]}
                            onValueChange={(_, index) => setHours(index)}
                        />
                    </View>
                    <Text style={styles.colon}>:</Text>
                    <View style={{flex: 1}}>
                        <ScrollPicker
                            ref={minutesRef}
                            dataSource={Array.from({length: 60}, (_, i) => padNumbers(i))}
                            selectedIndex={minutes}
                            wrapperHeight={styles.pickerWrapperHeight}
                            wrapperBackground="#FFFFFF"
                            itemHeight={styles.pickerItemHeight}
                            highlightColor={Colors.border}
                            itemTextStyle={Fonts.h3}
                            activeItemTextStyle={[Fonts.h3, {color: Colors.ferrataPrimary}]}
                            onValueChange={(_, index) => setMinutes(index)}
                        />
                    </View>
                    <Text style={styles.colon}>:</Text>
                    <View style={{flex: 1}}>
                        <ScrollPicker
                            ref={secondsRef}
                            dataSource={Array.from({length: 60}, (_, i) => padNumbers(i))}
                            selectedIndex={seconds}
                            wrapperHeight={styles.pickerWrapperHeight}
                            wrapperBackground="#FFFFFF"
                            itemHeight={styles.pickerItemHeight}
                            highlightColor={Colors.border}
                            itemTextStyle={Fonts.h3}
                            activeItemTextStyle={[Fonts.h3, {color: Colors.ferrataPrimary}]}
                            onValueChange={(_, index) => setSeconds(index)}
                        />
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity onPress={logSend}>
                <View style={styles.button}>
                    <Text style={Fonts.h3}>Odeslat</Text>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 30,
        gap: 10,
        alignItems: 'center',
    },
    button: {
        backgroundColor: Colors.ferrataPrimary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginRight: 20,
        marginLeft: 20,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    input: {
        height: 50,
        borderColor: Colors.borderDark,
        borderWidth: 2,
        padding: 10,
        width: "75%",
    },
    picker: {
        width: "75%",
        gap: 10,
    },
    pickerHeight: 70,
    timeContainer: {
        flexDirection: 'row',
        maxWidth: 150,
        height: 65,
    },
    pickerWrapperHeight: 65,
    pickerItemHeight: 30,
    colon: {
        fontSize: 24,
        color: Colors.darkerBorder,
        paddingTop: 14,
    },
});