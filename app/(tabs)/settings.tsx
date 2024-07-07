import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { SelectList } from 'react-native-dropdown-select-list'
import { FontAwesome } from '@expo/vector-icons';



export default function Settings(){
    const { settings, setSettings, saveSettings, loadSettings } = useContext(GlobalStateContext);
    const [ angle, setAngle ] = useState(settings.angle);
    const [ selectedSort, setSelectedSort ] = useState(settings.sortby);
    const options = [
            {key:'1', value: 'Obtížnost (↓)'},
            {key:'2', value: 'Jméno (↓)'},
            {key:'3', value: 'Obtížnost (↑)'},
            {key:'4', value: 'Jméno (↑)'}
        ];

    const savePress = () => {
        setSettings({...settings, angle: angle, sortby: selectedSort});
        saveSettings(settings);
    }

    return (
        <SafeAreaView style={{flex:1}}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Nastavení
                </Text>
            </View>
            <View style={styles.settingsContainer}>
                <View style={styles.angle}>
                    <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                        {`Úhel: ${angle}˚`}
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
                <View style={styles.sort}>
                    <Text style={{color:"black",fontSize:16,fontWeight:"bold",marginRight:10}}>
                        Seřadit bouldery podle:
                    </Text>
                    <SelectList
                        setSelected={setSelectedSort}
                        placeholder="Vyberte..."
                        data={options}
                        save="key"
                        search={false}
                    />
                </View>
            </View>
            <Button title="Uložit nastavení" onPress={() => savePress()} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    settingsContainer: {
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    sort: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    angle: {
        padding: 10,
    },
    header: {
        backgroundColor: 'lightblue',
        padding: 10,
        alignItems: 'center',
    },
    headerText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
    }
});


