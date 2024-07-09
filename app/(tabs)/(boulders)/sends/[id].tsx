import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Image, ImageBackground, Button, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../../context';
import { Svg, Circle, Image as SvgImage, Path, Rect, Mask, ClipPath, Defs, G, Use } from 'react-native-svg'
import { apiURL } from '../../../../constants/Other';
import ScrollPicker from "react-native-wheel-scrollview-picker";
import { StarRatingClickable } from '../../../../components/StarRatingClickable';
import { Fonts } from '../../../../constants/Fonts';
import { gradeIdToGradeName, attemptIdToAttemptName } from '../../../../scripts/utils';



export default function LogScreen() {
    const { id } = useLocalSearchParams();
    const { settings, token, currentBoulder } = useContext(GlobalStateContext);
    const [ selectedAngle, setSelectedAngle ] = useState(settings.angle);
    const [ selectedRating, setSelectedRating ] = useState(settings.rating);
    const [ selectedGrade, setSelectedGrade ] = useState(currentBoulder.average_grade);
    const [ selectedAttempts, setSelectedAttempts ] = useState(0);
    const router = useRouter();

    const angleData = Array(46).fill().map((_, i) => i);
    const gradeData = Array(53).fill().map((_, i) => gradeIdToGradeName(i));
    const attemptsData = Array(12).fill().map((_, i) => attemptIdToAttemptName(i));


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
            }),
        })
        .then(response => response.text())
        .then(jsonResponse => console.log(jsonResponse))
        .catch(error => console.log(error))
        .finally(() => router.back());
    }

    const setDefaults = () => {
        setSelectedAngle(settings.angle);
    }

    useEffect(() => {
        setDefaults();
    }, [settings, id]);


    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView style={styles.container}>
                <View style={{width: "35%"}}>
                    <Text>Úhel</Text>
                    <ScrollPicker
                        dataSource={angleData}
                        selectedIndex={settings.angle}
                        wrapperHeight={60}
                        wrapperBackground="#FFFFFF"
                        itemHeight={60}
                        highlightColor="#aaaaaa"
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: "red"}]}
                        onValueChange={(value) => setSelectedAngle(value)}
                    />
                </View>
                <View style={{width: "35%"}}>
                    <Text>Obtížnost</Text>
                    <ScrollPicker
                        dataSource={gradeData}
                        selectedIndex={selectedGrade}
                        wrapperHeight={60}
                        wrapperBackground="#FFFFFF"
                        itemHeight={60}
                        highlightColor="#aaaaaa"
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: "red"}]}
                        onValueChange={(_, index) => setSelectedGrade(index)}
                    />
                </View>
                <View style={{width: "35%"}}>
                    <Text>Počet pokusů</Text>
                    <ScrollPicker
                        dataSource={attemptsData}
                        wrapperHeight={60}
                        wrapperBackground="#FFFFFF"
                        itemHeight={60}
                        highlightColor="#aaaaaa"
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: "red"}]}
                        onValueChange={(value) => setSelectedAttempts(value)}
                    />
                </View>
                <StarRatingClickable maxStars={5} initialRating={settings.rating} onRatingChange={setSelectedRating} size={48}/>
            </ScrollView>
            <Button title="Odeslat" onPress={logSend}/>
            <Button title="Zpět" onPress={() => router.back()}/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    },
});