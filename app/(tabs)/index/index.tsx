import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home(){
  const { boulders, fetchBoulders, isLoading } = useContext(GlobalStateContext);
  const router = useRouter();

  const renderBoulder = ({item}) => {
    return (
        <TouchableOpacity onPress={() => router.push(`${item.id}`)}>
          <View style={{margin:10,borderWidth:0.5,padding:10}}>
            <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
    )
  }

  return (
      <SafeAreaView style={{flex:1}}>
        <TouchableOpacity onPress={() => fetchBoulders()}>
            <View style={{margin:10,borderWidth:0.5,padding:10}}>
                <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                Refresh
                </Text>
            </View>
        </TouchableOpacity>

      <View style={{backgroundColor:"white"}}>
          { isLoading ? ( <ActivityIndicator size="large" color="black" /> ) : (
                 <FlatList
                data={boulders}
                renderItem={renderBoulder}
                />
            ) }
      </View>
        </SafeAreaView>
  )
}
