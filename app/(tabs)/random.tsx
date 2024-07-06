import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import { GlobalStateContext } from '../context';

export default function Random(){

  const { boulders, fetchBoulders } = useContext(GlobalStateContext);

const renderBoulder = ({item}) => {
  return (
        <View style={{margin:10,borderWidth:0.5,padding:10}}>
          <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
            {item.name}
          </Text>
          <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
            {item.grade}
            </Text>
        </View>
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
