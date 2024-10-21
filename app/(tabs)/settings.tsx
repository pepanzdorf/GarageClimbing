import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, TouchableOpacity, Button, StyleSheet, Switch, ScrollView, TextInput } from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { SelectList } from 'react-native-dropdown-select-list'
import { FontAwesome } from '@expo/vector-icons';
import { gradeIdToGradeName, tagIdToIconName } from '../../scripts/utils';
import { StarRatingClickable } from '../../components/StarRatingClickable';
import { EmojiIcon } from '../../components/EmojiIcon';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'
import { apiURL } from '../../constants/Other';


export default function Settings(){
    const {
        settings,
        setSettings,
        saveSettings,
        settingsLoading,
        tags,
        wallConfig,
        setWallConfig,
        isAdmin,
        token,
        timerStatus,
        fetchTimerStatus,
    } = useContext(GlobalStateContext);
    const [ angle, setAngle ] = useState(settings.angle);
    const [ selectedWallAngle, setSelectedWallAngle ] = useState(wallConfig.angle);
    const [ selectedSort, setSelectedSort ] = useState(settings.sortby);
    const [ selectedGrading, setSelectedGrading ] = useState(settings.grading);
    const [ gradeRange, setGradeRange ] = useState([0, 53]);
    const [ darkening, setDarkening ] = useState(settings.darkening);
    const [ darkenPreview, setDarkenPreview ] = useState(settings.darkenPreview);
    const [ showUnsent, setShowUnsent ] = useState(settings.showUnsent);
    const [ showFavourites, setShowFavourites ] = useState(settings.showFavourites);
    const [ defaultRating, setDefaultRating ] = useState(settings.rating);
    const [ selectedLineWidth, setSelectedLineWidth ] = useState(settings.lineWidth);
    const [ selectedIncludeOpen, setSelectedIncludeOpen ] = useState(settings.includeOpen);
    const [ selectedTags, setSelectedTags ] = useState(settings.tags);
    const [ timerStateColor, setTimerStateColor ] = useState('red');
    const [ timerIP, setTimerIP ] = useState(settings.timerIP);
    const [ timerPort, setTimerPort ] = useState(settings.timerPort);

    const options = [
            {key:'1', value: 'Nejtěžší'},
            {key:'2', value: 'Abecedně'},
            {key:'3', value: 'Nejjednodušší'},
            {key:'4', value: 'Abecedně (od Z)'},
            {key:'5', value: 'Nejnovější'},
            {key:'6', value: 'Nejstarší'},
            {key:'7', value: 'Nejlepší'},
            {key:'8', value: 'Nejhorší'},
            {key:'9', value: 'Náhodně'},
        ];

    const gradingOptions = [
        {key:'0', value: 'V-grade'},
        {key:'1', value: 'Font'},
        {key:'2', value: 'YDS'},
        {key:'3', value: 'French sport'},
        {key:'4', value: 'Melda-scale'},
    ];

    const saveWallAngle = () => {
        fetch(`${apiURL}/climbing/set_angle/${selectedWallAngle}`, {
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        })
        .then(response => response.ok ? setWallConfig({...wallConfig, 'angle': selectedWallAngle}) : alert('Úhel stěny se nepodařilo změnit'))
    }


    const savePress = () => {
        if (isAdmin && selectedWallAngle !== wallConfig.angle) {
            saveWallAngle();
        }

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
                grading: selectedGrading,
                lineWidth: selectedLineWidth,
                includeOpen: selectedIncludeOpen,
                tags: selectedTags,
                timerIP: timerIP,
                timerPort: timerPort,
            }
        );
        alert(
            `
Nastavení bylo uloženo!
Úhel: ${angle}˚
Seřadit podle: ${options.find(option => option.key == selectedSort).value}
Obtížnosti: ${gradeIdToGradeName(gradeRange[0], selectedGrading)} až ${gradeIdToGradeName(gradeRange[1], selectedGrading)}
Ztmavení: ${darkening}
Ztmavit preview: ${darkenPreview ? 'Ano' : 'Ne'}
Zobrazit pouze nevylezené: ${showUnsent ? 'Ano' : 'Ne'}
Zobrazit pouze oblíbené: ${showFavourites ? 'Ano' : 'Ne'}
Zobrazit open bouldery: ${selectedIncludeOpen ? 'Ano' : 'Ne'}
Defaultní hodnocení: ${defaultRating}
Používat stupnici: ${gradingOptions.find(option => option.key == selectedGrading).value}
Tloušťka čáry kolem chytů: ${selectedLineWidth}
IP adresa timeru: ${timerIP}
Port timeru: ${timerPort}
            `
        )
    }

    const renderTag = (item) => {
        let borderStyle = {
            borderColor: Colors.borderDark,
            borderWidth: 2,
        }

        let iconColor = Colors.borderDark;

        if (selectedTags.includes(item.id)) {
            borderStyle = {
                borderColor: Colors.primary,
                borderWidth: 2,
            }
            iconColor = Colors.primary;
        }

        return (
            <TouchableOpacity onPress={() => handleTagPress(item.id)} key={item.id}>
                <View style={[styles.tag, borderStyle]} key={item.id}>
                    <EmojiIcon emoji={tagIdToIconName(item.id)} size={30} color={iconColor}/>
                    <Text style={[Fonts.h3, {color: iconColor}]}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    const handleTagPress = (id) => {
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter(tag => tag !== id));
        } else {
            setSelectedTags([...selectedTags, id]);
        }
    }

    useEffect(() => {
        switch (timerStatus) {
            case 'offline':
                setTimerStateColor('red');
                break;
            default:
                setTimerStateColor('green');
        }
    }
    , [timerStatus])

    return (
        <SafeAreaView style={{flex:1}}>
            <View style={styles.header}>
                <Text style={Fonts.h1}>
                    Nastavení
                </Text>
            </View>
            {settingsLoading && <ActivityIndicator size="large" color="#0000ff" />}
            <ScrollView contentContainerStyle={styles.settingsContainer}>
                {
                    isAdmin &&
                    <View style={styles.angle}>
                        <Text style={Fonts.h3}>
                            {`Globální úhel stěny: ${selectedWallAngle}˚`}
                        </Text>
                        <MultiSlider
                            values={[selectedWallAngle]}
                            sliderLength={280}
                            min={0}
                            max={45}
                            step={1}
                            onValuesChange={values => setSelectedWallAngle(values[0])}
                            markerStyle={styles.markerStyle}
                            selectedStyle={{backgroundColor: Colors.primary}}
                            unselectedStyle={{backgroundColor: Colors.border}}
                            touchDimensions={styles.touchDimensions}
                        />
                    </View>
                }
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
                    <Text style={Fonts.plainBold}>Od: {gradeIdToGradeName(gradeRange[0], settings.grading)}</Text>
                    <Text style={Fonts.plainBold}>Do: {gradeIdToGradeName(gradeRange[1], settings.grading)}</Text>
                    <MultiSlider
                        values={[settings.lowerGrade, settings.upperGrade]}
                        sliderLength={280}
                        onValuesChange={setGradeRange}
                        min={0}
                        max={52}
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
                        thumbColor={darkenPreview ? Colors.background : Colors.backgroundDarker}
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
                        thumbColor={showFavourites ? Colors.background : Colors.backgroundDarker}
                        onValueChange={setShowFavourites}
                        value={showFavourites}
                    />
                </View>
                <View style={styles.switch}>
                    <Text style={Fonts.h3}>
                        {`Zobrazit open bouldery: `}
                    </Text>
                    <Switch
                        trackColor={styles.track}
                        thumbColor={selectedIncludeOpen ? Colors.background : Colors.backgroundDarker}
                        onValueChange={setSelectedIncludeOpen}
                        value={selectedIncludeOpen}
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
                <View style={styles.grading}>
                    <Text style={Fonts.h3}>
                        Používat stupnici:
                    </Text>
                    <SelectList
                        setSelected={setSelectedGrading}
                        placeholder="Vyberte..."
                        data={gradingOptions}
                        save="key"
                        search={false}
                    />
                </View>
                <View style={styles.angle}>
                    <Text style={Fonts.h3}>
                        {`Tloušťka čáry chytů: ${selectedLineWidth}`}
                    </Text>
                    <MultiSlider
                        values={[selectedLineWidth]}
                        sliderLength={280}
                        min={1}
                        max={20}
                        step={1}
                        onValuesChange={values => setSelectedLineWidth(values[0])}
                        markerStyle={styles.markerStyle}
                        selectedStyle={{backgroundColor: Colors.primary}}
                        unselectedStyle={{backgroundColor: Colors.border}}
                        touchDimensions={styles.touchDimensions}
                    />
                </View>
                <View style={styles.address}>
                    <Text style={Fonts.h3}>
                        IP adresa timeru:
                    </Text>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={setTimerIP}
                        value={timerIP}
                        keyboardType='numeric'
                    />
                    <Text style={Fonts.h3}>
                        Port timeru:
                    </Text>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={setTimerPort}
                        value={timerPort}
                        keyboardType='numeric'
                    />
                    <Text style={Fonts.h3}>
                        Stav timeru:
                    </Text>
                    <View style={styles.row}>
                        <Text style={[Fonts.h3, {color: timerStateColor}]}>
                            {timerStatus == 'offline' ? 'offline' : 'online'}
                        </Text>
                        <TouchableOpacity onPress={fetchTimerStatus} style={styles.timerButton}>
                            <Text style={Fonts.plainBold}>
                                Zkontrolovat
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.tagsContainer}>
                    <Text style={Fonts.h3}>
                        Zobrazit bouldery s tagy:
                    </Text>
                    <View style={styles.tags}>
                        {
                            tags.map(tag =>
                                renderTag(tag))
                        }
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
    },
    grading: {
        padding: 10,
        gap: 20,
    },
    tagsContainer: {
        padding: 10,
        gap: 15,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
    },
    address: {
        padding: 10,
        gap: 10,
    },
    textInput: {
        height: 45,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Colors.darkerBorder,
        paddingLeft: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    timerButton: {
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Colors.darkerBorder,
        backgroundColor: Colors.primary,
    }
});


