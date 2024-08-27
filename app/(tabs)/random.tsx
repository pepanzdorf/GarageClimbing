import React, { useEffect, useState, useContext } from "react";
import { View, Text, ActivityIndicator, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useRouter } from 'expo-router';
import { gradeIdToGradeName, filterBoulders, playSound } from '../../scripts/utils';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'
import { FontAwesome } from '@expo/vector-icons';


export default function Random(){
    const { boulders, fetchBoulders, isLoading, settings, setCurrentBoulder, challenges, setCurrentChallenge, currentChallenge } = useContext(GlobalStateContext);
    const [ bouldersInRange, setBouldersInRange ] = useState([]);
    const [ nBouldersInRange, setNBouldersInRange ] = useState(0);
    const [ gradeRange, setGradeRange ] = useState([0, 52]);
    const [ randomBoulder, setRandomBoulder ] = useState(null);
    const [ randomChallenge, setRandomChallenge ] = useState(null);
    const [ nChallenges, setNChallenges ] = useState(Object.keys(challenges).length);
    const [ challengeActive, setChallengeActive ] = useState(false);
    const router = useRouter();


    const multiSliderValuesChange = values => {setGradeRange(values)};
    const honk = require('../../assets/audio/honk.wav');


    function handleReroute() {
        if (randomBoulder === null) {
            return;
        }
        setCurrentBoulder(randomBoulder);
        router.push(`${randomBoulder.id}`);
    }

    function getRandomBoulder() {
        if (bouldersInRange.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * bouldersInRange.length);

        return bouldersInRange[randomIndex];
    }

    function getRandomChallenge() {
        if (nChallenges === 0) {
            setRandomChallenge(null);
            return;
        }

        const randomIndex = Math.floor(Math.random() * nChallenges);

        setRandomChallenge(challenges[randomIndex]);
        if (challengeActive) {
            setCurrentChallenge(challenges[randomIndex]);
        }
    }

    function handleFilter() {
        const [minGrade, maxGrade] = gradeRange;
        const chosenBoulders = filterBoulders(boulders, settings.includeOpen, minGrade, maxGrade, false, false, []);

        setBouldersInRange(chosenBoulders);
        setNBouldersInRange(chosenBoulders.length);
    }

    function handleRandomBoulder() {
        const rBoulder = getRandomBoulder(boulders, gradeRange);
        if (nBouldersInRange === 0) {
            alert('Žádný boulder nenalezen v tomto rozmezí obtížnosti');
        } else {
            setRandomBoulder(rBoulder);
        }
    }

    function handleRandomChallenge() {
        if (challengeActive) {
            setChallengeActive(false);
            setCurrentChallenge({id: 1, name: "Žádný", description: "nic", score: 1});
        }
        else {
            if (randomChallenge) {
                setChallengeActive(true);
                setCurrentChallenge(randomChallenge);
            }
        }
    }

    useEffect(() => {
        handleFilter();
    }, [boulders, settings]);

    useEffect(() => {
        setNChallenges(Object.keys(challenges).length);
    }, [challenges]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.randomSettings}>
                    <MultiSlider
                        values={[0, 52]}
                        sliderLength={280}
                        onValuesChange={multiSliderValuesChange}
                        onValuesChangeFinish={handleFilter}
                        min={0}
                        max={52}
                        step={1}
                        snapped
                        allowOverlap
                        markerStyle={styles.markerStyle}
                        touchDimensions={styles.touchDimensions}
                        selectedStyle={{backgroundColor: Colors.primary}}
                        unselectedStyle={{backgroundColor: Colors.border}}
                    ></MultiSlider>
                    <Text style={Fonts.h2}>Rozsah obtížností</Text>
                    <Text style={Fonts.plainBold}>Od: {gradeIdToGradeName(gradeRange[0], settings.grading)}</Text>
                    <Text style={Fonts.plainBold}>Do: {gradeIdToGradeName(gradeRange[1], settings.grading)}</Text>
                    <Text style={Fonts.plainBold}>Počet boulderů v rozsahu: {nBouldersInRange}</Text>
                    <TouchableOpacity onPress={handleRandomBoulder}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Náhodný boulder</Text>
                        </View>
                    </TouchableOpacity>
                    {
                        randomBoulder ? (
                            <View>
                            <Text style={Fonts.h3}>{randomBoulder.name}</Text>
                            <Text style={Fonts.h3}>{gradeIdToGradeName(randomBoulder.average_grade, settings.grading)}</Text>
                            </View>
                        ) : (
                            <Text style={Fonts.h3}>Není vybrán žádný boulder</Text>
                        )}
                </View>
                <View style={styles.randomChallenge}>
                    <TouchableOpacity onPress={getRandomChallenge}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Náhodná výzva</Text>
                        </View>
                    </TouchableOpacity>
                    {
                        randomChallenge ? (
                            <View>
                                <Text style={Fonts.h3}>{randomChallenge.name}</Text>
                                <Text style={Fonts.plainBold}>{randomChallenge.description}</Text>
                                <Text style={Fonts.plainBold}>Skóre: {randomChallenge.score}</Text>
                            </View>
                        ) : <Text style={Fonts.h3}>Žádná výzva</Text>
                    }
                    <TouchableOpacity onPress={handleRandomChallenge}>
                        {
                            challengeActive ? <FontAwesome name="power-off" size={48} color={Colors.primary} />
                            : <FontAwesome name="power-off" size={48} color={Colors.borderDark} />}
                    </TouchableOpacity>
                </View>
                <View style={styles.randomChallenges}>
                    <Text style={Fonts.h2}>Možné výzvy:</Text>
                    {challenges.map((challenge, index) => {
                        return (
                            <TouchableOpacity key={index} onPress={() =>
                                    {
                                        setRandomChallenge(challenge);
                                        if (challengeActive) {
                                            setCurrentChallenge(challenge);
                                        }
                                        if (challenge.id == 15) {
                                            playSound('honk', honk);
                                        }
                                    }
                                }>
                                <View key={index+1}>
                                    <View style={styles.row}>
                                        <Text style={Fonts.h3}>{index+1}. {challenge.name}</Text>
                                        <Text style={Fonts.h3}>ID: {challenge.id}</Text>
                                    </View>
                                    <Text style={Fonts.plainBold}>{challenge.description}</Text>
                                    <Text style={Fonts.plainBold}>Skóre: {challenge.score}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
            <TouchableOpacity onPress={handleReroute}>
                <View style={styles.button}>
                    <Text style={Fonts.h3}>Jít na boulder</Text>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    randomSettings: {
        padding: 20,
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 25,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    randomChallenges: {
        padding: 20,
        gap: 10,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    randomChallenge: {
        padding: 20,
        gap: 10,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 20,
        alignItems: 'center',
    },
    container: {
        flex:1,
        backgroundColor: Colors.background
    },
    markerStyle: {
        height: 20,
        width: 20,
        backgroundColor: Colors.primary,
    },
    touchDimensions: {
        height: 60,
        width: 60,
        borderRadius: 20,
        slipDisplacement: 200
    },
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
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
});
