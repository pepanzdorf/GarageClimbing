import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, TouchableOpacity, Button, StyleSheet, Switch, ScrollView } from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { SelectList } from 'react-native-dropdown-select-list'
import { FontAwesome } from '@expo/vector-icons';
import { gradeIdToGradeName } from '../../scripts/utils';
import { StarRatingClickable } from '../../components/StarRatingClickable';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'


export default function Settings(){
    const { settings, setSettings, saveSettings, settingsLoading } = useContext(GlobalStateContext);
    const [ angle, setAngle ] = useState(settings.angle);
    const [ selectedSort, setSelectedSort ] = useState(settings.sortby);
    const [ gradeRange, setGradeRange ] = useState([0, 53]);
    const [ darkening, setDarkening ] = useState(settings.darkening);
    const [ darkenPreview, setDarkenPreview ] = useState(settings.darkenPreview);
    const [ showUnsent, setShowUnsent ] = useState(settings.showUnsent);
    const [ showFavourites, setShowFavourites ] = useState(settings.showFavourites);
    const [ defaultRating, setDefaultRating ] = useState(settings.rating);

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
        setSettings(
            {
                ...settings,
                darkenPreview: darkenPreview,
                showUnsent: showUnsent,
                showFavourites: showFavourites,
                rating: defaultRating,
                angle: angle,
                sortby: selectedSort,
                lowerGrade: gradeRange[0],
                upperGrade: gradeRange[1],
                darkening: darkening,
            }
        );
        alert(
            `
Nastavení bylo uloženo!
Úhel: ${angle}˚
Seřadit podle: ${options.find(option => option.key == selectedSort).value}
Obtížnosti: ${gradeIdToGradeName(gradeRange[0])} až ${gradeRange[1]}
Ztmavení: ${darkening}
Ztmavit preview: ${darkenPreview ? 'Ano' : 'Ne'}
Zobrazit pouze nevylezené: ${showUnsent ? 'Ano' : 'Ne'}
Zobrazit pouze oblíbené: ${showFavourites ? 'Ano' : 'Ne'}
Defaultní hodnocení: ${defaultRating}
            `
        )
    }

    return (
        <SafeAreaView style={{flex:1}}>
            <View style={styles.header}>
                <Text style={Fonts.h1}>
                    Nastavení
                </Text>
            </View>
            {settingsLoading && <ActivityIndicator size="large" color="#0000ff" />}
            <ScrollView contentContainerStyle={styles.settingsContainer}>
                <View style={styles.angle}>
                    <Text style={Fonts.h3}>
                        {`Úhel: ${angle}˚`}
                    </Text>
                    <MultiSlider
                        values={[angle]}
                        sliderLength={280}
                        min={0}
                        max={45}
                        step={1}
                        onValuesChange={values => setAngle(values[0])}
                        markerStyle={styles.markerStyle}
                        selectedStyle={{backgroundColor: Colors.primary}}
                        unselectedStyle={{backgroundColor: Colors.border}}
                        touchDimensions={styles.touchDimensions}
                    />
                </View>
                <View style={styles.sort}>
                    <Text style={Fonts.h3}>
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
                <View style={styles.grade}>
                    <Text style={Fonts.h3}>Rozsah obtížností</Text>
                    <Text style={Fonts.plainBold}>Od: {gradeIdToGradeName(gradeRange[0])}</Text>
                    <Text style={Fonts.plainBold}>Do: {gradeIdToGradeName(gradeRange[1])}</Text>
                    <MultiSlider
                        values={[settings.lowerGrade, settings.upperGrade]}
                        sliderLength={280}
                        onValuesChange={setGradeRange}
                        min={0}
                        max={53}
                        step={1}
                        snapped
                        allowOverlap
                        markerStyle={styles.markerStyle}
                        selectedStyle={{backgroundColor: Colors.primary}}
                        unselectedStyle={{backgroundColor: Colors.border}}
                        touchDimensions={styles.touchDimensions}
                    ></MultiSlider>

                </View>
                <View style={styles.angle}>
                    <Text style={Fonts.h3}>
                        {`Ztmavení boulderů: ${darkening}`}
                    </Text>
                    <MultiSlider
                        values={[darkening*100]}
                        sliderLength={280}
                        min={0}
                        max={101}
                        step={1}
                        onValuesChange={values => setDarkening(values[0]/100)}
                        markerStyle={styles.markerStyle}
                        touchDimensions={styles.touchDimensions}
                        selectedStyle={{backgroundColor: Colors.primary}}
                        unselectedStyle={{backgroundColor: Colors.border}}
                    />
                </View>
                <View style={styles.switch}>
                    <Text style={Fonts.h3}>
                        {`Ztmavit preview boulderu: `}
                    </Text>
                    <Switch
                        trackColor={styles.track}
                        thumbColor={showUnsent ? Colors.background : Colors.backgroundDarker}
                        onValueChange={setDarkenPreview}
                        value={darkenPreview}
                    />
                </View>
                <View style={styles.switch}>
                    <Text style={Fonts.h3}>
                        {`Zobrazit pouze nevylezené: `}
                    </Text>
                    <Switch
                        trackColor={styles.track}
                        thumbColor={showUnsent ? Colors.background : Colors.backgroundDarker}
                        onValueChange={setShowUnsent}
                        value={showUnsent}
                    />
                </View>
                <View style={styles.switch}>
                    <Text style={Fonts.h3}>
                        {`Zobrazit pouze oblíbené: `}
                    </Text>
                    <Switch
                        trackColor={styles.track}
                        thumbColor={showUnsent ? Colors.background : Colors.backgroundDarker}
                        onValueChange={setShowFavourites}
                        value={showFavourites}
                    />
                </View>
                <View style={styles.angle}>
                    <Text style={Fonts.h3}>
                        {`Defaultní hodnocení: ${defaultRating}`}
                    </Text>
                    <View style={styles.stars}>
                        <StarRatingClickable maxStars={5} initialRating={settings.rating} onRatingChange={setDefaultRating} size={48}/>
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity onPress={savePress}>
                <View style={styles.button}>
                    <Text style={Fonts.h3}>Uložit nastavení</Text>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    settingsContainer: {
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 10,
        paddingBottom: 10,
        gap: 10,
    },
    sort: {
        padding: 10,
        gap: 20,
    },
    angle: {
        padding: 10,
    },
    grade: {
        padding: 10,
    },
    header: {
        backgroundColor: Colors.primary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderBottomColor: Colors.borderDark,
    },
    switch: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    button: {
         backgroundColor: Colors.primary,
         padding: 10,
         alignItems: 'center',
         borderWidth: 1,
         borderRadius: 10,
         marginTop: 15,
         marginRight: 20,
         marginLeft: 20,
     },
    stars: {
        alignItems: 'center',
        marginTop: 10
    },
    markerStyle: {
        height: 20,
        width: 20,
        backgroundColor: Colors.primary,
    },
    touchDimensions: {
        height: 60,
        width: 60,
        borderRadius: 20,
        slipDisplacement: 200
    },
    track: {
        false: Colors.darkerBorder,
        true: Colors.primary
    }
});


