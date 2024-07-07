import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Image, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function DetailsScreen() {
    const { id } = useLocalSearchParams();
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [wallImage, setWallImage] = useState(null);

    useEffect(() => {
        fetchBoulderDetail();
        fetchBoulderingWallImage();
    }, [id]);

    const fetchBoulderDetail = () => {
        fetch(`http://192.168.1.113:5000/climbing/boulders/${id}`)
            .then(response => response.json())
            .then(jsonResponse => setDetails(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => setIsLoading(false))
    };

    const fetchBoulderingWallImage = () => {
        fetch("http://192.168.1.113:5000/climbing/wall")
            .then(response => response.text())
            .then(textResponse => setWallImage(textResponse))
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
                >
                    <Image style={styles.image} source={{uri: `data:image/png;base64,${wallImage}`}}/>
                </ReactNativeZoomableView>
                <Button title="Zavřít" onPress={() => setModalVisible(false)} />
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
});
