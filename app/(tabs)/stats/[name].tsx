import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView,Button, FlatList, ImageBackground, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { apiURL } from '../../../constants/Other';
import { gradeIdToGradeName, gradeToColor } from '../../../scripts/utils';


export default function LogScreen() {
    const { name } = useLocalSearchParams();
    const { stats, settings } = useContext(GlobalStateContext);
    const router = useRouter();
    const [userStats, setUserStats] = useState(null)
    const [chosenBackground, setChosenBackground] = useState(null)


    const chooseBackground = () => {
        const backgrounds = [
            require('../../../assets/images/blank.png'),
            require('../../../assets/images/bronze.png'),
            require('../../../assets/images/gold.png'),
            require('../../../assets/images/diamond.png'),
        ];
        if (!userStats) {
            setChosenBackground(backgrounds[0]);
            return;
        }
        if (userStats['score'] < 100) {
            setChosenBackground(backgrounds[0]);
        }
        if (userStats['score'] >= 100 && userStats['score'] < 500) {
            setChosenBackground(backgrounds[1]);
        }
        if (userStats['score'] >= 500 && userStats['score'] < 5000) {
            setChosenBackground(backgrounds[2]);
        }
        if (userStats['score'] >= 5000) {
            setChosenBackground(backgrounds[3]);
        }
    }


    const thisUserStats = () => {
        if (stats) {
            stats.forEach((item) => {
                if (item[0] == name) {
                    setUserStats(item[1]);
                }
            });
        }
    }

    useEffect(() => {
        thisUserStats();
        chooseBackground();
    }
    , [stats, name]);

    useEffect(() => {
        chooseBackground();
    }
    , [userStats]);


    return (
        <SafeAreaView style={styles.container}>
            {
                userStats && (
                    <ImageBackground source={chosenBackground} style={{width: '100%', height: '100%'}} imageStyle={styles.imageStyle}>
                        <View style={styles.userStats}>
                            <ScrollView>
                                <View style={styles.header}>
                                    <Text style={Fonts.h1}>{name}</Text>
                                </View>
                                {
                                    userStats['icon'] &&
                                    <View style={{alignItems: 'center'}}>
                                        <Image source={{uri: apiURL + userStats['icon']}} style={{width: 200, height: 200}} />
                                    </View>
                                }
                                {
                                    userStats['user_description'] &&
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={Fonts.plainBold}>{userStats['user_description']}</Text>
                                    </View>
                                }
                                <View style={styles.genericStats}>
                                    <Text style={Fonts.h3}>Skóre:</Text>
                                    <Text style={Fonts.plainBold}>{userStats['score']}</Text>
                                    <Text style={Fonts.h3}>Počet výlezů (i duplicitní):</Text>
                                    <Text style={Fonts.plainBold}>{userStats['all_sends']}</Text>
                                    <Text style={Fonts.h3}>Splněných výzev (unikátní):</Text>
                                    <Text style={Fonts.plainBold}>{userStats['challenges']}</Text>
                                    <View style={{flexDirection:"row", flexWrap: 'wrap'}}>
                                        {
                                            userStats['completed_grades'].map((value) => {
                                                return (
                                                    <View style={styles.awardContainer} key={value}>
                                                        <View>
                                                            <FontAwesome5 name="award" size={40} color={gradeToColor(value)} />
                                                        </View>
                                                        <View style={{position: 'absolute', top: 4}}>
                                                            <Text style={Fonts.plainBold}>
                                                                V{value}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )
                                            })
                                        }
                                    </View>
                                </View>
                                <View style={{gap: 5}}>
                                    {
                                        Object.keys(userStats['unique_sends']).map((key) => {
                                            return (
                                                <View key={key} style={styles.boulderStatsContainer}>
                                                    <Text style={Fonts.h3}>{gradeIdToGradeName(key, settings.grading)}</Text>
                                                    <View style={styles.row}>
                                                        <Text style={Fonts.plainBold}>Výlezů:</Text>
                                                        <Text style={Fonts.plainBold}>{userStats['unique_sends'][key]['sends']}</Text>
                                                        <Text style={Fonts.plainBold}>Z toho flashů:</Text>
                                                        <Text style={Fonts.plainBold}>{userStats['unique_sends'][key]['flashes']}</Text>
                                                    </View>
                                                </View>
                                            )
                                        }
                                        )
                                    }
                                </View>
                            </ScrollView>
                        </View>
                    </ImageBackground>
                )
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    userStats: {
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
        flex: 1,
        padding: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
        paddingBottom: 10,
        marginBottom: 20,
    },
    boulderStatsContainer: {
        padding: 10,
        gap: 10,
        backgroundColor: Colors.primary,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    genericStats: {
        gap: 10,
        marginBottom: 20,
        padding: 10,
    },
    awardContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageStyle: {
        borderRadius: 25,
        resizeMode: 'repeat',
    },
});