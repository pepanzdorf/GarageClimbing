import React, { useEffect, useState, useContext } from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Image, ImageBackground, Button, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../context';
import { Svg, Circle, Image as SvgImage, Path, Rect, Mask, ClipPath, Defs, G, Use } from 'react-native-svg'
import { apiURL } from '../../../constants/Other';
import { StarRating } from '../../../components/StarRating';
import { gradeIdToGradeName, sortBoulderBy, filterBoulders, filterBySearch } from '../../../scripts/utils';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'

export default function DetailsScreen() {
    const { id } = useLocalSearchParams();
    const [holds, setHolds] = useState([]);
    const [sends, setSends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const { wallImage, settings, token, currentBoulder } = useContext(GlobalStateContext);
    const router = useRouter();
    const windowAspectRatio = Dimensions.get('window').width / Dimensions.get('window').height;
    const imageAspectRatio = 793.75 / 1058.3334;
    const isImageWider = windowAspectRatio < imageAspectRatio;

    useEffect(() => {
        setIsLoading(true);
        fetchBoulderHolds();
    }, [id]);

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

    const renderSend = ({item}) => {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 10}}>
                <Text style={{color:"black",fontSize:16}}>
                    {item.date}
                </Text>
                <StarRating rating={item.rating} maxStars={5} size={20}/>
            </View>
        );
    }


    useEffect(() => {
        fetchSends();
    }, [id]);


    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.smallImageContainer}>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <ImageBackground style={styles.backgroundImage} source={{uri: `data:image/png;base64,${wallImage}`}}>
                            <Svg style={styles.svgContainer} height="100%" width="100%" viewBox="0 0 793.75 1058.3334">
                                <Defs>
                                    <G id="all_paths">
                                        {holds.map((hold) => (
                                          <Path
                                            key={hold.hold_id}
                                            onPress={() => handlePress(hold.id)}
                                            fill="none"
                                            stroke="#ff0000"
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
                </View>
                <View style={{margin:10,borderWidth:0.5,padding:10}}>
                    <TouchableOpacity onPress={() => router.push(`sends/${id}`)}>
                        <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                            Log Send
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{margin:10, padding:10, gap:5}}>
                    <Text style={Fonts.h1}>
                        {currentBoulder.name}
                    </Text>
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
                <View style={styles.sends}>
                    {
                        sends.length > 0 ? (
                            sends.map((send) => (
                                <View key={send.id} style={{borderWidth:0.5,padding:10}}>
                                    <Text style={{color:"black",fontSize:16}}>
                                        {new Date(send.sent_date).toLocaleDateString() + " " + new Date(send.sent_date).toLocaleTimeString()}
                                    </Text>
                                    <StarRating rating={send.rating} maxStars={5} size={20}/>
                                </View>
                            ))
                        ) : (
                            <Text style={{color:"black",fontSize:16}}>
                                No sends yet
                            </Text>
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
                                            onPress={() => handlePress(hold.hold_id)}
                                            fill="none"
                                            stroke="#ff0000"
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
                    <View>
                        <Button title="Zavřít" onPress={() => setModalVisible(false)} />
                    </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    smallImageContainer: {
        borderWidth: 0.5,
    },
    image: {
        resizeMode:'contain',
        width: '100%',
        height: '100%',
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
    backgroundImage: {
        resizeMode:'contain',
        width: '100%',
        height: undefined,
        aspectRatio: 793.75 / 1058.3334,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
    sends: {
        margin: 10,
        padding: 10,
        borderWidth: 0.5,
    },
});
