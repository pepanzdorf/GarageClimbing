import { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, ScrollView, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiURL } from '@/constants/Other';
import { crackIdToCrackName } from '@/scripts/utils';
import { UserContext } from "@/context/UserContext";
import { CrackContext } from "@/context/CrackContext";
import { ScrollPickerHandle } from "react-native-wheel-scrollview-picker";
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import StyledScrollPicker from "@/components/StyledScrollPicker";
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";
import RowSwitch from "@/components/RowSwitch";


export default function CrackLogScreen() {
    const { token } = useContext(UserContext);
    const { fetchCrackStats } = useContext(CrackContext);
    const [ isVertical, setIsVertical ] = useState(true);
    const [ selectedCrackType, setSelectedCrackType ] = useState(0);
    const [ selectedWholeTimes, setSelectedWholeTimes ] = useState(0);
    const [ selectedDecimalTimes, setSelectedDecimalTimes ] = useState(0);

    const crackTypeData = Array.from({length: 6}).map((_, i) => crackIdToCrackName(i));
    const horizontalCrackTypeData = crackTypeData.slice(0, 3);
    const wholeTimesData = Array.from({length: 52}).map((_, i) => i === 0 ? "-" : `${i-1}.`);
    const decimalTimesData = Array.from({length: 11}).map((_, i) => i === 0 ? "-" : i-1);
    const typeRef = useRef<ScrollPickerHandle>(null);
    const wholeRef = useRef<ScrollPickerHandle>(null);
    const decimalRef = useRef<ScrollPickerHandle>(null);


    const logSend = async () => {
        if (selectedCrackType === 0) {
            alert("Musíte zadat typ spáry.");
            return;
        }
        if (selectedWholeTimes === 0) {
            alert("Musíte zadat počet vylezení.");
            return;
        }
        if (selectedDecimalTimes === 0) {
            alert("Musíte zadat počet vylezení.");
            return;
        }
        const response = await fetch(`${apiURL}/crack/log_send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                is_vertical: isVertical,
                crack_type: selectedCrackType-1,
                whole_times: selectedWholeTimes-1,
                decimal_times: selectedDecimalTimes-1,
            }),
        })
        const jsonResponse = await response.text();
        if (!response.ok) {
            alert(jsonResponse);
            return;
        } else {
            alert("Zápis byl úspěšný.");
            setDefaults();
            fetchCrackStats();
        }
    }

    const setDefaults = () => {
        setSelectedCrackType(0);
        setSelectedWholeTimes(0);
        setSelectedDecimalTimes(0);
        setTimeout(() => {
            typeRef.current && typeRef.current.scrollToTargetIndex(0);
            wholeRef.current && wholeRef.current.scrollToTargetIndex(0);
            decimalRef.current && decimalRef.current.scrollToTargetIndex(0);
        }, 0);
    }


    useEffect(() => {
        setDefaults();
    }, []);

    useEffect(() => {
        setDefaults();
    }, [isVertical]);


    return (
        <SafeAreaView style={CommonStyles.paddedContainer}>
            <ScrollView contentContainerStyle={[CommonStyles.centered, CommonStyles.smallGapped]}>
                <Text style={Fonts.h3}>
                    Orientace spáry:
                </Text>
                <RowSwitch
                    label={"Horizontální"}
                    endLabel={"Vertikální"}
                    value={isVertical}
                    onValueChange={setIsVertical}
                    color={Colors.crackPrimary}
                />
                <StyledScrollPicker
                    ref={typeRef}
                    name={"Typ spáry:"}
                    data={isVertical ? crackTypeData : horizontalCrackTypeData}
                    selectedIndex={selectedCrackType}
                    onValueChange={(_, index) => setSelectedCrackType(index)}
                    color={Colors.crackPrimary}
                    centered={true}
                />
                <Text style={Fonts.h3}>Spára vylezena:</Text>
                <Text style={Fonts.plain}>(kolikrát, druhý výběr je desetinná část)</Text>
                <View style={CommonStyles.row}>
                    <StyledScrollPicker
                        ref={wholeRef}
                        data={wholeTimesData}
                        selectedIndex={selectedWholeTimes}
                        onValueChange={(_, index) => setSelectedWholeTimes(index)}
                        color={Colors.crackPrimary}
                        width={'25%'}
                    />
                    <StyledScrollPicker
                        ref={decimalRef}
                        data={decimalTimesData}
                        selectedIndex={selectedDecimalTimes}
                        onValueChange={(_, index) => setSelectedDecimalTimes(index)}
                        color={Colors.crackPrimary}
                        width={'25%'}
                    />
                </View>
            </ScrollView>
            <Button label={"Odeslat"} onPress={logSend} color={Colors.crackPrimary}/>
        </SafeAreaView>
    );
}
