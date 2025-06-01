import { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BoulderContext } from '@/context/BoulderContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserBoulderStatsType } from "@/types/userBoulderStatsType";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";


export default function Stats(){
    const { stats, fetchUserStats } = useContext(BoulderContext);

    const router = useRouter();
    const [ viewWidth, setViewWidth ] = useState(0);

    const imageAspectRatio = 0.21666666;
    const imageBorderOnlyAspectRatio = 0.1666666;
    const iconSizeRatio = 0.1;
    const trophies: { [key: string]: { [key: number]: number }} = {
        '2024-2':  {
                1: require('@/assets/images/trophies/trophy_2024-2_1.png'),
                2: require('@/assets/images/trophies/trophy_2024-2_2.png'),
                3: require('@/assets/images/trophies/trophy_2024-2_3.png'),
        }
    }

    const renderUser = ({item, index} : {item: [string, UserBoulderStatsType], index: number}) => {
        let bc = Colors.primary;
        if (index === 0) {
            bc = Colors.first;
        } else if (index === 1) {
            bc = Colors.second;
        } else if (index === 2) {
            bc = Colors.third;
        }

        return (
                <TouchableOpacity onPress={() => router.push(`/stats/${item[0]}`)}>
                    <View style={{width: viewWidth, height: viewWidth * imageAspectRatio, marginBottom: 5}}>
                        <View style={[
                            styles.userDetailsContainer,
                            { backgroundColor: bc, width: viewWidth, height: viewWidth * imageBorderOnlyAspectRatio }
                        ]}>
                            <View style={[CommonStyles.justifiedRow, {flex: 5, marginRight: 20}]}>
                                <Text style={Fonts.h2}>{index+1}. {item[0]}</Text>
                                <Text style={Fonts.h2}>{item[1]['sum_flashes']}/{item[1]['sum_sends']}</Text>
                            </View>
                            <View style={{flex: 2, flexDirection: 'row-reverse'}}>
                                <Text style={Fonts.h2}>{item[1]['score']}</Text>
                            </View>
                        </View>
                        <Image source={
                            require('@/assets/images/leaderboard_frame.png')}
                            resizeMode="contain"
                            style={{width: viewWidth, height: viewWidth * imageAspectRatio, position: 'absolute'}}
                        />
                        {
                            Object.entries(item[1]['previous_seasons']).map(([key, value], index) => {
                                if (!trophies[key]?.[value['placement']]) {
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
        <SafeAreaView style={CommonStyles.paddedContainer}>
            {
                stats &&
                <View style={styles.allUserStats} onLayout={
                    (event) => {
                        const { width } = event.nativeEvent.layout;
                        setViewWidth(width-22);
                    }
                }>
                    <View style={CommonStyles.centered}>
                        <Text style={Fonts.h1}>Žebříček</Text>
                    </View>
                    <FlatList
                        data={stats['users']}
                        renderItem={renderUser}
                        keyExtractor={item => item[0]}
                    />
                    </View>
            }
            <Button label={"Obnovit"} onPress={fetchUserStats} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
    userDetailsContainer: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingTop: 7,
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});
