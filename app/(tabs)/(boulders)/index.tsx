import React, { useContext } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradeIdToGradeName, sortBoulderBy, filterBoulders } from '../../../scripts/utils';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { StarRating } from '../../../components/StarRating';


export default function Home(){
    const { settings, boulders, isLoading, reloadAll } = useContext(GlobalStateContext);
    const router = useRouter();

    const renderBoulder = ({item}) => {
        return (
            <TouchableOpacity onPress={() => router.push(`${item.id}`)}>
                <View style={styles.boulder}>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            {item.name}
                        </Text>
                        <Text style={Fonts.h3}>
                            {gradeIdToGradeName(item.grade)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.description}>
                            <Text style={{color:"black",fontSize:16}}>
                                {item.description}
                            </Text>
                        </View>
                        <StarRating rating={3.6} maxStars={5} size={20}/>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={{flex:1}}>
                <View style={styles.menuContainer}>
                    <TouchableOpacity onPress={() => reloadAll()}>
                        <View style={styles.refresh}>
                            <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                                Refresh
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            <View style={styles.boulders}>
                { isLoading ? ( <ActivityIndicator size="large" color="black" /> ) : (
                     <FlatList
                        data={
                                filterBoulders(
                                    sortBoulderBy(settings.sortby, boulders),
                                    true,
                                    settings.lowerGrade,
                                    settings.upperGrade
                                )
                            }
                        renderItem={renderBoulder}
                    />
                ) }
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: Colors.theme.primary,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    refresh: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    sort: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    boulder: {
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        backgroundColor: Colors.theme.darkerBackground,
    },
    boulders: {
        backgroundColor: Colors.theme.backgroundColor,
        paddingBottom: 70
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
        marginTop: 5,
    },
    description: {
        maxWidth: "70%",
    }
});

