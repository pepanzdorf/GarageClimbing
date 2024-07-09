import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Image, ImageBackground, Button, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../../context';
import { Svg, Circle, Image as SvgImage, Path, Rect, Mask, ClipPath, Defs, G, Use } from 'react-native-svg'
import { apiURL } from '../../../constants/Other';
import ScrollPicker from "react-native-wheel-scrollview-picker";
import { StarRatingClickable } from '../../../../components/StarRatingClickable';
import { Fonts } from '../../../../constants/Fonts';
import { gradeIdToGradeName, attemptIdToAttemptName } from '../../../../scripts/utils';



export default function LogScreen() {
    const { id } = useLocalSearchParams();
    const { settings } = useContext(GlobalStateContext);
    const [ selectedAngle, setSelectedAngle ] = useState();
    const [ selectedRating, setSelectedRating ] = useState();
    const [ selectedGrade, setSelectedGrade ] = useState();
    const [ selectedAttempts, setSelectedAttempts ] = useState();
    const router = useRouter();

    const angleData = Array(46).fill().map((_, i) => i);
    const gradeData = Array(53).fill().map((_, i) => gradeIdToGradeName(i));
    const attemptsData = Array(12).fill().map((_, i) => attemptIdToAttemptName(i));


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
                        wrapperHeight={60}
                        wrapperBackground="#FFFFFF"
                        itemHeight={60}
                        highlightColor="#aaaaaa"
                        highlightBorderWidth={2}
                        itemTextStyle={Fonts.h3}
                        activeItemTextStyle={[Fonts.h3, {color: "red"}]}
                        onValueChange={(value) => setSelectedGrade(value)}
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
            <Button title="Return" onPress={() => router.back()}/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    },
});