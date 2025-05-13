import {useEffect, useState, useContext, useCallback} from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { BoulderContext } from '@/context/BoulderContext';
import { SettingsContext } from "@/context/SettingsContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { gradeIdToGradeName, filterBoulders } from '@/scripts/utils';
import { FontAwesome } from '@expo/vector-icons';
import { BoulderType } from "@/types/boulderType";
import { ChallengeType } from "@/types/challengeType";
import StyledMultiSlider from "@/components/StyledMultiSlider";
import RowSwitch from "@/components/RowSwitch";
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'


export default function Random(){
    const { boulders, setCurrentBoulder, challenges, setCurrentChallenge } = useContext(BoulderContext);
    const { settings } = useContext(SettingsContext);
    const [ bouldersInRange, setBouldersInRange ] = useState<BoulderType[]>([]);
    const [ gradeRange, setGradeRange ] = useState([0, 52]);
    const [ randomBoulder, setRandomBoulder ] = useState<BoulderType | undefined>(undefined);
    const [ randomChallenge, setRandomChallenge ] = useState<ChallengeType | undefined>(undefined);
    const [ challengeActive, setChallengeActive ] = useState(false);
    const [ showUnsentSeasonal, setShowUnsentSeasonal ] = useState(false);
    const [ showUnsent, setShowUnsent ] = useState(false);
    const [ includeOpen, setIncludeOpen ] = useState(false);

    const router = useRouter();


    function handleReroute() {
        if (!randomBoulder) return;
        setCurrentBoulder(randomBoulder);
        router.push(`/${randomBoulder.id}`);
    }

    function getRandomBoulder() {
        if (bouldersInRange.length === 0) {
            return undefined;
        }

        const randomIndex = Math.floor(Math.random() * bouldersInRange.length);

        return bouldersInRange[randomIndex];
    }

    function getRandomChallenge() {
        if (challenges.length === 0) {
            setRandomChallenge(undefined);
            return;
        }

        const randomIndex = Math.floor(Math.random() * challenges.length);

        setRandomChallenge(challenges[randomIndex]);
        if (challengeActive) {
            setCurrentChallenge(challenges[randomIndex]);
        }
    }

    const handleFilter = useCallback(() => {
        const [minGrade, maxGrade] = gradeRange;
        const chosenBoulders = filterBoulders(boulders, includeOpen, minGrade, maxGrade, showUnsent, false, [], showUnsentSeasonal);

        setBouldersInRange(chosenBoulders);
    }, [boulders, gradeRange, showUnsent, includeOpen, showUnsentSeasonal]);


    function handleRandomBoulder() {
        const rBoulder = getRandomBoulder();
        if (boulders.length === 0) {
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
    }, [handleFilter]);


    return (
        <SafeAreaView style={CommonStyles.paddedContainer}>
            <ScrollView style={CommonStyles.container}>
                <View style={styles.randomSettings}>
                    <StyledMultiSlider
                        min={0}
                        max={52}
                        step={1}
                        values={gradeRange}
                        onValuesChange={(values) => setGradeRange(values)}
                        onValuesChangeFinish={handleFilter}
                        snapped={true}
                        allowOverlap={true}
                    />
                    <Text style={Fonts.h3}>Rozsah obtížností</Text>
                    <Text style={Fonts.plainBold}>Od: {gradeIdToGradeName(gradeRange[0], settings.grading)}</Text>
                    <Text style={Fonts.plainBold}>Do: {gradeIdToGradeName(gradeRange[1], settings.grading)}</Text>
                    <RowSwitch label={"Pouze nevylezené:"} value={showUnsent} onValueChange={setShowUnsent} />
                    <RowSwitch label={"Pouze nevylezené (sezóna):"} value={showUnsentSeasonal} onValueChange={setShowUnsentSeasonal} />
                    <RowSwitch label={"Open bouldery:"} value={includeOpen} onValueChange={setIncludeOpen} />
                    <View style={{marginVertical: 10}}>
                        <Text style={Fonts.plainBold}>Počet boulderů v rozsahu: {bouldersInRange.length}</Text>
                    </View>
                    <Button label={"Náhodný boulder"} onPress={handleRandomBoulder} />
                    {
                        randomBoulder ? (
                            <View>
                                <Text style={Fonts.h3}>{randomBoulder.name}</Text>
                                <Text style={Fonts.h3}>{gradeIdToGradeName(randomBoulder.average_grade, settings.grading)}</Text>
                            </View>
                        ) : (
                            <Text style={Fonts.h3}>Není vybrán žádný boulder</Text>
                        )
                    }
                </View>
                <View style={styles.randomChallenge}>
                    <Button label={"Náhodná výzva"} onPress={getRandomChallenge} />
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
                            : <FontAwesome name="power-off" size={48} color={Colors.borderDark} />
                        }
                    </TouchableOpacity>
                </View>
                <View style={styles.randomChallenges}>
                    <Text style={Fonts.h2}>Možné výzvy:</Text>
                    {
                        challenges.map((challenge, index) => {
                            return (
                                <TouchableOpacity key={index} onPress={() =>
                                    {
                                        setRandomChallenge(challenge);
                                        if (challengeActive) {
                                            setCurrentChallenge(challenge);
                                        }
                                    }
                                }>
                                    <View style={CommonStyles.justifiedRow}>
                                        <Text style={Fonts.h3}>{index+1}. {challenge.name}</Text>
                                        <Text style={Fonts.h3}>ID: {challenge.id}</Text>
                                    </View>
                                    <Text style={Fonts.plainBold}>{challenge.description}</Text>
                                    <Text style={Fonts.plainBold}>Skóre: {challenge.score}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            </ScrollView>
            <Button label={"Jít na boulder"} onPress={handleReroute} />
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    randomSettings: {
        padding: 20,
        alignItems: 'center',
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
});
