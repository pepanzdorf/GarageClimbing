import { useContext, useState, useEffect, useLayoutEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView,Button, FlatList, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { apiURL } from '../../../constants/Other';
import { gradeIdToGradeName } from '../../../scripts/utils';


export default function Stats(){
    const { token, settings, loggedUser, stats, setStats, fetchUserStats } = useContext(GlobalStateContext);
    const router = useRouter();
    const [viewWidth, setViewWidth] = useState(0);

    const imageAspectRatio = 0.21666666;
    const imageBorderOnlyAspectRatio = 0.1666666;
    const iconSizeRatio = 0.1;
    const trophies = {
        '2024-2':  {
                1: require('../../../assets/images/trophies/trophy_2024-2_1.png'),
                2: require('../../../assets/images/trophies/trophy_2024-2_2.png'),
                3: require('../../../assets/images/trophies/trophy_2024-2_3.png'),
        }
    }

    const renderUser = ({item, index}) => {
        let bc = Colors.primary;
        if (index == 0) {
            bc = Colors.first;
        } else if (index == 1) {
            bc = Colors.second;
        } else if (index == 2) {
            bc = Colors.third;
        }

        return (
                <TouchableOpacity onPress={() => router.push(`stats/${item[0]}`)}>
                    <View style={[styles.userContainer, {width: viewWidth, height: viewWidth * imageAspectRatio}]}>
                        <View style={[styles.userDetailsContainer, {backgroundColor: bc, width: viewWidth, height: viewWidth * imageBorderOnlyAspectRatio}]}>
                            <View style={styles.row}>
                                <View style={[styles.row, {flex: 5, marginRight: 20}]}>
                                    <Text style={Fonts.h2}>{index+1}. {item[0]}</Text>
                                    <Text style={Fonts.h2}>{item[1]['sum_flashes']}/{item[1]['sum_sends']}</Text>
                                </View>
                                <View style={{flex: 2, flexDirection: 'row-reverse'}}>
                                    <Text style={Fonts.h2}>{item[1]['score']}</Text>
                                </View>
                            </View>

                        </View>
                        <Image source={
                            require('../../../assets/images/leaderboard_frame.png')}
                            resizeMode="contain"
                            style={[styles.userFrame, {width: viewWidth, height: viewWidth * imageAspectRatio}]}
                        />
                        {
                            Object.entries(item[1]['previous_seasons']).map(([key, value], index) => {
                                if (trophies[key][value['placement']] == undefined) {
                                    return null;
                                }
                                return (
                                    <Image source={trophies[key][value['placement']]}
                                        resizeMode="contain"
                                        style={{
                                            width: viewWidth * iconSizeRatio,
                                            height: viewWidth * iconSizeRatio,
                                            position: 'absolute',
                                            top: viewWidth * imageAspectRatio - viewWidth * iconSizeRatio - 2,
                                            left: 20 + (1.1 * index * viewWidth * iconSizeRatio),
                                        }}
                                        key={key}
                                    />
                                )
                            })
                        }
                    </View>
                </TouchableOpacity>
        )
    }


    return (
        <SafeAreaView style={styles.container}>
        {
            stats && (
            <View style={{flex:1}}>
                <View style={styles.allUserStats} onLayout={
                    (event) => {
                        const { width } = event.nativeEvent.layout;
                        setViewWidth(width-22);
                    }
                }>
                    <View style={styles.header}>
                        <Text style={Fonts.h1}>Žebříček</Text>
                    </View>
                    <FlatList
                        data={stats['users']}
                        renderItem={renderUser}
                        keyExtractor={item => item[0]}
                    />
                </View>
            </View>
            )
        }
        <TouchableOpacity style={styles.button} onPress={fetchUserStats}>
            <Text style={Fonts.h3}>Obnovit</Text>
        </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
        paddingBottom: 10,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 15,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
    allUserStats: {
        padding: 10,
        gap: 10,
        backgroundColor: Colors.darkerBackground,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
        flex: 1,
        alignItems: 'center',
    },
    userContainer: {
        marginBottom: 5,
    },
    userFrame: {
        position: 'absolute',
    },
    userDetailsContainer: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingTop: 7,
    }
});
