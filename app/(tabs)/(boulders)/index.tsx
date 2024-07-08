import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradeIdToGradeName } from '../../../scripts/utils';


export default function Home(){
    const { settings, boulders, isLoading, reloadAll } = useContext(GlobalStateContext);
    const router = useRouter();

    const sortBoulderBy = () => {
        if(settings.sortby == 1){
            return boulders.sort((a,b) => b.grade - a.grade);
        } else if(settings.sortby == 2){
            return boulders.sort((a,b) => a.name.localeCompare(b.name));
        } else if(settings.sortby == 3){
            return boulders.sort((a,b) => a.grade - b.grade);
        } else if(settings.sortby == 4){
            return boulders.sort((a,b) => b.name.localeCompare(a.name));
        } else if(settings.sortby == 5){
            return boulders.sort((a,b) => b.build_time - a.build_time);
        } else if(settings.sortby == 6){
            return boulders.sort((a,b) => a.build_time - b.build_time);
        } else {
            return boulders;
        }
    }

    const filterBoulders = () => {
        const chosenBoulders = boulders.filter(boulder => {
                const boulderGrade = boulder.grade;
                const boulderAngle = boulder.angle;
                return (boulderGrade >= settings.lowerGrade && boulderGrade <= settings.upperGrade) || boulderGrade === -1;
            });
        return chosenBoulders;
    }

    const renderBoulder = ({item}) => {
        return (
            <TouchableOpacity onPress={() => router.push(`${item.id}`)}>
                <View style={{margin:10,borderWidth:0.5,padding:10}}>
                    <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                        <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                            {item.name}
                        </Text>
                        <Text style={{color:"black",fontSize:16}}>
                            {gradeIdToGradeName(item.grade)}
                        </Text>
                    </View>
                    <Text style={{color:"black",fontSize:16}}>
                        {item.description}
                    </Text>
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
            <View style={{backgroundColor:"white",paddingBottom:60}}>
                { isLoading ? ( <ActivityIndicator size="large" color="black" /> ) : (
                     <FlatList
                        data={filterBoulders(sortBoulderBy(boulders))}
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
        backgroundColor: 'lightblue',
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
});

