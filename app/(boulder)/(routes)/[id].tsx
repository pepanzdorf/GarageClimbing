import { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoulderContext } from "@/context/BoulderContext";
import { UserContext } from "@/context/UserContext";
import { SettingsContext } from "@/context/SettingsContext";
import { apiURL } from '@/constants/Other';
import { StarRating } from '@/components/StarRating';
import {
    gradeIdToGradeName,
    calculateBoulderScore,
    confirmAction
} from '@/scripts/utils';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { CommentType } from "@/types/commentType";
import { SendType } from "@/types/sendType";
import { ChallengeType } from "@/types/challengeType";
import { BoulderWall } from "@/components/BoulderWall";
import { TimerControls } from "@/components/TimerControls";
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";
import Tag from "@/components/Tag";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'
import BoulderSend from "@/components/BoulderSend";
import StyledScrollPicker from "@/components/StyledScrollPicker";


export default function DetailsScreen() {
    const { id } = useLocalSearchParams();
    const { token, loggedUser } = useContext(UserContext);
    const { settings } = useContext(SettingsContext);
    const {
        boulders,
        currentBoulder,
        setCurrentBoulder,
        reloadBoulders,
        reload,
        setReload,
        currentChallenge,
        currentHolds,
        setCurrentHolds,
        currentBoulderIndex,
        setCurrentBoulderIndex,
        tags,
        arrowNavigationBoulders,
        userSavedAttempts,
        setUserSavedAttempts,
        savedBoulderAttempts,
        setSavedBoulderAttempts,
        saveBoulderAttempts
    } = useContext(BoulderContext);

    const [ sends, setSends ] = useState([]);
    const [ comments, setComments ] = useState([]);
    const [ commentModalVisible, setCommentModalVisible ] = useState(false);
    const [ comment, setComment ] = useState('');
    const [ isFavourite, setIsFavourite ] = useState(false);
    const [ show, setShow ] = useState(0);
    const [ completedChallenges, setCompletedChallenges ] = useState<{ ids: number[], rest: ChallengeType[] }>({ ids: [], rest: [] });
    const [ currentAttempts, setCurrentAttempts ] = useState(-1);

    const attemptsData = Array.from({length: 26}).map((_, i) => ({label: i, value: i}))
    const router = useRouter();
    const tabNames = [ "Zobrazit komentáře", "Zobrazit splněné výzvy", "Zobrazit výlezy" ];


    useEffect(() => {
        fetchBoulderHolds();
        fetchSends();
        fetchComments();
        fetchCompletedChallenges().catch(console.error);
    }, [id]);


    useEffect(() => {
        if (!currentBoulder) return;
        setIsFavourite(currentBoulder.favourite);
    }, [currentBoulder]);

    useEffect(() => {
        if (reload) {
            reloadBoulders();
            fetchSends();
            fetchCompletedChallenges().catch(console.error);
            fetchBoulderHolds();
            setReload(false);
            setCurrentAttempts(0);
        }
    }, [reload]);

    useEffect(() => {
        if (currentBoulder) {
            setCurrentBoulder(boulders.find((boulder) => boulder.id === currentBoulder.id));
        }
    }, [boulders]);


    useEffect(() => {
        setSavedBoulderAttempts({...savedBoulderAttempts, [loggedUser]: userSavedAttempts});
        saveBoulderAttempts();
    }, [userSavedAttempts]);


    useEffect(() => {
        setUserSavedAttempts({...userSavedAttempts, [String(id)]: currentAttempts});
    }, [currentAttempts]);


    useEffect(() => {
        const usa = savedBoulderAttempts[loggedUser];
        if (!usa) {
            setUserSavedAttempts({});
            setCurrentAttempts(0);
        } else {
            setUserSavedAttempts(usa);
            setCurrentAttempts(usa[String(id)]);
        }
    }, [loggedUser, id]);


    const toggleFavourite = () => {
        if (token === 'token') {
            alert('Pro přidání do oblíbených se musíte přihlásit');
            return;
        }
        const method = isFavourite ? 'DELETE' : 'POST';
        fetch(`${apiURL}/boulder/${id}/favourite`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => {if (response.ok) setIsFavourite(!isFavourite)})
            .catch(error => console.log(error));
    }


    const fetchCompletedChallenges = async () => {
        const response = await fetch(`${apiURL}/boulder/${id}/challenges/completed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                angle: settings.angle,
            }),
        })
        if (response.ok) {
            const jsonResponse = await response.json();
            setCompletedChallenges(jsonResponse);
        } else if (response.status === 400) {
        } else if (response.status === 401) {
        } else {
            console.log("Server error");
        }
    }


    const fetchBoulderHolds = () => {
        fetch(`${apiURL}/boulder/${id}/holds`)
            .then(response => response.json())
            .then(jsonResponse => setCurrentHolds(jsonResponse))
            .catch(console.error)
    };

    const fetchSends = () => {
        fetch(`${apiURL}/boulder/${id}/sends`,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    angle: settings.angle,
                })
            })
            .then(response => response.json())
            .then(jsonResponse => setSends(jsonResponse))
            .catch(console.error)
    }

    const fetchComments = () => {
        fetch(`${apiURL}/boulder/${id}/comments`)
            .then(response => response.json())
            .then(jsonResponse => setComments(jsonResponse))
            .catch(console.error)
    }

    const sendComment = () => {
        fetch(`${apiURL}/boulder/${id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                text: comment,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    response.text().then(text => alert(text));
                }
            })
            .catch(console.error)
            .finally(() => {fetchComments(); setComment(''); setCommentModalVisible(false)});
    }


    const deleteComment = (comment: CommentType) => {
        fetch(`${apiURL}/comment/${comment.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => fetchComments());
    }


    const deleteSend = (send: SendType) => {
        fetch(`${apiURL}/send/${send.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => fetchSends());
    }


    const deleteBoulder = () => {
        fetch(`${apiURL}/boulder/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(console.error)
            .finally(() => {
                reloadBoulders(); router.back();
            })
    }

    const handleEditBoulder = () => {
        router.push(`/boulder_editor?edit=true`);
    }

    const createGradeString = () => {
        if (!currentBoulder) return "";
        if (settings.grading === 0) {
            return `${gradeIdToGradeName(currentBoulder.average_grade, settings.grading)} (${gradeIdToGradeName(currentBoulder.average_grade, 1)})`;
        } else if (settings.grading === 1) {
            return `${gradeIdToGradeName(currentBoulder.average_grade, settings.grading)} (${gradeIdToGradeName(currentBoulder.average_grade, 0)})`;
        } else {
            return `${gradeIdToGradeName(currentBoulder.average_grade, settings.grading)} (${gradeIdToGradeName(currentBoulder.average_grade, 0)}) (${gradeIdToGradeName(currentBoulder.average_grade, 1)})`;
        }
    }

    const handleArrowNavigation = (boulderIndex: number) => {
        if (!arrowNavigationBoulders[boulderIndex]) return;
        setCurrentBoulder(arrowNavigationBoulders[boulderIndex]);
        setCurrentBoulderIndex(boulderIndex);
        router.replace(`/${arrowNavigationBoulders[boulderIndex].id}`);
    }

    const startShownTimer = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/start_shown`, {method: 'POST'})
            .catch(console.error);
    }

    const stopShownTimer = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/stop_shown`, {method: 'POST'})
            .catch(console.error);
    }

    const pauseShownTimer = () => {
        fetch(`http://${settings.timerIP}:${settings.timerPort}/pause_shown`, {method: 'POST'})
            .catch(console.error);
    }

    const RenderSendsCommentsChallenges = () => {
        if (show === 1) {
            if (comments.length > 0) {
                return (
                    <View style={styles.commentsContainer}>
                        <View style={styles.addButton}>
                            <TouchableOpacity onPress={() => setCommentModalVisible(true)}>
                                <FontAwesome name="plus" size={36} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        {
                            comments.map((comment: CommentType) => (
                                <TouchableOpacity key={comment.id} onPress={ () =>
                                    confirmAction(
                                        "Vymazat výlez",
                                        "Opravdu chcete smazat tento výlez?",
                                        () => deleteComment(comment)
                                    )
                                }>
                                    <View key={comment.id} style={styles.sendContainer}>
                                        <Text style={Fonts.h3}>
                                            {comment.name}
                                        </Text>
                                        <Text style={Fonts.small}>
                                            {new Date(comment.date).toLocaleDateString() + " " + new Date(comment.date).toLocaleTimeString()}
                                        </Text>
                                        <Text style={Fonts.plain}>
                                            {comment.text}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                )
            } else {
                return (
                    <View style={styles.commentsContainer}>
                        <View style={CommonStyles.justifiedRow}>
                            <Text style={Fonts.h3}>
                                Žádné komentáře
                            </Text>
                            <TouchableOpacity onPress={() => setCommentModalVisible(true)}>
                                <FontAwesome name="plus" size={36} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
        } else if (show === 0) {
            if (sends.length > 0) {
                return (
                    <View>
                        {
                            sends.map((send: SendType) => (
                                <BoulderSend
                                    key={send.id}
                                    send={send}
                                    grading={settings.grading}
                                    withName={false}
                                    onPress={ (send) =>
                                        confirmAction(
                                            "Vymazat výlez",
                                            "Opravdu chcete smazat tento výlez?",
                                            () => deleteSend(send)
                                        )
                                    }
                                />
                            ))
                        }
                    </View>
                )
            } else {
                return (
                    <Text style={Fonts.h3}>
                        Ještě nevylezeno
                    </Text>
                )
            }
        } else {
            if (completedChallenges) {
                if (completedChallenges["rest"].length > 0) {
                    return (
                        completedChallenges["rest"].map((challenge) => (
                            <View key={challenge.id} style={styles.sendContainer}>
                                <View style={CommonStyles.justifiedRow}>
                                    <Text style={Fonts.h3}>
                                        {challenge.name}
                                    </Text>
                                    <Text style={Fonts.h3}>
                                        ID: {challenge.id}
                                    </Text>
                                </View>
                                <Text style={Fonts.small}>
                                    Skóre: {challenge.score}
                                </Text>
                            </View>
                        ))
                    )
                } else {
                    return (
                        <Text style={Fonts.h3}>
                            Žádné splněné výzvy
                        </Text>
                    )
                }
            }
        }
    }


    return (
        <SafeAreaView style={CommonStyles.container}>
            <ScrollView>
                {
                    currentBoulder &&
                    <BoulderWall
                        holds={currentHolds}
                        lineWidth={settings.lineWidth}
                        darken={settings.darkenPreview}
                        darkening={settings.darkening}
                        removeRandomHold={currentChallenge.id === 7}
                        currentBoulderId={currentBoulder.id}
                    />
                }
                <View style={[CommonStyles.row, {margin: 10}]}>
                    {
                        currentBoulderIndex === 0 ? <FontAwesome name="arrow-left" size={40} color="transparent" /> :
                            <FontAwesome name="arrow-left" size={40} color={Colors.primary} onPress={() => handleArrowNavigation(currentBoulderIndex - 1)} />
                    }
                    <View style={[CommonStyles.container, {paddingHorizontal: 15}]}>
                        <Button label={"Log send"} onPress={() => router.push(`/send/${id}`)}/>
                    </View>
                    {
                        currentBoulderIndex === arrowNavigationBoulders.length-1 ? <FontAwesome name="arrow-right" size={40} color="transparent" /> :
                            <FontAwesome name="arrow-right" size={40} color={Colors.primary} onPress={() => handleArrowNavigation(currentBoulderIndex + 1)} />
                    }
                </View>
                {
                    currentBoulder &&
                    <View style={styles.details}>
                        {
                            settings.showTimerControls ?
                                <TimerControls onPause={pauseShownTimer} onStop={stopShownTimer} onStart={startShownTimer} />
                                : null
                        }
                        <View style={CommonStyles.justifiedRow}>
                            <Text style={[Fonts.h1, styles.boulderName]}>
                                {currentBoulder.name}
                            </Text>
                            <View style={CommonStyles.row}>
                                {
                                    currentBoulder.sent ? (
                                        <FontAwesome name="check" size={24} color={Colors.primary} />
                                    ) : null
                                }
                                {
                                    currentBoulder.sent_season ? (
                                        <FontAwesome name="check" size={24} color='green' />
                                    ) : null
                                }
                                <FontAwesome name={isFavourite ? "heart" : "heart-o"} size={24} color="red" onPress={toggleFavourite} />
                            </View>
                        </View>
                        <View style={CommonStyles.justifiedRow}>
                            <Text style={Fonts.small}>
                                { new Date(currentBoulder.build_time).toLocaleDateString() + " " + new Date(currentBoulder.build_time).toLocaleTimeString()}
                            </Text>
                            <Text style={Fonts.plain}>
                                { currentBoulder.built_by }
                            </Text>
                        </View>
                        <Text style={Fonts.plain}>
                            { currentBoulder.description }
                        </Text>
                        {
                            currentChallenge.id === 1 ? null : (
                                <View style={[CommonStyles.justifiedRow, {marginTop:20}]}>
                                    {
                                        completedChallenges["ids"].includes(currentChallenge.id) ? (
                                            <FontAwesome5 name="crown" size={24} color='gold' />
                                        ) : (
                                            <FontAwesome5 name="crown" size={24} color={Colors.borderDark} />
                                        )
                                    }
                                    <Text style={Fonts.plainBold}>
                                        {currentChallenge.name}
                                    </Text>
                                </View>
                            )
                        }
                        <View style={CommonStyles.justifiedRow}>
                            <Text style={Fonts.h3}>
                                Hodnocení:
                            </Text>
                            <Text style={Fonts.h3}>
                                Bodů za flash:
                            </Text>
                            <Text style={Fonts.h3}>
                                Obtížnost:
                            </Text>
                        </View>
                        <View style={CommonStyles.justifiedRow}>
                            <StarRating rating={currentBoulder.average_rating} maxStars={5} size={20}/>
                            {
                                currentBoulder.average_grade === -1 ? (
                                    <Text style={Fonts.h3}>?</Text>
                                ) : (
                                    <Text style={Fonts.h3}>
                                        {calculateBoulderScore(currentBoulder.average_grade, 0, currentChallenge.score)}
                                    </Text>
                                )
                            }
                            <Text style={Fonts.h3}>
                                {createGradeString()}
                            </Text>
                        </View>
                    </View>
                }
                {
                    currentBoulder ? (
                    <View style={styles.tagsContainer}>
                        {
                            currentBoulder.tags.map((tagId, index) => {
                                const tag = tags.find(tag => tag.id === tagId);
                                if (!tag) return null;
                                return (
                                    <Tag key={index} id={tag.id} name={tag.name} active={true} />
                                )
                            })
                        }
                    </View> ) : null
                }
                {
                    currentAttempts !== -1 &&
                    <View style={styles.picker}>
                        <Text style={Fonts.h3}>Zatím pokusů:</Text>
                        <StyledScrollPicker
                            data={attemptsData}
                            value={currentAttempts}
                            onValueChange={setCurrentAttempts}
                            width={'100%'}
                            scrollerWidth={150}
                            centeredView={true}
                        />
                    </View>
                }
                <View style={styles.sendComContainer}>
                    <Button label={tabNames[show]} onPress={() => setShow((show+1)%3)}/>
                    <RenderSendsCommentsChallenges />
                </View>
                <View style={[CommonStyles.paddedContainerHorizontal, CommonStyles.smallGapped]}>
                    <Button label={"Smazat"} onPress={
                        () =>
                            confirmAction(
                                "Vymazat boulder",
                                "Opravdu chcete smazat tento boulder?",
                                () => deleteBoulder()
                            )
                    } color={Colors.highlight}/>
                    <Button label={"Upravit"} onPress={handleEditBoulder} color={Colors.highlight}/>
                </View>
            </ScrollView>

            <Modal visible={commentModalVisible}>
                <View style={CommonStyles.paddedContainer}>
                    <TextInput
                        style={CommonStyles.multilineInput}
                        placeholder="Napište komentář:"
                        value={comment}
                        onChangeText={setComment}
                        multiline={true}
                        maxLength={500}
                    />
                    <View style={CommonStyles.gapped}>
                        <Button label={"Odeslat"} onPress={sendComment}/>
                        <Button label={"Zavřít"} onPress={() => setCommentModalVisible(false)}/>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backgroundImageHigher: {
        resizeMode:'contain',
        width: undefined,
        height: '100%',
        aspectRatio: 820.5611 / 1198.3861,
    },
    backgroundImageWider: {
        resizeMode:'contain',
        width: '100%',
        height: undefined,
        aspectRatio: 820.5611 / 1198.3861,
    },
    sendComContainer: {
        padding: 10,
        paddingHorizontal: 25,
        marginTop: 20,
        gap: 10,
    },
    commentsContainer: {
        marginTop: 10,
    },
    details: {
        padding: 10,
        paddingHorizontal: 25,
        gap: 5,
    },
    sendContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        borderRadius: 10,
        marginBottom: 8,
        backgroundColor: Colors.darkerBackground,
    },
    boulderName: {
        flex:1,
        flexWrap: 'wrap',
        marginRight: 10,
    },
    addButton : {
        flexDirection: 'row-reverse',
    },
    tagsContainer: {
        padding: 10,
        paddingHorizontal: 25,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    picker: {
        paddingHorizontal: 25,
    },
});
