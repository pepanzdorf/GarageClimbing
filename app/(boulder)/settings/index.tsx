import { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SettingsContext } from '@/context/SettingsContext';
import { UserContext } from '@/context/UserContext';
import { TimerContext } from '@/context/TimerContext';
import { BoulderContext } from '@/context/BoulderContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectList } from 'react-native-dropdown-select-list'
import { gradeIdToGradeName } from '@/scripts/utils';
import { StarRatingClickable } from '@/components/StarRatingClickable';
import { apiURL } from '@/constants/Other';
import { TagType } from '@/types/tagType';
import { useRouter } from "expo-router";
import Fonts from '@/constants/Fonts'
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";
import StyledMultiSlider from "@/components/StyledMultiSlider";
import RowSwitch from "@/components/RowSwitch";
import Tag from "@/components/Tag";


export default function SettingsIndex(){
    const {
        settings,
        setSettings,
        wallConfig,
        setWallConfig,
        saveSettings,
    } = useContext(SettingsContext);
    const { tags } = useContext(BoulderContext);
    const { token, isAdmin } = useContext(UserContext);
    const { timerStatus, pingTimer } = useContext(TimerContext);

    const [ angle, setAngle ] = useState(settings.angle);
    const [ selectedWallAngle, setSelectedWallAngle ] = useState(wallConfig.angle);
    const [ selectedSort, setSelectedSort ] = useState(settings.sortby);
    const [ selectedGrading, setSelectedGrading ] = useState(settings.grading);
    const [ gradeRange, setGradeRange ] = useState([settings.lowerGrade, settings.upperGrade]);
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
    const [ selectedShowTimerControls, setSelectedShowTimerControls ] = useState(settings.showTimerControls);
    const [ showUnsentSeasonal, setShowUnsentSeasonal ] = useState(settings.showUnsentSeasonal);

    const router = useRouter();

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
        fetch(`${apiURL}/set_angle/${selectedWallAngle}`, {
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        })
        .then(response =>
            response.ok ? setWallConfig({...wallConfig, 'angle': selectedWallAngle}) :
                alert('Úhel stěny se nepodařilo změnit'))
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
                showTimerControls: selectedShowTimerControls,
                showUnsentSeasonal: showUnsentSeasonal,
            }
        );

        saveSettings({
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
            showTimerControls: selectedShowTimerControls,
            showUnsentSeasonal: showUnsentSeasonal,
        });

        alert(
            `
Nastavení bylo uloženo!
Úhel: ${angle}˚
Seřadit podle: ${options.find(option => option.key === selectedSort)?.value}
Obtížnosti: ${gradeIdToGradeName(gradeRange[0], selectedGrading)} až ${gradeIdToGradeName(gradeRange[1], selectedGrading)}
Ztmavení: ${darkening}
Ztmavit preview: ${darkenPreview ? 'Ano' : 'Ne'}
Zobrazit pouze nevylezené: ${showUnsent ? 'Ano' : 'Ne'}
Zobrazit pouze oblíbené: ${showFavourites ? 'Ano' : 'Ne'}
Zobrazit open bouldery: ${selectedIncludeOpen ? 'Ano' : 'Ne'}
Defaultní hodnocení: ${defaultRating}
Používat stupnici: ${gradingOptions.find(option => option.key === selectedGrading)?.value}
Tloušťka čáry kolem chytů: ${selectedLineWidth}
IP adresa timeru: ${timerIP}
Port timeru: ${timerPort}
Zobrazit ovládání časovače: ${selectedShowTimerControls ? 'Ano' : 'Ne'}
Zobrazit pouze nevylezené (sezóna): ${showUnsentSeasonal ? 'Ano' : 'Ne'}
            `
        )
    }

    const renderTag = (item: TagType) => {
        return (
            <Tag
                active={selectedTags.includes(item.id)}
                name={item.name}
                onPress={() => handleTagPress(item.id)}
                id={item.id}
                key={item.id}
            />
        )
    }

    const handleTagPress = (id: number) => {
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter((tag: number) => tag !== id));
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
        <SafeAreaView style={CommonStyles.container}>
            <View style={CommonStyles.header}>
                <Text style={Fonts.h1}>
                    Nastavení
                </Text>
            </View>
            <ScrollView contentContainerStyle={CommonStyles.paddedHorizontal}>
                <View style={{marginTop: 10}}>
                    <Button label={'Profil'} onPress={() => router.push('/settings/profile')}/>
                </View>
                {
                    isAdmin &&
                    <View style={CommonStyles.padded}>
                        <Text style={Fonts.h3}>
                            {`Globální úhel stěny: ${selectedWallAngle}˚`}
                        </Text>
                        <StyledMultiSlider
                            min={0}
                            max={45}
                            step={1}
                            values={[selectedWallAngle]}
                            onValuesChange={(values) => setSelectedWallAngle(values[0])}
                        />
                    </View>
                }
                <View style={CommonStyles.padded}>
                    <Text style={Fonts.h3}>
                        {`Úhel: ${angle}˚`}
                    </Text>
                    <StyledMultiSlider
                        min={0}
                        max={45}
                        step={1}
                        values={[angle]}
                        onValuesChange={(values) => setAngle(values[0])}
                    />
                </View>
                <View style={[CommonStyles.padded, CommonStyles.gapped]}>
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
                <View style={CommonStyles.padded}>
                    <Text style={Fonts.h3}>Rozsah obtížností</Text>
                    <Text style={Fonts.plainBold}>Od: {gradeIdToGradeName(gradeRange[0], settings.grading)}</Text>
                    <Text style={Fonts.plainBold}>Do: {gradeIdToGradeName(gradeRange[1], settings.grading)}</Text>
                    <StyledMultiSlider
                        min={0}
                        max={52}
                        step={1}
                        values={[settings.lowerGrade, settings.upperGrade]}
                        onValuesChange={setGradeRange}
                    />
                </View>
                <View style={CommonStyles.padded}>
                    <Text style={Fonts.h3}>
                        {`Ztmavení boulderů: ${darkening}`}
                    </Text>
                    <StyledMultiSlider
                        min={0}
                        max={101}
                        step={1}
                        values={[darkening*100]}
                        onValuesChange={(values) => setDarkening(values[0]/100)}
                    />
                </View>
                <View style={CommonStyles.padded}>
                    <Text style={Fonts.h3}>
                        {`Tloušťka čáry chytů: ${selectedLineWidth}`}
                    </Text>
                    <StyledMultiSlider
                        min={1}
                        max={20}
                        step={1}
                        values={[selectedLineWidth]}
                        onValuesChange={(values) => setSelectedLineWidth(values[0])}
                    />
                </View>
                <RowSwitch label={"Ztmavit preview boulderu:"} value={darkenPreview} onValueChange={setDarkenPreview} />
                <RowSwitch label={"Zobrazit pouze nevylezené:"} value={showUnsent} onValueChange={setShowUnsent} />
                <RowSwitch label={"Zobrazit pouze nevylezené (sezóna):"} value={showUnsentSeasonal} onValueChange={setShowUnsentSeasonal} />
                <RowSwitch label={"Zobrazit pouze oblíbené:"} value={showFavourites} onValueChange={setShowFavourites} />
                <RowSwitch label={"Zobrazit open bouldery:"} value={selectedIncludeOpen} onValueChange={setSelectedIncludeOpen} />
                <RowSwitch label={"Zobrazit ovládání časovače:"} value={selectedShowTimerControls} onValueChange={setSelectedShowTimerControls} />
                <View style={[CommonStyles.padded, CommonStyles.smallGapped]}>
                    <Text style={Fonts.h3}>
                        {`Defaultní hodnocení: ${defaultRating}`}
                    </Text>
                    <View style={CommonStyles.centered}>
                        <StarRatingClickable maxStars={5} initialRating={settings.rating} onRatingChange={setDefaultRating} size={48}/>
                    </View>
                </View>
                <View style={[CommonStyles.padded, CommonStyles.gapped]}>
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
                <View style={[CommonStyles.padded, CommonStyles.smallGapped]}>
                    <Text style={Fonts.h3}>
                        IP adresa timeru:
                    </Text>
                    <TextInput
                        style={CommonStyles.input}
                        onChangeText={setTimerIP}
                        value={timerIP}
                        keyboardType='numeric'
                    />
                    <Text style={Fonts.h3}>
                        Port timeru:
                    </Text>
                    <TextInput
                        style={CommonStyles.input}
                        onChangeText={setTimerPort}
                        value={timerPort}
                        keyboardType='numeric'
                    />
                    <Text style={Fonts.h3}>
                        Stav timeru:
                    </Text>
                    <View style={[CommonStyles.row, CommonStyles.gapped]}>
                        <Text style={[Fonts.h3, {color: timerStateColor}]}>
                            {timerStatus}
                        </Text>
                        <Button label={"Zkontrolovat stav"} onPress={pingTimer} theme={"tiny"} width={'auto'}/>
                    </View>
                </View>
                <View style={[CommonStyles.padded, CommonStyles.gapped]}>
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
            <View style={CommonStyles.paddedHorizontal}>
                <Button label={"Uložit nastavení"} onPress={savePress} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
});

