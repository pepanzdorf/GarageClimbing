import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStateContext } from '../context';
import { apiURL } from '../../constants/Other';
import { gradeIdToGradeName } from '../../scripts/utils';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'
import { FontAwesome } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list'
import ScrollPicker from "react-native-wheel-scrollview-picker";


export default function NewComp(){
    const { boulders, settings, token } = useContext(GlobalStateContext);
    const [ compName, setCompName ] = useState("");
    const [ options, setOptions ] = useState([]);
    const [ selected, setSelected ] = useState(null);
    const [ selectedBoulders, setSelectedBoulders ] = useState([-1]);
    const [ selectedGrade, setSelectedGrade ] = useState(0);

    const gradeData = Array(53).fill().map((_, i) => gradeIdToGradeName(i, settings.grading));

    const handleSave = async () => {
        if (compName === '') {
            alert('Vyplňte jméno boulderu');
            return;
        }
        if (selectedBoulders.includes(-1)) {
            alert('Vyplňte všechny bouldery')
            return;
        }

        const comp = {
            name: compName,
            grade: selectedGrade,
            boulders: selectedBoulders,
            edit: false,
            cid: null,
        }

        try {
            const response = await fetch(`${apiURL}/climbing/competition`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(comp),
            });
            if (response.ok) {
                alert('Comp byl úspěšně uložen');
                handleCancel();
            } else {
                alert(await response.text());
            }
        } catch (error) {
            console.log
            alert('Server error');
        }
    }

    const handleSelect = (index) => {
        let newSelectedBoulders = selectedBoulders;
        newSelectedBoulders[index] = selected;
        setSelectedBoulders(newSelectedBoulders);
    }

    const renderBoulderSelects = () => {
        let selects = [];
        for (let i = 0; i < selectedBoulders.length; i++) {
            selects.push(
                <SelectList
                    onSelect={() => handleSelect(i)}
                    setSelected={setSelected}
                    searchPlaceholder="Hledat..."
                    placeholder="Vyberte boulder"
                    data={options}
                    save="key"
                    key={i}
                />
            );
        }
        return selects;
    }

    const handleCancel = () => {
        setCompName("");
        setSelectedBoulders([-1]);
        setSelected(null);
        setSelectedGrade(0);
    }

    useEffect(() => {
        setOptions(boulders.sort((a, b) => a.name.localeCompare(b.name)).map((boulder) => {
            return {
                key: boulder.id,
                value: boulder.name,
            }
        }));
    }, [boulders]);


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.details}>
                    <View style={styles.row}>
                        <TextInput
                            style={styles.input}
                            placeholder="Jméno"
                            value={compName}
                            onChangeText={setCompName}
                        />
                        <View style={styles.picker}>
                            <Text style={Fonts.h3}>Obtížnost:</Text>
                            <ScrollPicker
                                dataSource={gradeData}
                                selectedIndex={0}
                                wrapperHeight={50}
                                wrapperBackground={Colors.background}
                                itemHeight={30}
                                highlightColor={Colors.border}
                                highlightBorderWidth={2}
                                itemTextStyle={Fonts.h3}
                                activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                                onValueChange={(_, index) => setSelectedGrade(index)}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.boulders}>
                    <Text style={Fonts.h3}>Bouldery:</Text>
                    { renderBoulderSelects() }
                    <View style={styles.row}>
                        <FontAwesome name="trash" size={40} color={Colors.highlight}
                            onPress={() => {
                                    if (selectedBoulders.length > 1) {
                                        const newSelectedBoulders = [...selectedBoulders];
                                        newSelectedBoulders.pop();
                                        setSelectedBoulders(newSelectedBoulders);
                                    }
                                }
                            }
                        />
                        <FontAwesome name="plus" size={40} color={Colors.primary} onPress={() => setSelectedBoulders([...selectedBoulders, -1])}/>
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity onPress={handleSave}>
                <View style={styles.button}>
                    <Text style={Fonts.h3}>Uložit</Text>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flexDirection:"row",
        justifyContent: "space-between",
        alignItems: "center",
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
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderColor: Colors.borderDark,
        borderWidth: 2,
        padding: 10,
        width: "60%"
    },
    details: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        gap: 5,
        marginBottom: 10,
        flex: 1,
    },
    picker: {
        width: "25%",
    },
    boulders: {
        paddingHorizontal: 30,
        gap: 5,
        flex: 1,
    },
});
