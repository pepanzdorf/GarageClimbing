import React, { useEffect, useState, useContext } from 'react';
import { Alert, View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, ImageBackground, ScrollView, Dimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../context';
import { Svg, Path, Rect, ClipPath, Defs, G, Use } from 'react-native-svg'
import { apiURL } from '../../../constants/Other';
import { StarRating } from '../../../components/StarRating';
import { gradeIdToGradeName, attemptIdToAttemptName, numberToColor } from '../../../scripts/utils';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { FontAwesome } from '@expo/vector-icons';

export default function DetailsScreen() {
    const { id } = useLocalSearchParams();
    const { wallImage, settings, token, currentBoulder, reload, reloadBoulders } = useContext(GlobalStateContext);
    const [holds, setHolds] = useState([]);
    const [sends, setSends] = useState([]);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [isFavourite, setIsFavourite] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const windowAspectRatio = Dimensions.get('window').width / Dimensions.get('window').height;
    const imageAspectRatio = 793.75 / 1058.3334;
    const isImageWider = windowAspectRatio < imageAspectRatio;
    const router = useRouter();

    useEffect(() => {
        setIsLoading(true);
        fetchBoulderHolds();
        fetchSends();
        fetchComments();
    }, [id]);

    useEffect(() => {
        setIsFavourite(currentBoulder.favourite);
    }, [currentBoulder]);

    useEffect(() => {
        if (reload) {
            reloadBoulders();
            fetchSends();
        }
    }, [reload]);

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


    const fetchBoulderHolds = () => {
        fetch(`${apiURL}/climbing/boulders/holds/${id}`)
            .then(response => response.json())
            .then(jsonResponse => setHolds(jsonResponse))
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


    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <ImageBackground style={styles.backgroundImagePreview} source={{uri: `data:image/png;base64,${wallImage}`}}>
                        <Svg style={styles.svgContainer} height="100%" width="100%" viewBox="0 0 793.75 1058.3334">
                            <Defs>
                                <G id="all_paths">
                                    {holds.map((hold) => (
                                      <Path
                                        key={hold.hold_id}
                                        fill="none"
                                        stroke={numberToColor(hold.hold_type)}
                                        strokeWidth="5"
                                        d={hold.path}
                                      />
                                    ))}
                                </G>
                            </Defs>
                            <G clipPath="url(#clip)">
                                <Rect
                                    x="0" y="0" width="793.75" height="1058.3334"
                                    opacity={settings.darkenPreview ? settings.darkening : 0}
                                    fill="black"
                                />
                            </G>
                            <ClipPath id="clip">
                                <Rect x="0" y="0" width="793.75" height="1058.3334" fill="white" />
                                <Use href="#all_paths" />
                            </ClipPath>
                            <Use href="#all_paths" />
                        </Svg>
                    </ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(`sends/${id}`)}>
                    <View style={styles.button}>
                        <Text style={Fonts.h3}>
                            Log Send
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.details}>
                    <View style={styles.row}>
                        <Text style={[Fonts.h1, styles.boulderName]}>
                            {currentBoulder.name}
                        </Text>
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
                    <Text style={Fonts.plain}>
                        {currentBoulder.description}
                    </Text>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            Hodnocení:
                        </Text>
                        <Text style={Fonts.h3}>
                            Obtížnost:
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <StarRating rating={currentBoulder.average_rating} maxStars={5} size={20}/>
                        <Text style={Fonts.plain}>
                            {gradeIdToGradeName(currentBoulder.average_grade)}
                        </Text>
                    </View>
                </View>
                <View style={styles.sendComContainer}>
                    <TouchableOpacity onPress={() => setShowComments(!showComments)}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>
                                { showComments ? "Zobrazit výlezy" : "Zobrazit komentáře"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {
                        showComments ? (
                            comments.length > 0 ? (
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
                            ) : (
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
                        ) : (
                            sends.length > 0 ? (
                                sends.map((send) => (
                                    <TouchableOpacity key={send.id} onPress={() => confirmSendDelete(send.id)}>
                                        <View key={send.id} style={styles.sendContainer}>
                                            <View style={styles.row}>
                                                <Text style={Fonts.h3}>
                                                    {send.name}
                                                </Text>
                                                <Text style={Fonts.h3}>
                                                    {gradeIdToGradeName(send.grade)}
                                                </Text>
                                            </View>
                                            <Text style={Fonts.small}>
                                                {new Date(send.sent_date).toLocaleDateString() + " " + new Date(send.sent_date).toLocaleTimeString()}
                                            </Text>
                                            <View style={styles.row}>
                                                <StarRating rating={send.rating} maxStars={5} size={20}/>
                                                <Text style={Fonts.h3}>
                                                    {
                                                        send.attempts === 1 ? (
                                                            attemptIdToAttemptName(send.attempts) + " pokusů"
                                                        ) : (
                                                            attemptIdToAttemptName(send.attempts)
                                                        )
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={Fonts.h3}>
                                    Ještě nevylezeno
                                </Text>
                            )
                        )
                    }
                </View>
            </ScrollView>

            <Modal visible={modalVisible}>
                    <ReactNativeZoomableView
                        maxZoom={20}
                        minZoom={1}
                        zoomStep={0.5}
                        initialZoom={1}
                        bindToBorders={true}
                        onZoomAfter={this.logOutZoomState}
                        style={{flex: 1}}
                    >
                        <ImageBackground style={isImageWider ? styles.backgroundImageWider : styles.backgroundImageHigher } source={{uri: `data:image/png;base64,${wallImage}`}}>
                            <Svg style={styles.svgContainer} height="100%" width="100%" viewBox="0 0 793.75 1058.3334">
                                <Defs>
                                    <G id="all_paths">
                                        {holds.map((hold) => (
                                          <Path
                                            key={hold.hold_id}
                                            fill="none"
                                            stroke={numberToColor(hold.hold_type)}
                                            strokeWidth="5"
                                            d={hold.path}
                                          />
                                        ))}
                                    </G>
                                </Defs>
                                <G clipPath="url(#clip)">
                                    <Rect
                                        x="0" y="0" width="793.75" height="1058.3334"
                                        opacity={settings.darkening}
                                        fill="black"
                                    />
                                </G>
                                <ClipPath id="clip">
                                    <Rect x="0" y="0" width="793.75" height="1058.3334" fill="white" />
                                    <Use href="#all_paths" />
                                </ClipPath>
                                <Use href="#all_paths" />
                            </Svg>
                        </ImageBackground>
                    </ReactNativeZoomableView>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>
                                Zavřít
                            </Text>
                        </View>
                    </TouchableOpacity>
            </Modal>

            <Modal visible={commentModalVisible}>
                <View style={[styles.container, {flex:1, paddingTop:120}]}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Napište komentář:"
                        value={comment}
                        onChangeText={setComment}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    backgroundImageHigher: {
        resizeMode:'contain',
        width: undefined,
        height: '100%',
        aspectRatio: 793.75 / 1058.3334,
    },
    backgroundImageWider: {
        resizeMode:'contain',
        width: '100%',
        height: undefined,
        aspectRatio: 793.75 / 1058.3334,
    },
    backgroundImagePreview: {
        resizeMode:'contain',
        width: '100%',
        height: undefined,
        aspectRatio: 793.75 / 1058.3334,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
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
    details: {
        padding: 10,
        gap: 5,
    },
    sendContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.borderDarker,
        borderRadius: 10,
        marginBottom: 8,
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
});
