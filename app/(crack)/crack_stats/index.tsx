import { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrackContext } from "@/context/CrackContext";
import { UserCrackStatsType } from "@/types/userCrackStatsType";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";


export default function CrackStats(){
    const { fetchCrackStats, crackStats } = useContext(CrackContext);
    const router = useRouter();

    const renderUser = ({item, index}: {item: [string, UserCrackStatsType], index: number}) => {
        let bc = Colors.crackPrimary;
        if (index === 0) {
            bc = Colors.first;
        } else if (index === 1) {
            bc = Colors.second;
        } else if (index === 2) {
            bc = Colors.third;
        }

        return (
            <TouchableOpacity onPress={() => router.push(`/crack_stats/${item[0]}`)}>
                <View style={[styles.userContainer, {backgroundColor: bc}]}>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h2}>{index+1}. {item[0]}</Text>
                        <Text style={Fonts.h2}>{item[1]['overall_distance']} m</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={CommonStyles.paddedContainer}>
            <View style={styles.allUserStats}>
                <View style={CommonStyles.centered}>
                    <Text style={Fonts.h1}>Žebříček</Text>
                </View>
                <FlatList
                    data={crackStats['users']}
                    renderItem={renderUser}
                    keyExtractor={item => item[0]}
                />
            </View>
            <Button label={"Obnovit"} onPress={fetchCrackStats} color={Colors.crackPrimary}/>
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
        flex: 1
    },
    userContainer: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
});
