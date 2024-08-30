import React, { useEffect, useState, useContext } from 'react';
import { Alert, View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, ImageBackground, ScrollView, Dimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../context';
import { Svg, Path, Rect, ClipPath, Defs, G, Use, Mask, Pattern, Line } from 'react-native-svg'
import { apiURL } from '../../../constants/Other';
import { StarRating } from '../../../components/StarRating';
import { gradeIdToGradeName, attemptIdToAttemptName, numberToStrokeColor, numberToFillColor, tagIdToIconName } from '../../../scripts/utils';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { EmojiIcon } from '../../../components/EmojiIcon';
import ScrollPicker from "react-native-wheel-scrollview-picker";

export default function DetailsScreen() {
    const { id } = useLocalSearchParams();
    const {
        wallImage,
        settings,
        token,
        currentBoulder,
        reload,
        reloadBoulders,
        currentChallenge,
        setCurrentHolds,
        currentHolds,
        setReload,
        currentBoulderIndex,
        setCurrentBoulder,
        setCurrentBoulderIndex,
        arrowNavigationBoulders,
        calculateScoreScript,
        tags,
        savedBoulderAttempts,
        setSavedBoulderAttempts,
        loggedUser,
        userSavedAttempts,
        setUserSavedAttempts,
    } = useContext(GlobalStateContext);
    const [holds, setHolds] = useState(null);
    const [sends, setSends] = useState([]);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [isFavourite, setIsFavourite] = useState(false);
    const [show, setShow] = useState(0);
    const [completedChallenges, setCompletedChallenges] = useState(null);
    const [randomHold, setRandomHold] = useState(null);

    const windowAspectRatio = Dimensions.get('window').width / Dimensions.get('window').height;
    const tabBarHeight = useBottomTabBarHeight();
    const maxHeight = Dimensions.get('window').height - tabBarHeight*3;
    const imageAspectRatio = 820.5611 / 1198.3861;
    const isImageWider = windowAspectRatio < imageAspectRatio;
    const router = useRouter();
    const tabNames = ["Zobrazit komentáře", "Zobrazit splněné výzvy", "Zobrazit výlezy"];
    const zoomableViewRef = React.createRef<ReactNativeZoomableView>();
    const attemptsData = Array(26).fill().map((_, i) => i);
    const scrollRef = React.useRef();


    useEffect(() => {
        setIsLoading(true);
        fetchBoulderHolds();
        fetchSends();
        fetchComments();
        fetchCompletedChallenges();
    }, [id]);

    useEffect(() => {
        setSavedBoulderAttempts({...savedBoulderAttempts, [loggedUser]: userSavedAttempts});
    }, [userSavedAttempts]);

    useEffect(() => {
        const usa = savedBoulderAttempts[loggedUser];
        if (!usa) {
            setUserSavedAttempts({});
        } else {
            setUserSavedAttempts(usa);
        }
        scrollRef.current && scrollRef.current.scrollToTargetIndex(usa[id]);
    }
    , [loggedUser]);

    useEffect(() => {
        setIsFavourite(currentBoulder.favourite);
    }, [currentBoulder]);

    useEffect(() => {
        if (reload) {
            reloadBoulders();
            fetchSends();
            fetchCompletedChallenges();
            fetchBoulderHolds();
            setReload(false);
        }
    }, [reload]);

    useEffect(() => {
        if (currentHolds && currentChallenge.id == 7) {
            chooseRandomHold();
        } else {
            setRandomHold(null);
        }
    }
    , [currentChallenge, currentBoulder, currentHolds]);


    const chooseRandomHold = () => {
        let randomHoldIDs = [];
        currentHolds["false"].forEach((hold) => {
            if (hold.hold_type == 1 || hold.hold_type == 2) {
                randomHoldIDs.push(hold.hold_id);
            }
        });

        const randomIndex = Math.floor(Math.random() * randomHoldIDs.length);

        setRandomHold(randomHoldIDs[randomIndex]);
    }


    const toggleFavourite = () => {
        if (token === 'token') {
            alert('Pro přidání do oblíbených se musíte přihlásit');
            return;
        }
        const method = isFavourite ? 'DELETE' : 'POST';
        fetch(`${apiURL}/climbing/boulders/favourite/${id}`, {
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
        const response = await fetch(`${apiURL}/climbing/challenges/completed/${id}`, {
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
        } else if (response.status == 400) {
        } else if (response.status == 401) {
        } else {
            console.log("Server error");
        }
    }


    const fetchBoulderHolds = () => {
        fetch(`${apiURL}/climbing/boulders/holds/${id}`)
            .then(response => response.json())
            .then(jsonResponse => setCurrentHolds(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => setIsLoading(false));
    };

    const fetchSends = () => {
        fetch(`${apiURL}/climbing/boulders/sends/${id}`,
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
            .catch(error => console.log(error))
            .finally(() => setIsLoading(false));
    }

    const fetchComments = () => {
        fetch(`${apiURL}/climbing/boulders/comments/${id}`)
            .then(response => response.json())
            .then(jsonResponse => setComments(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => setIsLoading(false));
    }

    const sendComment = () => {
        fetch(`${apiURL}/climbing/boulders/comment/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                text: comment,
            }),
        })
            .then(response => response.text())
            .then(jsonResponse => console.log(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => {fetchComments(); setComment(''); setCommentModalVisible(false)});
    }


    const confirmCommentDelete = (commentId) => {
        Alert.alert("Vymazat komentář", "Opravdu chcete smazat tento komentář?",
            [
                {
                    text: "Ano",
                    onPress: () => deleteComment(commentId),
                },
                {
                    text: "Ne",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
            ]
        );
    }

    const deleteComment = (commentId) => {
        fetch(`${apiURL}/climbing/boulders/comment/${commentId}`, {
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


    const confirmSendDelete = (sendId) => {
        Alert.alert("Vymazat výlez", "Opravdu chcete smazat tento výlez?",
            [
                {
                    text: "Ano",
                    onPress: () => deleteSend(sendId),
                },
                {
                    text: "Ne",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
            ]
        );
    }


    const deleteSend = (sendId) => {
        fetch(`${apiURL}/climbing/boulders/send/${sendId}`, {
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

    const handleDeleteBoulder = () => {
        Alert.alert("Vymazat boulder", "Opravdu chcete smazat tento boulder?",
            [
                {
                    text: "Ano",
                    onPress: () => deleteBoulder(),
                },
                {
                    text: "Ne",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
            ]
        );
    }

    const deleteBoulder = () => {
        fetch(`${apiURL}/climbing/boulders/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(error => console.log(error))
    }

    const handleEditBoulder = () => {
        router.back();
        router.push(`edit_boulder`);
    }

    const createGradeString = () => {
        if (settings.grading == 0) {
            return `${gradeIdToGradeName(currentBoulder.average_grade, settings.grading)} (${gradeIdToGradeName(currentBoulder.average_grade, 1)})`;
        } else if (settings.grading == 1) {
            return `${gradeIdToGradeName(currentBoulder.average_grade, settings.grading)} (${gradeIdToGradeName(currentBoulder.average_grade, 0)})`;
        } else {
            return `${gradeIdToGradeName(currentBoulder.average_grade, settings.grading)} (${gradeIdToGradeName(currentBoulder.average_grade, 0)}) (${gradeIdToGradeName(currentBoulder.average_grade, 1)})`;
        }
    }

    const handlePreviousBoulder = () => {
        if (typeof arrowNavigationBoulders[currentBoulderIndex-1] === 'undefined') {
            return;
        }
        setCurrentBoulder(arrowNavigationBoulders[currentBoulderIndex-1]);
        setCurrentBoulderIndex(currentBoulderIndex-1);
        router.replace(`${arrowNavigationBoulders[currentBoulderIndex-1].id}`);
    }

    const handleNextBoulder = () => {
        if (typeof arrowNavigationBoulders[currentBoulderIndex+1] === 'undefined') {
            return;
        }
        setCurrentBoulder(arrowNavigationBoulders[currentBoulderIndex+1]);
        setCurrentBoulderIndex(currentBoulderIndex+1);
        router.replace(`${arrowNavigationBoulders[currentBoulderIndex+1].id}`);
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
                        comments.map((comment) => (
                            <TouchableOpacity key={comment.id} onPress={() => confirmCommentDelete(comment.id)}>
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
                        <View style={styles.row}>
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
                    sends.map((send) => (
                        <TouchableOpacity key={send.id} onPress={() => confirmSendDelete(send.id)}>
                            <View key={send.id} style={styles.sendContainer}>
                                <View style={styles.row}>
                                    <Text style={Fonts.h3}>
                                        {send.name}
                                    </Text>
                                    <Text style={Fonts.h3}>
                                        {gradeIdToGradeName(send.grade, settings.grading)}
                                    </Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={Fonts.small}>
                                        {new Date(send.sent_date).toLocaleDateString() + " " + new Date(send.sent_date).toLocaleTimeString()}
                                    </Text>
                                    {(send.challenge_id != 1) ? (
                                        <View style={styles.crownContainer}>
                                            <View>
                                                <FontAwesome5 name="crown" size={20} color='gold' />
                                            </View>
                                            <View style={{position: 'absolute'}}>
                                                <Text style={Fonts.small}>
                                                    {send.challenge_id}
                                                </Text>
                                            </View>
                                        </View>) : null }
                                </View>
                                <View style={styles.row}>
                                    <StarRating rating={send.rating} maxStars={5} size={20}/>
                                    <Text style={Fonts.h3}>
                                        {
                                            send.attempts === 0 ? (
                                                attemptIdToAttemptName(send.attempts)
                                            ) : (
                                                send.attempts <= 3 ? (
                                                    attemptIdToAttemptName(send.attempts) + " pokusy"
                                                ) : (
                                                    attemptIdToAttemptName(send.attempts) + " pokusů"
                                                )
                                            )
                                        }
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
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
                return (
                    completedChallenges["rest"].map((challenge) => (
                        <View key={challenge.challenge_id} style={styles.sendContainer}>
                            <View style={styles.row}>
                                <Text style={Fonts.h3}>
                                    {challenge.name}
                                </Text>
                                <Text style={Fonts.h3}>
                                    ID: {challenge.challenge_id}
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

    const renderTag = (item) => {
        const tag = tags.find(tag => tag.id === item);
        return (
            <View style={[styles.tag, {borderWidth: 2, borderColor: Colors.primary}]} key={tag.id}>
                <EmojiIcon emoji={tagIdToIconName(tag.id)} size={30} color={Colors.primary}/>
                <Text style={[Fonts.h3, {color: Colors.primary}]}>{tag.name}</Text>
            </View>
        )
    }

    return (
        currentHolds ? (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
                <ReactNativeZoomableView
                    ref={zoomableViewRef}
                    maxZoom={20}
                    minZoom={1}
                    initialZoom={1}
                    bindToBorders={true}
                    onZoomAfter={this.logOutZoomState}
                    disablePanOnInitialZoom={true}
                    onDoubleTapAfter={() => zoomableViewRef.current!.zoomTo(1)}
                    style={{flex: 1}}
                >
                    <View style={{maxHeight: maxHeight}}>
                    <ImageBackground style={isImageWider ? styles.backgroundImageWider : styles.backgroundImageHigher } source={{uri: `data:image/png;base64,${wallImage}`}}>
                        <Svg style={styles.svgContainer} height="100%" width="100%" viewBox="0 0 820.5611 1198.3861">
                            <Defs>
                                <G id="holds">
                                    {currentHolds["false"].map((hold) => (
                                        <Path
                                            key={hold.hold_id}
                                            fill={numberToFillColor(hold.hold_type)}
                                            stroke={numberToStrokeColor(hold.hold_type)}
                                            strokeWidth={settings.lineWidth}
                                            d={hold.path}
                                            strokeDasharray={hold.hold_id == randomHold ? "3,5" : ""}
                                        />
                                    ))}
                                </G>
                                <G id="volumes">
                                    {currentHolds['true'].map((hold) => (
                                        <Path
                                            key={hold.hold_id}
                                            fill={numberToFillColor(hold.hold_type)}
                                            stroke={numberToStrokeColor(hold.hold_type)}
                                            strokeWidth={settings.lineWidth}
                                            d={hold.path}
                                        />
                                    ))}
                                </G>
                                <ClipPath id="clip_holds">
                                    <Use href="#holds" />
                                </ClipPath>
                                <ClipPath id="clip_both">
                                    <Use href="#holds" />
                                    <Use href="#volumes" />
                                </ClipPath>
                                <Mask id="mask_both">
                                    <Rect x="0" y="0" width="100%" height="100%" fill="white" />
                                    <Rect x="0" y="0" width="100%" height="100%" fill="black" clipPath="url(#clip_both)" clipRule="nonzero" />
                                </Mask>
                                <Mask id="mask_holds">
                                    <Rect x="0" y="0" width="100%" height="100%" fill="white" />
                                    <Rect x="0" y="0" width="100%" height="100%" fill="black" clipPath="url(#clip_holds)" clipRule="nonzero" />
                                </Mask>
                                <Pattern id="hatch" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                                    <Line x1="0" y1="0" x2="0" y2="10" stroke="black" strokeWidth="5" />
                                </Pattern>
                            </Defs>
                            <Rect
                                x="0" y="0" width="100%" height="100%"
                                opacity={settings.darkenPreview ? settings.darkening : 0}
                                fill="black"
                                mask="url(#mask_both)"
                            />
                            <G mask="url(#mask_holds)">
                                <Use href="#volumes" />
                            </G>
                            <Use href="#holds" mask="url(#mask_holds)"/>
                        </Svg>
                    </ImageBackground>
                    </View>
                </ReactNativeZoomableView>
                <View style={styles.logRow}>
                    {   currentBoulderIndex === 0 ? null :
                        <FontAwesome name="arrow-left" size={40} color={Colors.primary} onPress={handlePreviousBoulder} />
                    }
                    <TouchableOpacity onPress={() => router.push(`sends/${id}`)} style={styles.logSendContainer}>
                        <View style={styles.logSendButton}>
                            <Text style={Fonts.h3}>
                                Log Send
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {
                        currentBoulderIndex === arrowNavigationBoulders.length-1 ? null :
                        <FontAwesome name="arrow-right" size={40} color={Colors.primary} onPress={handleNextBoulder} />
                    }
                </View>
                <View style={styles.details}>
                    <View style={styles.row}>
                        <Text style={[Fonts.h1, styles.boulderName]}>
                            {currentBoulder.name}
                        </Text>
                        <View style={{flexDirection: 'row'}}>
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
                            {
                                isFavourite ? (
                                    <TouchableOpacity onPress={toggleFavourite}>
                                        <FontAwesome name="heart" size={24} color="red" />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={toggleFavourite}>
                                        <FontAwesome name="heart-o" size={24} color="red" />
                                    </TouchableOpacity>
                                )
                            }
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.small}>
                            {new Date(currentBoulder.build_time).toLocaleDateString() + " " + new Date(currentBoulder.build_time).toLocaleTimeString()}
                        </Text>
                        <Text style={Fonts.plain}>
                            {currentBoulder.built_by}
                        </Text>
                    </View>
                    <Text style={Fonts.plain}>
                        {currentBoulder.description}
                    </Text>
                    {
                        currentChallenge ? (
                            currentChallenge.id === 1 ? null : (
                                <View style={[styles.row, {marginTop:20}]}>
                                    {
                                        completedChallenges ? (
                                            completedChallenges["ids"].includes(currentChallenge.id) ? (
                                                <FontAwesome5 name="crown" size={24} color='gold' />
                                            ) : (
                                                <FontAwesome5 name="crown" size={24} color={Colors.borderDark} />
                                            )
                                        ) : <FontAwesome5 name="crown" size={24} color={Colors.borderDark} />
                                    }
                                    <Text style={Fonts.plainBold}>
                                        {currentChallenge.name}
                                    </Text>
                                </View>
                            )
                        ) : null
                    }
                    <View style={styles.row}>
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
                    <View style={styles.row}>
                        <StarRating rating={currentBoulder.average_rating} maxStars={5} size={20}/>
                        {
                            calculateScoreScript ? (
                                currentBoulder.average_grade == -1 ? (
                                    <View style={styles.row}>

                                        <Text style={Fonts.h3}>?</Text>
                                    </View>
                                    ) : (
                                    <Text style={Fonts.h3}>
                                        {calculateScoreScript(currentBoulder.average_grade, 0, currentChallenge.score)}
                                    </Text>
                                )
                            ) : null
                        }
                        <Text style={Fonts.h3}>
                            {createGradeString()}
                        </Text>
                    </View>
                </View>
                {
                    currentBoulder.tags[0] &&
                    <View style={styles.tagsContainer}>
                        <View style={styles.tags}>
                            {
                                currentBoulder.tags.map(tag =>
                                    renderTag(tag))
                            }
                        </View>
                    </View>
                }
                {
                    userSavedAttempts &&
                    <View style={styles.picker}>
                        <Text style={Fonts.h3}>Zatím pokusů:</Text>
                        <ScrollPicker
                            ref={scrollRef}
                            dataSource={attemptsData}
                            selectedIndex={userSavedAttempts[id]}
                            wrapperHeight={75}
                            highlightColor={Colors.border}
                            highlightBorderWidth={2}
                            itemTextStyle={Fonts.h3}
                            activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                            onValueChange={(_, index) => {setUserSavedAttempts({...userSavedAttempts, [id]: index})}}
                        />
                    </View>
                }
                <View style={styles.sendComContainer}>
                    <TouchableOpacity onPress={() => setShow((show+1)%3)}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>
                                { tabNames[show] }
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <RenderSendsCommentsChallenges />
                </View>
                <View style={styles.twoButtons}>
                    <TouchableOpacity onPress={handleDeleteBoulder}>
                        <View style={styles.editButtons}>
                            <Text style={Fonts.h3}>Smazat</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleEditBoulder}>
                        <View style={styles.editButtons}>
                            <Text style={Fonts.h3}>Upravit</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={commentModalVisible}>
                <View style={[styles.container, {flex:1, paddingTop:120}]}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Napište komentář:"
                        value={comment}
                        onChangeText={setComment}
                        multiline={true}
                    />
                    <TouchableOpacity onPress={sendComment}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Odeslat</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Zavřít</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>)
        : (
            <SafeAreaView style={{flex: 1}}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        )
    );
}

const styles = StyleSheet.create({
    container: {
    },
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
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
    logRow: {
        flexDirection:"row",
        margin: 10
    },
    sendComContainer: {
        margin: 10,
        marginTop: 20,
    },
    commentsContainer: {
        marginTop: 10,
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
        marginBottom: 20,
    },
    logSendButton: {
        backgroundColor: Colors.primary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
    },
    logSendContainer: {
        flex: 1,
        marginLeft: 20,
        marginRight: 20,
    },
    details: {
        padding: 10,
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
    commentInput: {
        height: 200,
        borderColor: Colors.borderDark,
        borderWidth: 2,
        marginBottom: 20,
        padding: 10,
        multiline: true,
        textAlignVertical: 'top',
    },
    crownContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButtons: {
        backgroundColor: Colors.highlight,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 15,
        marginRight: 20,
        marginLeft: 20,
    },
    tagsContainer: {
        padding: 10,
        gap: 15,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
    },
    picker: {
        paddingHorizontal: 15,
        gap: 10,
    },
});
