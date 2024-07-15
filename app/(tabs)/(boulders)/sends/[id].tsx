import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../../context';
import { apiURL } from '../../../../constants/Other';
import ScrollPicker from "react-native-wheel-scrollview-picker";
import { StarRatingClickable } from '../../../../components/StarRatingClickable';
import { Fonts } from '../../../../constants/Fonts';
import { gradeIdToGradeName, attemptIdToAttemptName } from '../../../../scripts/utils';
import { Colors } from '../../../../constants/Colors';


export default function LogScreen() {
    const { id } = useLocalSearchParams();
    const { settings, token, currentBoulder, setReload, currentChallenge } = useContext(GlobalStateContext);
    const [ selectedAngle, setSelectedAngle ] = useState(settings.angle);
    const [ selectedRating, setSelectedRating ] = useState(settings.rating);
    const [ selectedGrade, setSelectedGrade ] = useState(currentBoulder.average_grade == -1 ? 0 : currentBoulder.average_grade);
    const [ selectedAttempts, setSelectedAttempts ] = useState(0);
    const router = useRouter();

    const angleData = Array(46).fill().map((_, i) => i);
    const gradeData = Array(53).fill().map((_, i) => gradeIdToGradeName(i, settings.grading));
    const attemptsData = Array(11).fill().map((_, i) => attemptIdToAttemptName(i));


    const logSend = () => {
        fetch(`${apiURL}/climbing/log_send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                boulder_id: id,
                angle: selectedAngle,
                grade: selectedGrade,
                attempts: selectedAttempts,
                rating: selectedRating,
                challenge: currentChallenge.id,
            }),
        })
        .then(response => response.text())
        .then(jsonResponse => console.log(jsonResponse))
        .catch(error => console.log(error))
        .finally(() => {setReload(true); router.back()});
    }

    const setDefaults = () => {
        setSelectedAngle(settings.angle);
        setSelectedRating(settings.rating);
        setSelectedGrade(currentBoulder.average_grade == -1 ? 0 : currentBoulder.average_grade);
        setSelectedAttempts(0);
    }

    useEffect(() => {
        setDefaults();
    }, [settings, id]);


    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.picker}>
                    <Text style={Fonts.h3}>Úhel</Text>
                    <ScrollPicker
                        dataSource={angleData}
                        selectedIndex={settings.angle}
                        wrapperHeight={styles.pickerHeight}
                        wrapperBackground="#FFFFFF"
                        itemHeight={styles.pickerHeight}
                        highlightColor={Colors.border}
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                        onValueChange={(value) => setSelectedAngle(value)}
                    />
                </View>
                <View style={styles.picker}>
                    <Text style={Fonts.h3}>Obtížnost</Text>
                    <ScrollPicker
                        dataSource={gradeData}
                        selectedIndex={selectedGrade}
                        wrapperHeight={styles.pickerHeight}
                        wrapperBackground="#FFFFFF"
                        itemHeight={styles.pickerHeight}
                        highlightColor={Colors.border}
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                        onValueChange={(_, index) => setSelectedGrade(index)}
                    />
                </View>
                <View style={styles.picker}>
                    <Text style={Fonts.h3}>Počet pokusů</Text>
                    <ScrollPicker
                        dataSource={attemptsData}
                        wrapperHeight={styles.pickerHeight}
                        wrapperBackground="#FFFFFF"
                        itemHeight={styles.pickerHeight}
                        highlightColor={Colors.border}
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                        onValueChange={(_, index) => setSelectedAttempts(index)}
                    />
                </View>
                <StarRatingClickable maxStars={5} initialRating={settings.rating} onRatingChange={setSelectedRating} size={48}/>
            </ScrollView>
            <TouchableOpacity onPress={logSend}>
                <View style={styles.button}>
                    <Text style={Fonts.h3}>Odeslat</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
                <View style={styles.button}>
                    <Text style={Fonts.h3}>Zavřít</Text>
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
        backgroundColor: Colors.primary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginRight: 20,
        marginLeft: 20,
        marginBottom: 15,
    },
    picker: {
        width: "50%",
    },
    pickerHeight: 70,
});