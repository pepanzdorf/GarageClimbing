import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../context';
import { apiURL } from '../../constants/Other';
import ScrollPicker from "react-native-wheel-scrollview-picker";
import { Fonts } from '../../constants/Fonts';
import { gradeIdToGradeName, attemptIdToAttemptName, crackIdToCrackName } from '../../scripts/utils';
import { Colors } from '../../constants/Colors';


export default function CrackLogScreen() {
    const { token } = useContext(GlobalStateContext);
    const [ isVertical, setIsVertical ] = useState(true);
    const [ selectedCrackType, setSelectedCrackType ] = useState(0);
    const [ selectedWholeTimes, setSelectedWholeTimes ] = useState(0);
    const [ selectedDecimalTimes, setSelectedDecimalTimes ] = useState(0);

    const crackTypeData = Array(6).fill().map((_, i) => crackIdToCrackName(i));
    const horizontalCrackTypeData = crackTypeData.slice(0, 3);
    const wholeTimesData = Array(52).fill().map((_, i) => i === 0 ? "-" : `${i-1}.`);
    const decimalTimesData = Array(11).fill().map((_, i) => i === 0 ? "-" : i-1);
    const typeRef = React.useRef();
    const wholeRef = React.useRef();
    const decimalRef = React.useRef();

    const logSend = async () => {
        if (selectedCrackType === 0) {
            alert("Musíte zadat typ spáry.");
            return;
        }
        if (selectedWholeTimes === 0) {
            alert("Musíte zadat počet vylezení.");
            return;
        }
        if (selectedDecimalTimes === 0) {
            alert("Musíte zadat počet vylezení.");
            return;
        }
        const response = await fetch(`${apiURL}/climbing/crack/log_send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                is_vertical: isVertical,
                crack_type: selectedCrackType-1,
                whole_times: selectedWholeTimes-1,
                decimal_times: selectedDecimalTimes-1,
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
        setSelectedCrackType(0);
        setSelectedWholeTimes(0);
        setSelectedDecimalTimes(0);
        typeRef.current && typeRef.current.scrollToTargetIndex(0);
        wholeRef.current && wholeRef.current.scrollToTargetIndex(0);
        decimalRef.current && decimalRef.current.scrollToTargetIndex(0);
    }

    const switchChange = (value) => {
        setIsVertical(value);
        setDefaults();
    }

    useEffect(() => {
        setDefaults();
    }, []);


    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.switch}>
                    <Text style={Fonts.h2}>
                        Orientace spáry:
                    </Text>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>Horizontální</Text>
                        <Switch
                            trackColor={styles.track}
                            thumbColor={isVertical ? Colors.background : Colors.backgroundDarker}
                            onValueChange={switchChange}
                            value={isVertical}
                        />
                        <Text style={Fonts.h3}>Vertikální</Text>
                    </View>
                </View>
                <View style={styles.picker}>
                    <Text style={Fonts.h2}>Typ spáry:</Text>
                    <ScrollPicker
                        ref={typeRef}
                        dataSource={isVertical ? crackTypeData : horizontalCrackTypeData}
                        selectedIndex={0}
                        wrapperHeight={styles.pickerHeight}
                        wrapperBackground="#FFFFFF"
                        itemHeight={styles.pickerHeight-10}
                        highlightColor={Colors.border}
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: Colors.crackPrimary}]}
                        onValueChange={(_, index) => setSelectedCrackType(index)}
                    />
                </View>
                <View style={styles.picker}>
                    <Text style={Fonts.h2}>Spára vylezena:</Text>
                    <Text style={Fonts.plain}>(kolikrát, druhý výběr je desetinná část)</Text>
                    <View style={styles.row}>
                        <ScrollPicker
                            ref={wholeRef}
                            dataSource={wholeTimesData}
                            selectedIndex={selectedWholeTimes}
                            wrapperHeight={styles.pickerHeight}
                            wrapperBackground="#FFFFFF"
                            itemHeight={styles.pickerHeight-10}
                            highlightColor={Colors.border}
                            highlightBorderWidth={2}
                            itemTextStyle={Fonts.h3}
                            activeItemTextStyle={[Fonts.h3, {color: Colors.crackPrimary}]}
                            onValueChange={(_, index) => setSelectedWholeTimes(index)}
                        />
                        <ScrollPicker
                            ref={decimalRef}
                            dataSource={decimalTimesData}
                            selectedIndex={selectedDecimalTimes}
                            wrapperHeight={styles.pickerHeight}
                            wrapperBackground="#FFFFFF"
                            itemHeight={styles.pickerHeight-10}
                            highlightColor={Colors.border}
                            highlightBorderWidth={2}
                            itemTextStyle={Fonts.h3}
                            activeItemTextStyle={[Fonts.h3, {color: Colors.crackPrimary}]}
                            onValueChange={(_, index) => setSelectedDecimalTimes(index)}
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
        padding: 20,
        alignItems: 'center',
        gap: 20,
    },
    button: {
        backgroundColor: Colors.crackPrimary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginRight: 20,
        marginLeft: 20,
        marginBottom: 15,
    },
    picker: {
        width: "75%",
        gap: 10,
    },
    pickerHeight: 70,
    switch: {
        alignItems: 'center',
        padding: 10,
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    track: {
        false: Colors.primary,
        true: Colors.crackPrimary,
    },
});