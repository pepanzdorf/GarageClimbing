import { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiURL } from '@/constants/Other';
import { ferrataGradeIdToGradeName } from '@/scripts/utils';
import { UserContext } from "@/context/UserContext";
import ScrollPicker, { ScrollPickerHandle } from "react-native-wheel-scrollview-picker";
import { FerrataContext } from "@/context/FerrataContext";
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import CommonStyles from "@/constants/CommonStyles";
import StyledScrollPicker from "@/components/StyledScrollPicker";
import Button from "@/components/HorizontalButton";

export default function FerrataLogScreen() {
    const { token } = useContext(UserContext);
    const { fetchFerrataStats } = useContext(FerrataContext);
    const [ ferrataName, setFerrataName ] = useState('');
    const [ selectedGrade, setSelectedGrade ] = useState(0);
    const [ selectedTimes, setSelectedTimes ] = useState(0);
    const [ seconds, setSeconds ] = useState(0);
    const [ minutes, setMinutes ] = useState(0);
    const [ hours, setHours ] = useState(0);

    const gradeData = Array.from({length: 7}).map((_, i) => ferrataGradeIdToGradeName(i-1));
    const timesData = Array.from({length: 52}).map((_, i) => i === 0 ? "-" : `${i}`);
    const gradeRef = useRef<ScrollPickerHandle>(null);
    const timesRef = useRef<ScrollPickerHandle>(null);
    const secondsRef = useRef<ScrollPickerHandle>(null);
    const minutesRef = useRef<ScrollPickerHandle>(null);
    const hoursRef = useRef<ScrollPickerHandle>(null);

    function padNumbers(num: number) {
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
            fetchFerrataStats();
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
        setTimeout(() => {
            gradeRef.current && gradeRef.current.scrollToTargetIndex(0);
            timesRef.current && timesRef.current.scrollToTargetIndex(0);
            secondsRef.current && secondsRef.current.scrollToTargetIndex(0);
            minutesRef.current && minutesRef.current.scrollToTargetIndex(0);
            hoursRef.current && hoursRef.current.scrollToTargetIndex(0);
        }, 0);
    }

    useEffect(() => {
        setDefaults();
    }, []);

    return (
        <SafeAreaView style={CommonStyles.paddedContainer}>
            <ScrollView contentContainerStyle={[CommonStyles.centered, CommonStyles.smallGapped]}>
                <Text style={Fonts.h2}>Jméno ferraty:</Text>
                <TextInput
                    style={[CommonStyles.input, {width: "100%"}]}
                    placeholder="Jméno ferraty"
                    value={ferrataName}
                    onChangeText={setFerrataName}
                    maxLength={100}
                />
                <StyledScrollPicker
                    ref={gradeRef}
                    name={"Obtížnost:"}
                    data={gradeData}
                    selectedIndex={selectedGrade}
                    onValueChange={(_, index) => setSelectedGrade(index)}
                    color={Colors.ferrataPrimary}
                    centered={true}
                />
                <StyledScrollPicker
                    ref={timesRef}
                    name={"Opakováno v řadě:"}
                    data={timesData}
                    selectedIndex={selectedTimes}
                    onValueChange={(_, index) => setSelectedTimes(index)}
                    color={Colors.ferrataPrimary}
                    centered={true}
                />
                <Text style={Fonts.h3}>Čas (hh:mm:ss):</Text>
                <View style={styles.timeContainer}>
                    <ScrollPicker
                        ref={hoursRef}
                        dataSource={Array.from({length: 100}, (_, i) => padNumbers(i))}
                        selectedIndex={hours}
                        wrapperHeight={70}
                        wrapperBackground="#FFFFFF"
                        itemHeight={35}
                        highlightColor={Colors.border}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: Colors.ferrataPrimary}]}
                        onValueChange={(_, index) => setHours(index)}
                    />
                    <Text style={styles.colon}>:</Text>
                    <ScrollPicker
                        ref={minutesRef}
                        dataSource={Array.from({length: 60}, (_, i) => padNumbers(i))}
                        selectedIndex={minutes}
                        wrapperHeight={70}
                        wrapperBackground="#FFFFFF"
                        itemHeight={35}
                        highlightColor={Colors.border}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: Colors.ferrataPrimary}]}
                        onValueChange={(_, index) => setMinutes(index)}
                    />
                    <Text style={styles.colon}>:</Text>
                    <ScrollPicker
                        ref={secondsRef}
                        dataSource={Array.from({length: 60}, (_, i) => padNumbers(i))}
                        selectedIndex={seconds}
                        wrapperHeight={70}
                        wrapperBackground="#FFFFFF"
                        itemHeight={35}
                        highlightColor={Colors.border}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: Colors.ferrataPrimary}]}
                        onValueChange={(_, index) => setSeconds(index)}
                    />
                </View>
            </ScrollView>
            <Button label={"Odeslat"} onPress={logSend} color={Colors.ferrataPrimary} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    timeContainer: {
        flexDirection: 'row',
        maxWidth: "50%",
        height: 65,
    },
    colon: {
        fontSize: 24,
        paddingTop: 14,
    },
});