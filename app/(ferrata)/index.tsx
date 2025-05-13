import { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiURL } from '@/constants/Other';
import { ferrataGradeIdToGradeName } from '@/scripts/utils';
import { UserContext } from "@/context/UserContext";
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

    const gradeData = Array.from({length: 7}).map((_, i) => ({
        value: i,
        label: ferrataGradeIdToGradeName(i - 1)
    }));
    const timesData = Array.from({length: 52}).map((_, i) => ({
        value: i,
        label: i === 0 ? "-" : `${i}`
    }));
    const hoursData = Array.from({length: 100}).map((_, i) => ({
        value: i,
        label: padNumbers(i)
    }));
    const minutesData = Array.from({length: 60}).map((_, i) => ({
        value: i,
        label: padNumbers(i)
    }));
    const secondsData = Array.from({length: 60}).map((_, i) => ({
        value: i,
        label: padNumbers(i)
    }));


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
                    name={"Obtížnost:"}
                    data={gradeData}
                    value={selectedGrade}
                    onValueChange={setSelectedGrade}
                    color={Colors.ferrataPrimary}
                    centered={true}
                />
                <StyledScrollPicker
                    name={"Opakováno v řadě:"}
                    data={timesData}
                    value={selectedTimes}
                    onValueChange={setSelectedTimes}
                    color={Colors.ferrataPrimary}
                    centered={true}
                />
                <Text style={Fonts.h3}>Čas (hh:mm:ss):</Text>
                <View style={CommonStyles.row}>
                    <StyledScrollPicker
                        data={hoursData}
                        value={hours}
                        onValueChange={setHours}
                        color={Colors.ferrataPrimary}
                        width={60}
                    />
                    <Text style={styles.colon}>:</Text>
                    <StyledScrollPicker
                        data={minutesData}
                        value={minutes}
                        onValueChange={setMinutes}
                        color={Colors.ferrataPrimary}
                        width={60}
                    />
                    <Text style={styles.colon}>:</Text>
                    <StyledScrollPicker
                        data={secondsData}
                        value={seconds}
                        onValueChange={setSeconds}
                        color={Colors.ferrataPrimary}
                        width={60}
                    />
                </View>
            </ScrollView>
            <Button label={"Odeslat"} onPress={logSend} color={Colors.ferrataPrimary} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    colon: {
        fontSize: 24,
        paddingTop: 22,
    },
});