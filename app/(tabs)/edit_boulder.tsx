import React, { useEffect, useState, useContext } from 'react';
import { Alert, View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, ImageBackground, ScrollView, Dimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../context';
import { Svg, Path, Rect, ClipPath, Defs, G, Use, Mask, Pattern, Line } from 'react-native-svg'
import { apiURL } from '../../constants/Other';
import { StarRating } from '../../components/StarRating';
import { gradeIdToGradeName, attemptIdToAttemptName, numberToStrokeColor, numberToFillColor } from '../../scripts/utils';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';



export default function EditBoulder(){
    const { token, settings, holds, wallImage, currentBoulder, currentHolds, setReload } = useContext(GlobalStateContext);
    const windowAspectRatio = Dimensions.get('window').width / Dimensions.get('window').height;
    const tabBarHeight = useBottomTabBarHeight();
    const maxHeight = Dimensions.get('window').height - tabBarHeight*3;
    const imageAspectRatio = 820.5611 / 1198.3861;
    const isImageWider = windowAspectRatio < imageAspectRatio;
    const zoomableViewRef = React.createRef<ReactNativeZoomableView>();
    const [colorsHolds, setColorsHolds] = useState();
    const [colorsVolumes, setColorsVolumes] = useState();
    const [selectedColor, setSelectedColor] = useState(0);
    const [boulderName, setBoulderName] = useState('');
    const [boulderDescription, setBoulderDescription] = useState('');
    const router = useRouter();
    const isFocused = useIsFocused();

    const handleColorChange = (index, isVolume) => {
        if (isVolume) {
            setColorsVolumes(colorsVolumes.map((color, i) => i === index ? selectedColor : color));
        } else {
            setColorsHolds(colorsHolds.map((color, i) => i === index ? selectedColor : color));
        }
    }

    const handleCancel = () => {
        setColorsHolds(null);
        setColorsVolumes(null);
        setBoulderName('');
        setBoulderDescription('');
    }

    const convertToListOfHolds = () => {
        const holdsList = [];
        for (let i = 0; i < colorsHolds.length; i++) {
            if (colorsHolds[i] !== -1) {
                holdsList.push({id: holds["false"][i].id, type: colorsHolds[i]});
            }
        }
        for (let i = 0; i < colorsVolumes.length; i++) {
            if (colorsVolumes[i] !== -1) {
                holdsList.push({id: holds["true"][i].id, type: colorsVolumes[i]});
            }
        }
        return holdsList;
    }

    const handleSave = async () => {
        if (boulderName === '') {
            alert('Vyplňte jméno boulderu');
            return;
        }
        const boulder = {
            name: boulderName,
            description: boulderDescription,
            holds: convertToListOfHolds(),
            edit: true,
            bid: currentBoulder.id,
        }
        try {
            const response = await fetch(`${apiURL}/climbing/boulder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(boulder),
            });
            if (response.ok) {
                alert('Boulder byl úspěšně upraven');
                handleCancel();
                setReload(true);
                router.back();
            } else {
                alert(await response.text());
            }
        } catch (error) {
            alert('Server error');
        }
    }


    useEffect(() => {
        handleCancel();
        if (holds) {
            setBoulderName(currentBoulder.name);
            setBoulderDescription(currentBoulder.description);
            const holdsArray = Array.from({length: holds["false"].length}, () => -1);
            const volumesArray = Array.from({length: holds["true"].length}, () => -1);

            currentHolds['false'].forEach(hold => {
                for (let i = 0; i < holds["false"].length; i++) {
                    if (holds["false"][i].id === hold.hold_id) {
                        holdsArray[i] = hold.hold_type;
                    }
                }
            });

            currentHolds['true'].forEach(hold => {
                for (let i = 0; i < holds["true"].length; i++) {
                    if (holds["true"][i].id === hold.hold_id) {
                        volumesArray[i] = hold.hold_type;
                    }
                }
            });
            setColorsHolds(holdsArray);
            setColorsVolumes(volumesArray);
        }
    }, [currentBoulder, isFocused]);

    return (
        <SafeAreaView style={{flex: 1}}>
            {
                holds && colorsHolds && colorsVolumes ? (
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
                                        {holds["false"].map((hold, index) => (
                                            <Path
                                                key={hold.id}
                                                fill={numberToFillColor(colorsHolds[index])}
                                                stroke={numberToStrokeColor(colorsHolds[index])}
                                                strokeWidth={colorsHolds[index] === -1 ? 2 : settings.lineWidth}
                                                d={hold.path}
                                                onPress={() => handleColorChange(index, false)}
                                            />
                                        ))}
                                    </G>
                                    <G id="volumes">
                                        {holds['true'].map((hold, index) => (
                                            <Path
                                                key={hold.id}
                                                fill={numberToFillColor(colorsVolumes[index])}
                                                stroke={numberToStrokeColor(colorsVolumes[index])}
                                                strokeWidth={colorsVolumes[index] === -1 ? 2 : settings.lineWidth}
                                                d={hold.path}
                                                onPress={() => handleColorChange(index, true)}
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
                <View style={styles.details}>
                    <View style={[styles.row, {paddingLeft: 25, paddingRight: 25}]}>
                        <TouchableOpacity onPress={() => setSelectedColor(-1)}>
                            {
                                selectedColor === -1 ?
                                <View style={styles.iconContainer}>
                                    <FontAwesome name="ban" size={36} color='black' />
                                </View> :
                                <FontAwesome name="ban" size={36} color='black' />
                            }
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedColor(0)}>
                            {
                                selectedColor === 0 ?
                                <View style={styles.iconContainer}>
                                    <FontAwesome name="circle" size={36} color={numberToStrokeColor(0)} />
                                </View> :
                                <FontAwesome name="circle" size={36} color={numberToStrokeColor(0)} />
                            }
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedColor(1)}>
                            {
                                selectedColor === 1 ?
                                <View style={styles.iconContainer}>
                                    <FontAwesome name="circle" size={36} color={numberToStrokeColor(1)} />
                                </View> :
                                <FontAwesome name="circle" size={36} color={numberToStrokeColor(1)} />
                            }
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedColor(2)}>
                            {
                                selectedColor === 2 ?
                                <View style={styles.iconContainer}>
                                    <FontAwesome name="circle" size={36} color={numberToStrokeColor(2)} />
                                </View> :
                                <FontAwesome name="circle" size={36} color={numberToStrokeColor(2)} />
                            }
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedColor(3)}>
                            {
                                selectedColor === 3 ?
                                <View style={styles.iconContainer}>
                                    <FontAwesome name="circle" size={36} color={numberToStrokeColor(3)} />
                                </View> :
                                <FontAwesome name="circle" size={36} color={numberToStrokeColor(3)} />
                            }
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedColor(4)}>
                            {
                                selectedColor === 4 ?
                                <View style={styles.iconContainer}>
                                    <FontAwesome6 name="circle-half-stroke" size={36} color={numberToFillColor(4)} />
                                </View> :
                                <FontAwesome6 name="circle-half-stroke" size={36} color={numberToFillColor(4)} />
                            }
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Jméno"
                        value={boulderName}
                        onChangeText={setBoulderName}
                    />
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Popisek"
                        multiline={true}
                        value={boulderDescription}
                        onChangeText={setBoulderDescription}
                    />
                </View>
                <TouchableOpacity onPress={handleSave}>
                    <View style={styles.button}>
                        <Text style={Fonts.h3}>Uložit</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {handleCancel();router.back()}}>
                    <View style={styles.button}>
                        <Text style={Fonts.h3}>Zrušit</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
            ) : (
                <ActivityIndicator size="large" color={Colors.primary} />
            )}
        </SafeAreaView>
    );
};

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
        padding: 10,
        multiline: true,
        textAlignVertical: 'top',
        margin: 15,
        marginTop: 0,
    },
    crownContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        height: 50,
        borderColor: Colors.borderDark,
        borderWidth: 2,
        padding: 10,
        margin: 15,
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
        borderRadius: 15,
        borderWidth: 4,
        borderColor: Colors.primary,
    },
});
