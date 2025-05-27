import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from "react";
import { CrackContext } from "@/context/CrackContext";
import { crackIdToCrackName } from '@/scripts/utils';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";


export default function CrackInfo(){
    const { crackStats } = useContext(CrackContext);
    const [ distanceSums, setDistanceSums ] = useState<{ [key: string]: {[key: string] : number} }>({overallDistance: {value: 0}, horizontal: {}, vertical: {}});
    const router = useRouter();

    const calculateDistanceSums = () => {
        let overallDistance = 0;
        let tempDistanceSums: { [key: string]: {[key: string] : number} } = {horizontal: {value: 0}, vertical: {value: 0}};
        crackStats['users'].forEach((user) => {
            if (user[1]['vertical']) {
                overallDistance += user[1]['overall_distance'];
                for (const [key, value] of Object.entries(user[1]['vertical'])) {
                    if (tempDistanceSums['vertical'][key]) {
                        tempDistanceSums['vertical'][key] += value['climbed_distance'];
                    } else {
                        tempDistanceSums['vertical'][key] = value['climbed_distance'];
                    }
                    tempDistanceSums['vertical']['value'] += value['climbed_distance'];
                }
            }
            if (user[1]['horizontal']) {
                for (const [key, value] of Object.entries(user[1]['horizontal'])) {
                    if (tempDistanceSums['horizontal'][key]) {
                        tempDistanceSums['horizontal'][key] += value['climbed_distance'];
                    } else {
                        tempDistanceSums['horizontal'][key] = value['climbed_distance'];
                    }
                    tempDistanceSums['horizontal']['value'] += value['climbed_distance'];
                }
            }
        });
        setDistanceSums({horizontal: tempDistanceSums['horizontal'], vertical: tempDistanceSums['vertical'], overallDistance: {value: overallDistance}});
    }

    useEffect(() => {
        calculateDistanceSums();
    }, [crackStats]);

    return (
        <SafeAreaView style={CommonStyles.container}>
            <ScrollView>
                <View style={[CommonStyles.header, {backgroundColor: Colors.crackPrimary}]}>
                    <Text style={Fonts.h1}>Garážové lezení - spára</Text>
                </View>
                <View style={[CommonStyles.paddedContainer, CommonStyles.smallGapped]}>
                    <Button label={"Jít na bouldery"} onPress={() => router.push('/(boulder)/(routes)')} />
                    <Button label={"Jít na ferraty"} onPress={() => router.push('/(ferrata)')} color={Colors.ferrataPrimary}/>
                    <Text style={Fonts.h3}>Horizontální spára: </Text>
                    <Text style={Fonts.plainBold}>
                        Horizontální spára je samostojná délky 4 metry. Lze na ní lézt dlaň nebo pěst.
                    </Text>
                    <Text style={Fonts.h3}>Vertikální spára: </Text>
                    <Text style={Fonts.plainBold}>
                        Vertikální spára má 5 metrů. Je nastavitelná, takže na ní lze lézt od prstů až po komín.
                    </Text>
                    <Text style={Fonts.h3}>Vzdálenosti:</Text>
                    <Text style={Fonts.plainBold}>
                        Celková vzdálenost: {distanceSums['overallDistance']['value']} m
                    </Text>
                    <Text style={Fonts.plainBold}>
                        Horizontální spára ⎯
                    </Text>
                    {
                        Object.keys(distanceSums['horizontal']).length > 0 ?
                            Object.entries(distanceSums['horizontal']).map(
                                ([key, value]) =>
                                    <Text style={Fonts.smallBold} key={key}>
                                        {`${key === 'value' ? 'Celkově' : crackIdToCrackName(Number(key)+1)}: ${value} m`}
                                    </Text>
                            ) : null
                    }
                    <Text style={Fonts.plainBold}>
                        Vertikální spára ｜
                    </Text>
                    {
                        Object.keys(distanceSums['vertical']).length > 0 ?
                            Object.entries(distanceSums['vertical']).map(
                                ([key, value]) =>
                                    <Text style={Fonts.smallBold} key={key}>
                                        {`${key === 'value' ? 'Celkově' : crackIdToCrackName(Number(key)+1)}: ${value} m`}
                                    </Text>
                            ) : null
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
