import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";


export default function FerrataInfo(){
    const router = useRouter();

    return (
        <SafeAreaView style={CommonStyles.container}>
            <ScrollView>
                <View style={[CommonStyles.header, {backgroundColor: Colors.ferrataPrimary}]}>
                    <Text style={Fonts.h1}>Garážové lezení - ferraty</Text>
                </View>
                <View style={[CommonStyles.paddedContainer, CommonStyles.smallGapped]}>
                    <Button label={"Jít na bouldery"} onPress={() => router.push('/(boulder)/(routes)')} />
                    <Button label={"Jít na spáru"} onPress={() => router.push('/(crack)')} color={Colors.crackPrimary}/>
                    <Text style={Fonts.h3}>Via ferrata</Text>
                    <Text style={Fonts.plainBold}>
                        Možnost zápisu výlezů ferrat.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
