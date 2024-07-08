import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { SelectList } from 'react-native-dropdown-select-list'
import { FontAwesome } from '@expo/vector-icons';
import { gradeIdToGradeName } from '../../scripts/utils';


export default function Settings(){
    const { settings, setSettings, saveSettings, loadSettings } = useContext(GlobalStateContext);
    const [ angle, setAngle ] = useState(settings.angle);
    const [ selectedSort, setSelectedSort ] = useState(settings.sortby);
    const [ gradeRange, setGradeRange ] = useState([0, 53]);

    const options = [
            {key:'1', value: 'Obtížnost (↓)'},
            {key:'2', value: 'Jméno (↓)'},
            {key:'3', value: 'Obtížnost (↑)'},
            {key:'4', value: 'Jméno (↑)'},
            {key:'5', value: 'Nejnovější'},
            {key:'6', value: 'Nejstarší'}
        ];

    const savePress = () => {
        saveSettings(settings);
        alert(`Nastavení bylo uloženo!\n Úhel: ${settings.angle}˚\n Seřadit podle: ${options.find(option => option.key == selectedSort).value}\n Obtížnosti: ${gradeIdToGradeName(gradeRange[0])} až ${gradeIdToGradeName(gradeRange[1])}`)
    }

    const multiSliderValuesChange = values => {setGradeRange(values);};

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
                        onSelect={() => setSettings({...settings, sortby: selectedSort})}
                        placeholder="Vyberte..."
                        data={options}
                        save="key"
                        search={false}
                    />
                </View>
                <View style={styles.grade}>
                    <MultiSlider
                        values={[0, 53]}
                        sliderLength={280}
                        onValuesChange={multiSliderValuesChange}
                        onValuesChangeFinish={values => setSettings({...settings, upperGrade: gradeRange[1], lowerGrade: gradeRange[0]})}
                        min={0}
                        max={53}
                        step={1}
                        snapped
                        allowOverlap
                        markerStyle={{height: 20, width: 20}}
                        touchDimensions={{height: 60, width: 60, borderRadius: 20, slipDisplacement: 200}}
                    ></MultiSlider>
                    <Text>Grade Range</Text>
                    <Text>From: {gradeIdToGradeName(gradeRange[0])}</Text>
                    <Text>To: {gradeIdToGradeName(gradeRange[1])}</Text>
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
        flex: 1,
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


