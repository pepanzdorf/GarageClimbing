import { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiURL } from '@/constants/Other';
import { confirmAction, ferrataGradeIdToGradeName } from '@/scripts/utils';
import { UserContext } from "@/context/UserContext";
import { FerrataContext } from "@/context/FerrataContext";
import { FerrataSendType } from "@/types/ferrataSendType";
import Fonts from '@/constants/Fonts';
import Colors from '@/constants/Colors';
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";

export default function FerrataSendsScreen() {
    const { token } = useContext(UserContext);
    const { fetchFerrataStats, ferrataStats } = useContext(FerrataContext);


    const deleteSend = (send: FerrataSendType) => {
        fetch(`${apiURL}/ferrata/send/${send.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(console.error)
            .finally(() => fetchFerrataStats());
    }



    const renderFerrataSend = ({item}: {item: FerrataSendType}) => {
        const sent_date = new Date(item.sent_date);
        const hours = Math.floor(item.time_seconds / 3600);
        const minutes = Math.floor((item.time_seconds % 3600) / 60);
        const seconds = item.time_seconds % 60;


        return (
            <TouchableOpacity onPress={ () =>
                confirmAction(
                    "Vymazat výlez",
                    "Opravdu chcete smazat tento výlez?",
                    () => deleteSend(item)
                )
            }>
                <View style={styles.sendContainer}>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h2}>
                            {item.ferrata_name}
                        </Text>
                    </View>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h3}>
                            {item.username}
                        </Text>
                        <Text style={Fonts.small}>
                            {`${sent_date.toLocaleDateString()} ${sent_date.toLocaleTimeString()}`}
                        </Text>
                    </View>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h3}>
                            Vylezeno: { item.climbed_times } krát
                        </Text>
                    </View>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h3}>
                            Obtížnost: {ferrataGradeIdToGradeName(item.grade)}
                        </Text>
                    </View>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h3}>
                            Doba: {hours === 0 ? '' : hours + ' hodin '}{minutes === 0 ? '' : minutes + ' minut '}{seconds} sekund
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }


    return (
        <SafeAreaView style={CommonStyles.paddedContainer}>
            <FlatList
                data={ferrataStats.sends}
                renderItem={renderFerrataSend}
                keyExtractor={item => String(item.id)}
                ListEmptyComponent={
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={Fonts.h3}>Žádné výlezy</Text>
                    </View>
                }
            />
            <Button label={"Obnovit"} onPress={fetchFerrataStats} color={Colors.ferrataPrimary} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sendContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        borderRadius: 10,
        marginBottom: 8,
        backgroundColor: Colors.darkerBackground,
    },
});