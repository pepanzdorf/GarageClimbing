import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";


export default function CrackInfo(){
    const router = useRouter();

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
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
