import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Image, ImageBackground, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../context';
import { Svg, Circle, Image as SvgImage, Path, Rect, Mask, ClipPath, Defs, G, Use } from 'react-native-svg'


export default function DetailsScreen() {
    const { id } = useLocalSearchParams();
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const { wallImage, holds } = useContext(GlobalStateContext);

    useEffect(() => {
        fetchBoulderDetail();
    }, [id]);

    const fetchBoulderDetail = () => {
        fetch(`http://192.168.1.113:5000/climbing/boulders/detail/${id}`)
            .then(response => response.json())
            .then(jsonResponse => setDetails(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => setIsLoading(false));
    };

    const numberToColor = (num) => {
        switch(num){
            case 0:
                return "red";
            case 1:
                return "blue";
            case 2:
                return "green";
            case 3:
                return "yellow";
        }
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <View style={{margin:10,borderWidth:0.5,padding:10}}>
                    <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                        Boulder details
                    </Text>
                    <Text style={{color:"black",fontSize:16}}>
                        {details ? details.name : 'Loading...'}
                    </Text>
                    <Text style={{color:"black",fontSize:16}}>
                        {details ? new Date(details.build_time).toLocaleString(): 'Loading...'}
                    </Text>
                </View>
                <View style={styles.smallImageContainer}>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <ImageBackground style={styles.backgroundImage} source={{uri: `data:image/png;base64,${wallImage}`}}>
                            <Svg style={styles.svgContainer} height="100%" width="100%" viewBox="0 0 793.75 1058.3334">
                                {details ? (details.map((hold) => (
                                    <Path
                                        key={hold.hold_id}
                                        onPress={() => handlePress(hold.hold_id)}
                                        fill="none"
                                        strokeWidth="5"
                                        stroke={numberToColor(hold.hold_type)}
                                        d={hold.path}
                                    />
                                ))): null}
                            </Svg>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>
            </View>
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
                        <ImageBackground style={styles.backgroundImage} source={{uri: `data:image/png;base64,${wallImage}`}}>
                            <Svg style={styles.svgContainer} height="100%" width="100%" viewBox="0 0 793.75 1058.3334">
                                <Defs>
                                    <G id="all_paths">
                                        {holds.map((hold) => (
                                          <Path
                                            key={hold.id}
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
                                    opacity="0.4"
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
        flex: 1,
    },
    smallImageContainer: {
        borderWidth: 0.5,
    },
    image: {
        resizeMode:'contain',
        width: '100%',
        height: '100%',
    },
    backgroundImage: {
        resizeMode:'contain',
        width: '100%',
        height: undefined,
        aspectRatio: 793.75 / 1058.3334,
    },
    svgContainer: {

    }
});
