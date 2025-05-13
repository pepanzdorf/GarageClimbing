import { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoulderContext } from "@/context/BoulderContext";
import { SettingsContext } from "@/context/SettingsContext";
import { UserContext } from "@/context/UserContext";
import { apiURL } from '@/constants/Other';
import { gradeIdToGradeName } from '@/scripts/utils';
import { FontAwesome } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list'
import { useRouter } from "expo-router";
import ScrollPicker, {ScrollPickerHandle} from "react-native-wheel-scrollview-picker";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";


export default function CompEditor(){
    const { boulders, fetchCompetitions } = useContext(BoulderContext);
    const { settings } = useContext(SettingsContext);
    const { token } = useContext(UserContext);
    const [ compName, setCompName ] = useState("");
    const [ options, setOptions ] = useState<{ key: number, value: string }[]>([]);
    const [ selected, setSelected ] = useState();
    const [ selectedBoulders, setSelectedBoulders ] = useState<number[]>([-1]);
    const [ selectedGrade, setSelectedGrade ] = useState(0);

    const gradeData = Array.from({length: 53}).map((_, i) => gradeIdToGradeName(i, settings.grading));
    const router = useRouter();
    const scrollRef = useRef<ScrollPickerHandle>(null);

    const handleSave = async () => {
        if (compName === '') {
            alert('Vyplňte jméno turnaje');
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
            const response = await fetch(`${apiURL}/competition`, {
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
                fetchCompetitions();
            } else {
                alert(await response.text());
            }
        } catch (error) {
            console.error(error);
            alert('Server error');
        }
    }

    const handleSelect = (index: number) => {
        if (!selected) return;
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
        setSelected(undefined);
        setSelectedGrade(0);
        scrollRef.current && scrollRef.current.scrollToTargetIndex(0);
        router.back();
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
        <SafeAreaView style={CommonStyles.paddedContainer}>
            <ScrollView>
                <View style={[CommonStyles.justifiedRow, {alignItems: 'center'}]}>
                    <TextInput
                        style={[CommonStyles.input, {flex: 1, marginRight: 20}]}
                        placeholder="Jméno"
                        value={compName}
                        onChangeText={setCompName}
                        maxLength={100}
                    />
                    <View>
                        <Text style={Fonts.h3}>Obtížnost:</Text>
                        <ScrollPicker
                            ref={scrollRef}
                            dataSource={gradeData}
                            selectedIndex={0}
                            wrapperHeight={50}
                            wrapperBackground={Colors.background}
                            itemHeight={25}
                            highlightColor={Colors.border}
                            highlightBorderWidth={2}
                            itemTextStyle={Fonts.h3}
                            activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                            onValueChange={(_, index) => setSelectedGrade(index)}
                        />
                    </View>
                </View>
                <View style={CommonStyles.smallGapped}>
                    <Text style={Fonts.h3}>Bouldery:</Text>
                    { renderBoulderSelects() }
                    <View style={CommonStyles.justifiedRow}>
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
            <View style={CommonStyles.smallGapped}>
                <Button label={"Uložit"} onPress={handleSave} />
                <Button label={"Zrušit"} onPress={() => router.back()} />
            </View>
        </SafeAreaView>
    );
};
