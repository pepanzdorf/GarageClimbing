import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Image, ImageBackground, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../../context';
import { Svg, Circle, Image as SvgImage, Path } from 'react-native-svg'


export default function DetailsScreen() {
    const { id } = useLocalSearchParams();
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const { wallImage } = useContext(GlobalStateContext);

    useEffect(() => {
        fetchBoulderDetail();
    }, [id]);

    const fetchBoulderDetail = () => {
        fetch(`http://192.168.1.113:5000/climbing/boulders/${id}`)
            .then(response => response.json())
            .then(jsonResponse => setDetails(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => setIsLoading(false))
    };


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
                </View>
                <View style={styles.smallImageContainer}>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Image style={styles.image} source={{uri: `data:image/png;base64,${wallImage}`}}/>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal visible={modalVisible}>
                <View style={{flex:1}}>
                    <View style={{margin:10,padding:10,alignItems:'center'}}>
                        <Text style={{fontWeight:'bold',fontSize:24}}>{details ? details.name : 'Loading...'}</Text>
                    </View>
                    <ReactNativeZoomableView
                        maxZoom={20}
                        minZoom={1}
                        zoomStep={0.5}
                        initialZoom={1}
                        bindToBorders={true}
                        onZoomAfter={this.logOutZoomState}
                        style={{
                            flex: 1,
                        }}
                    >
                    <ImageBackground style={styles.backgroundImage} source={{uri: `data:image/png;base64,${wallImage}`}}>
                    <Svg style={styles.svgContainer} height="100%" width="100%" viewBox="0 0 793.75 1058.3334" transform="translate(285,355)">
                        <Path
                               fill="none" stroke="#ff0000" strokeWidth="5"
                               d="m 64.178039,35.493115 c -7.05803,-4.558878 -11.713227,-10.569354 -11.620767,-19.447981 -0.853867,-12.3272404 3.513157,-15.45988087 7.558541,-19.1589662 14.915267,-0.6216478 25.141386,4.7463091 26.777754,21.0862432 -1.845131,7.737702 -7.008564,14.375928 -22.715528,17.520704 z"
                        />
                    </Svg>
                    </ImageBackground>
                    </ReactNativeZoomableView>
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
        flex: 1,
        borderWidth: 0.5,
    },
    image: {
        resizeMode:'contain',
        width: '100%',
        height: '100%',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    svgContainer: {

    }

});
