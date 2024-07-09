import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, TouchableOpacity, Button, StyleSheet, Switch, ScrollView } from 'react-native';
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
    const [ darkening, setDarkening ] = useState(settings.darkening);
    const [ darkenPreview, setDarkenPreview ] = useState(settings.darkenPreview);
    const [ showUnsent, setShowUnsent ] = useState(settings.showUnsent);
    const [ showFavourites, setShowFavourites ] = useState(settings.showFavourites);

    const options = [
            {key:'1', value: 'Nejtěžší'},
            {key:'2', value: 'Abecedně'},
            {key:'3', value: 'Nejjednodušší'},
            {key:'4', value: 'Abecedně (od Z)'},
            {key:'5', value: 'Nejnovější'},
            {key:'6', value: 'Nejstarší'},
            {key:'7', value: 'Nejlepší'},
            {key:'8', value: 'Nejhorší'},
        ];

    const savePress = () => {
        setSettings({...settings, darkenPreview: darkenPreview, showUnsent: showUnsent, showFavourites: showFavourites});
        saveSettings(settings);
        alert(`Nastavení bylo uloženo!\n Úhel: ${settings.angle}˚\n Seřadit podle: ${options.find(option => option.key == selectedSort).value}\n Obtížnosti: ${gradeIdToGradeName(gradeRange[0])} až ${gradeIdToGradeName(gradeRange[1])}\n Ztmavení: ${settings.darkening}`)
    }

    const multiSliderValuesChange = values => {setGradeRange(values);};

    return (
        <SafeAreaView style={{flex:1}}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Nastavení
                </Text>
            </View>
            <ScrollView contentContainerStyle={styles.settingsContainer}>
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
                          markerStyle={{height: 20, width: 20}}
                          touchDimensions={{height: 60, width: 60, borderRadius: 20, slipDisplacement: 200}}
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
                        values={[settings.lowerGrade, settings.upperGrade]}
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
                <View style={styles.angle}>
                    <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                        {`Ztmavení boulderů: ${darkening}`}
                    </Text>
                    <MultiSlider
                          values={[darkening*100]}
                          sliderLength={280}
                          min={0}
                          max={101}
                          step={1}
                          onValuesChange={values => setDarkening(values[0]/100)}
                          onValuesChangeFinish={values => setSettings({...settings, darkening: values[0]/100})}
                          markerStyle={{height: 20, width: 20}}
                          touchDimensions={{height: 60, width: 60, borderRadius: 20, slipDisplacement: 200}}
                    />
                </View>
                <View style={styles.switch}>
                    <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                        {`Ztmavit preview boulderu: `}
                    </Text>
                    <Switch
                      trackColor={{false: '#767577', true: '#81b0ff'}}
                      thumbColor={darkenPreview ? '#f5dd4b' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={setDarkenPreview}
                      value={darkenPreview}
                    />
                </View>
                <View style={styles.switch}>
                    <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                        {`Zobrazit pouze nevylezené: `}
                    </Text>
                    <Switch
                      trackColor={{false: '#767577', true: '#81b0ff'}}
                      thumbColor={darkenPreview ? '#f5dd4b' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={setShowUnsent}
                      value={showUnsent}
                    />
                </View>
                <View style={styles.switch}>
                    <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                        {`Zobrazit pouze oblíbené: `}
                    </Text>
                    <Switch
                      trackColor={{false: '#767577', true: '#81b0ff'}}
                      thumbColor={darkenPreview ? '#f5dd4b' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={setShowFavourites}
                      value={showFavourites}
                    />
                </View>
            </ScrollView>
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
    },
    switch: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    grade: {
        padding: 10,
    }
});


