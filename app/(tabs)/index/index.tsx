import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';

export default function Home(){
  const { boulders, fetchBoulders } = useContext(GlobalStateContext);
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
        <View style={{flex:1,backgroundColor:"white"}}>
             <FlatList
            data={boulders}
            renderItem={renderBoulder}
            />
        </View>
  )
}
