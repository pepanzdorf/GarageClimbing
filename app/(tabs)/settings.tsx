import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';


export default function Settings(){
    const { settings, setSettings, saveSettings, loadSettings } = useContext(GlobalStateContext);
    const [ angle, setAngle ] = useState(settings.angle);

    return (
        <SafeAreaView style={{flex:1}}>
            <View style={{margin:10,borderWidth:0.5,padding:10}}>
                <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                    Settings
                </Text>
            </View>
            <View style={{margin:10,borderWidth:0.5,padding:10}}>
                <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                    {`Angle: ${angle}˚`}
                </Text>
                <MultiSlider
                      values={[angle]}
                      sliderLength={280}
                      min={0}
                      max={45}
                      step={1}
                      onValuesChange={values => setAngle(values[0])}
                      onValuesChangeFinish={values => setSettings({...settings, angle: values[0]})}
                />
            </View>
            <Button title="Uložit nastavení" onPress={() => saveSettings(settings)} />
        </SafeAreaView>
    )
}
