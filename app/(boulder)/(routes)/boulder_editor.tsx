import { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from "@/context/UserContext";
import { SettingsContext } from "@/context/SettingsContext";
import { apiURL } from '@/constants/Other';
import { numberToStrokeColor } from '@/scripts/utils';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { BoulderContext } from "@/context/BoulderContext";
import { BoulderWall } from "@/components/BoulderWall";
import { useLocalSearchParams, useRouter } from "expo-router";
import Tag from '@/components/Tag'
import Colors from '@/constants/Colors'
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";


export default function BoulderEditor(){
    const { edit } = useLocalSearchParams();
    const { token } = useContext(UserContext);
    const { settings } = useContext(SettingsContext);
    const { holds, tags, reloadBoulders, currentBoulder, currentHolds, setReload } = useContext(BoulderContext);
    const [ colorsHolds, setColorsHolds ] = useState<number[]>([]);
    const [ colorsVolumes, setColorsVolumes ] = useState<number[]>([]);
    const [ selectedColor, setSelectedColor ] = useState(0);
    const [ boulderName, setBoulderName ] = useState('');
    const [ boulderDescription, setBoulderDescription ] = useState('');
    const [ selectedTags, setSelectedTags ] = useState<number[]>([]);

    const isEditMode = edit === 'true';
    const router = useRouter();


    const handleColorChange = (index: number, isVolume: boolean) => {
        if (isVolume) {
            setColorsVolumes(colorsVolumes.map((color: number, i: number) => i === index ? selectedColor : color));
        } else {
            setColorsHolds(colorsHolds.map((color: number, i: number) => i === index ? selectedColor : color));
        }
    }

    const handleCancel = () => {
        setColorsHolds(Array.from({length: holds["holds"].length}, () => -1));
        setColorsVolumes(Array.from({length: holds["volumes"].length}, () => -1));
        setBoulderName('');
        setBoulderDescription('');
        setSelectedTags([]);
    }

    const convertToListOfHolds = () => {
        const holdsList = [];
        for (let i = 0; i < colorsHolds.length; i++) {
            if (colorsHolds[i] !== -1) {
                holdsList.push({id: holds["holds"][i].id, type: colorsHolds[i]});
            }
        }
        for (let i = 0; i < colorsVolumes.length; i++) {
            if (colorsVolumes[i] !== -1) {
                holdsList.push({id: holds["volumes"][i].id, type: colorsVolumes[i]});
            }
        }
        return holdsList;
    }

    const handleSave = async () => {
        if (isEditMode && !currentBoulder) return;
        if (boulderName === '') {
            alert('Vyplňte jméno boulderu');
            return;
        }
        const boulder = {
            name: boulderName,
            description: boulderDescription,
            holds: convertToListOfHolds(),
            edit: isEditMode,
            bid: isEditMode ? currentBoulder!.id : null,
            tags: selectedTags,
        }
        try {
            const response = await fetch(`${apiURL}/boulder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(boulder),
            });
            if (response.ok) {
                alert(isEditMode ? 'Boulder byl úspěšně upraven' : 'Boulder byl úspěšně uložen');
                handleCancel();
                reloadBoulders();
                setReload(true);
                router.back();
            } else {
                alert(await response.text());
            }
        } catch (error) {
            alert('Server error');
            console.error(error);
        }
    }


    const handleTagPress = (id: number) => {
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter(tag => tag !== id));
        } else {
            setSelectedTags([...selectedTags, id]);
        }
    }

    useEffect(() => {
        if (holds) {
            handleCancel();
            if (isEditMode) {
                if (!currentBoulder) {
                    alert("Failed loading editing");
                    router.back();
                    return;
                }
                setBoulderName(currentBoulder.name);
                setBoulderDescription(currentBoulder.description);
                setSelectedTags(currentBoulder.tags);

                const holdsArray = Array.from({length: holds["holds"].length}, () => -1);
                const volumesArray = Array.from({length: holds["volumes"].length}, () => -1);

                currentHolds['holds'].forEach(hold => {
                    for (let i = 0; i < holds["holds"].length; i++) {
                        if (holds["holds"][i].id === hold.id) {
                            holdsArray[i] = hold.hold_type;
                        }
                    }
                });

                currentHolds['volumes'].forEach(hold => {
                    for (let i = 0; i < holds["volumes"].length; i++) {
                        if (holds["volumes"][i].id === hold.id) {
                            volumesArray[i] = hold.hold_type;
                        }
                    }
                });
                setColorsHolds(holdsArray);
                setColorsVolumes(volumesArray);
            } else {
                setColorsHolds(Array.from({length: holds["holds"].length}, () => -1));
                setColorsVolumes(Array.from({length: holds["volumes"].length}, () => -1));
            }
        }
    }
    , [holds, currentBoulder]);

    return (
        <SafeAreaView style={CommonStyles.container}>
            {
                <ScrollView>
                    <BoulderWall
                        holds={holds}
                        lineWidth={settings.lineWidth}
                        darken={settings.darkenPreview}
                        darkening={settings.darkening}
                        onHoldPress={(_, index) => handleColorChange(index, false)}
                        onVolumePress={(_, index) => handleColorChange(index, true)}
                        colorsHolds={colorsHolds}
                        colorsVolumes={colorsVolumes}
                        isBuild={true}
                    />
                    <View style={styles.details}>
                        <View style={[CommonStyles.justifiedRow, {marginBottom: 10}]}>
                            {
                                Array.from({length: 6}).map((_, index) => {
                                        let name: string = "circle";
                                        const Icon = index === 5 ? FontAwesome6 : FontAwesome;
                                        if (index === 0) name = "ban";
                                        else if (index === 5) name = "circle-half-stroke";
                                        return (
                                            <TouchableOpacity onPress={() => setSelectedColor(index-1)} key={index}>
                                                {
                                                    selectedColor === index-1 ?
                                                        <View style={styles.iconContainer}>
                                                            <Icon
                                                                name={name as any} size={36}
                                                                 color={index === 0 ? 'black' : numberToStrokeColor(index-1)}
                                                            />
                                                        </View> :
                                                        <Icon
                                                            name={name as any} size={36}
                                                            color={index === 0 ? 'black' : numberToStrokeColor(index-1)}
                                                        />
                                                }
                                            </TouchableOpacity>
                                        )
                                    }
                                )
                            }
                        </View>
                        <TextInput
                            style={CommonStyles.input}
                            placeholder="Jméno"
                            value={boulderName}
                            onChangeText={setBoulderName}
                            maxLength={100}
                        />
                        <TextInput
                            style={CommonStyles.multilineInput}
                            placeholder="Popisek"
                            multiline={true}
                            value={boulderDescription}
                            onChangeText={setBoulderDescription}
                            maxLength={500}
                        />
                        <View style={styles.tagsContainer}>
                            {
                                tags.map(tag =>
                                    <Tag
                                        key={tag.id}
                                        active={selectedTags.includes(tag.id)}
                                        id={tag.id}
                                        name={tag.name}
                                        onPress={() => handleTagPress(tag.id)}
                                    />
                            )}
                        </View>
                    </View>
                    <View style={[CommonStyles.paddedContainerHorizontal, CommonStyles.smallGapped]}>
                        <Button label={"Uložit"} onPress={handleSave}/>
                        {
                            isEditMode ?
                            <Button label={"Zrušit"} onPress={() => {
                                handleCancel();
                                router.back();
                            }} color={Colors.highlight}/> :
                                <Button label={"Smazat"} onPress={handleCancel} color={Colors.highlight}/>
                        }
                    </View>
                </ScrollView>
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    details: {
        padding: 10,
        paddingHorizontal: 25,
        gap: 5,
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
        borderRadius: 15,
        borderWidth: 4,
        borderColor: Colors.primary,
    },
    tagsContainer: {
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
});
