import { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from "@/context/UserContext";
import { SettingsContext } from "@/context/SettingsContext";
import { BoulderContext } from "@/context/BoulderContext";
import { apiURL } from '@/constants/Other';
import { StarRatingClickable } from '@/components/StarRatingClickable';
import { gradeIdToGradeName, attemptIdToAttemptName, calculateBoulderScore } from '@/scripts/utils';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import StyledScrollPicker from "@/components/StyledScrollPicker";
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";

export default function LogScreen() {
    const { id } = useLocalSearchParams();
    const { settings, wallConfig } = useContext(SettingsContext);
    const { token, loggedUser } = useContext(UserContext);
    const {
        currentBoulder,
        setReload,
        currentChallenge,
        userSavedAttempts,
        boulderQuest,
        setBoulderQuest
    } = useContext(BoulderContext);
    const [ selectedAngle, setSelectedAngle ] = useState(settings.angle);
    const [ selectedRating, setSelectedRating ] = useState(settings.rating);
    const [ selectedGrade, setSelectedGrade ] = useState(currentBoulder?.average_grade === -1 ? 0 : (currentBoulder?.average_grade ?? 0));
    const [ selectedAttempts, setSelectedAttempts ] = useState(0);

    const router = useRouter();
    const angleData = Array.from({length: 46}).map((_, i) => ({value: i, label: i}));
    const gradeData = Array.from({length: 53}).map((_, i) => ({
        value: i,
        label: gradeIdToGradeName(i, settings.grading)
    }));
    const attemptsData = Array.from({length: 12}).map((_, i) => ({
        value: i,
        label: attemptIdToAttemptName(i - 1)
    }));


    const logSend = async () => {
        if (selectedAttempts === 0) {
            alert("Musíte zadat počet pokusů.");
            return;
        }
        let isQuest = false;
        if (boulderQuest?.[loggedUser]?.boulder === Number(id)) {
            isQuest = true;
        }
        const response = await fetch(`${apiURL}/log_send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                boulder_id: id,
                angle: selectedAngle,
                grade: selectedGrade,
                attempts: selectedAttempts-1,
                rating: selectedRating,
                challenge: currentChallenge.id,
                quest: isQuest,
            }),
        })
        const jsonResponse = await response.text();
        if (!response.ok) {
            alert(jsonResponse);
            return;
        }
        setReload(true);
        if (isQuest) {
            setBoulderQuest({...boulderQuest, [loggedUser]: {...boulderQuest[loggedUser], completed: true}})
        }
        router.back();
    }


    useEffect(() => {
        setSelectedAngle(settings.angle);
        setSelectedRating(settings.rating);
        setSelectedGrade(currentBoulder?.average_grade === -1 ? 0 : (currentBoulder?.average_grade ?? 0));
        setSelectedAttempts(0);
    }, [settings, id, currentBoulder]);


    return (
        <SafeAreaView style={CommonStyles.paddedContainerHorizontal}>
            <ScrollView contentContainerStyle={styles.container}>
                <StyledScrollPicker
                    name={"Úhel"}
                    data={angleData}
                    value={selectedAngle}
                    onValueChange={setSelectedAngle}
                />
                {
                    selectedAngle !== wallConfig.angle &&
                    <View style={{backgroundColor: Colors.highlight, padding: 10, borderRadius: 10, marginTop: 10}}>
                        <Text style={Fonts.h3}>Vybraný úhel {selectedAngle} se liší od skutečného úhlu stěny {wallConfig.angle}!</Text>
                    </View>
                }
                <StyledScrollPicker
                    name={"Obtížnost"}
                    data={gradeData}
                    value={selectedGrade}
                    onValueChange={setSelectedGrade}
                />
                <StyledScrollPicker
                    name={"Počet pokusů"}
                    data={attemptsData}
                    value={selectedAttempts}
                    onValueChange={setSelectedAttempts}
                >
                    <Text style={Fonts.plain}>Zatím pokusů: {userSavedAttempts[String(id)]}</Text>
                </StyledScrollPicker>
                <Text style={Fonts.plain}>
                    Bodů: {
                        calculateBoulderScore(
                            currentBoulder?.average_grade === -1 ? selectedGrade : currentBoulder?.average_grade ?? 0,
                            selectedAttempts-1,
                            ([2, 5, 6, 9].includes(currentChallenge.id) && currentBoulder?.tags.includes(15)) ? 1 : currentChallenge.score
                        )
                    }
                </Text>
                {
                    ([2, 5, 6, 9].includes(currentChallenge.id) && currentBoulder?.tags.includes(15)) ? (
                        <View style={{backgroundColor: Colors.highlight, padding: 10, borderRadius: 10, marginTop: 10}}>
                            <Text style={Fonts.plainBold}>
                                Výzva '{currentChallenge.name}' nelze použít pro boulder s tagem 'Campus'. Výlez se počítá jako bez výzvy.
                            </Text>
                        </View>
                    ) : null
                }
                <StarRatingClickable maxStars={5} initialRating={settings.rating} onRatingChange={setSelectedRating} size={48}/>
            </ScrollView>
            <View style={CommonStyles.smallGapped}>
                <Button label={"Odeslat"} onPress={logSend} />
                <Button label={"Zavřít"} onPress={() => router.back()} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        alignItems: 'center',
        gap: 20,
    },
});