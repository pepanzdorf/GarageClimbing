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
    const [seasonalModal, setSeasonalModal] = useState(false)
    const [chosenSeason, setChosenSeason] = useState(null)


    const chooseBackground = () => {
        const backgrounds = [
            require('../../../assets/images/blank.png'),
            require('../../../assets/images/bronze.png'),
            require('../../../assets/images/gold.png'),
            require('../../../assets/images/emerald.png'),
            require('../../../assets/images/diamond.png'),
        ];
        if (!userStats) {
            setChosenBackground(backgrounds[0]);
            return;
        }
        if (userStats['score'] < 100) {
            setChosenBackground(backgrounds[0]);
        }
        if (userStats['score'] >= 100 && userStats['score'] < 1000) {
            setChosenBackground(backgrounds[1]);
        }
        if (userStats['score'] >= 1000 && userStats['score'] < 5000) {
            setChosenBackground(backgrounds[2]);
        }
        if (userStats['score'] >= 5000 && userStats['score'] < 10000) {
            setChosenBackground(backgrounds[3]);
        }
        if (userStats['score'] >= 10000) {
            setChosenBackground(backgrounds[4]);
        }
    }

    const scoreColor = (score) => {
        if (score < 100) return 'gray';
        if (score >= 100 && score < 1000) return '#CD7F32';
        if (score >= 1000 && score < 5000) return 'gold';
        if (score >= 5000 && score < 10000) return 'green';
        if (score >= 10000) return 'blue';
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
                    <View style={{flex:1}}>
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
                                    <View style={{flexDirection:"row", flexWrap: 'wrap'}}>
                                        {
                                            userStats['previous_seasons'] &&
                                            Object.keys(userStats['previous_seasons']).map((key) => {
                                                return (
                                                    <TouchableOpacity key={key} onPress={() => {setChosenSeason(key); setSeasonalModal(true)}}>
                                                        <View style={styles.awardContainer}>
                                                            <View>
                                                                <FontAwesome5 name="trophy" size={40} color={scoreColor(userStats['previous_seasons'][key]['score'])} />
                                                            </View>
                                                            <View style={{position: 'absolute', top: 2}}>
                                                                <Text style={Fonts.plainBold}>
                                                                    {key.split(' ')[0]}
                                                                </Text>
                                                            </View>
                                                            <View style={{position: 'absolute', top: 16}}>
                                                                <Text style={Fonts.plainBold}>
                                                                    {key.split(' ')[1]}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
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
                    <Modal visible={seasonalModal}>
                        {
                            chosenSeason &&
                            <View style={{flex:1, marginTop: 30, marginBottom: 30}}>
                                <ScrollView style={{flex:1, marginLeft: 20, marginRight: 20}}>
                                    <View style={{alignItems: 'center', gap:10, marginBottom: 20}}>
                                        <Text style={Fonts.h1}>Sezóna: {chosenSeason}</Text>
                                        <Text style={Fonts.h3}>Skóre: {userStats['previous_seasons'][chosenSeason]['score']}</Text>
                                    </View>
                                    <View style={{gap: 5}}>
                                        {
                                            Object.keys(userStats['previous_seasons'][chosenSeason]['unique_sends']).map((key) => {
                                                return (
                                                    <View key={key} style={styles.boulderStatsContainer}>
                                                        <Text style={Fonts.h3}>{gradeIdToGradeName(key, settings.grading)}</Text>
                                                        <View style={styles.row}>
                                                            <Text style={Fonts.plainBold}>Výlezů:</Text>
                                                            <Text style={Fonts.plainBold}>{userStats['previous_seasons'][chosenSeason]['unique_sends'][key]['sends']}</Text>
                                                            <Text style={Fonts.plainBold}>Z toho flashů:</Text>
                                                            <Text style={Fonts.plainBold}>{userStats['previous_seasons'][chosenSeason]['unique_sends'][key]['flashes']}</Text>
                                                        </View>
                                                    </View>
                                                )
                                            }
                                            )
                                        }
                                    </View>
                                </ScrollView>
                                <TouchableOpacity onPress={() => setSeasonalModal(false)}>
                                    <View style={styles.button}>
                                        <Text style={Fonts.h3}>Zavřít</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        }
                    </Modal>
                </View>
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
    button: {
         backgroundColor: Colors.primary,
         padding: 10,
         alignItems: 'center',
         borderWidth: 1,
         borderRadius: 10,
         marginTop: 15,
         marginRight: 20,
         marginLeft: 20,
     },
});