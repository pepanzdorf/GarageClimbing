import { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiURL } from '@/constants/Other';
import { confirmAction, crackIdToCrackName } from '@/scripts/utils';
import { UserContext } from "@/context/UserContext";
import { CrackContext } from "@/context/CrackContext";
import { CrackSendType } from "@/types/crackSendType";
import Fonts from '@/constants/Fonts';
import Colors from '@/constants/Colors';
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";


export default function CrackSendsScreen() {
    const { token } = useContext(UserContext);
    const { fetchCrackStats, crackStats } = useContext(CrackContext);


    const deleteSend = (send: CrackSendType) => {
        fetch(`${apiURL}/crack/send/${send.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => response.text())
            .then(jsonResponse => alert(jsonResponse))
            .catch(console.error)
            .finally(() => fetchCrackStats());
    }


    const renderCrackSend = ({item}: {item: CrackSendType}) => {
        const sent_date = new Date(item.sent_date);

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
                        <Text style={Fonts.h3}>
                            {item.username}
                        </Text>
                        <Text style={Fonts.h3}>
                            { item.is_vertical ? "Vertikální" : "Horizontální" }
                        </Text>
                    </View>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.small}>
                            {`${sent_date.toLocaleDateString()} ${sent_date.toLocaleTimeString()}`}
                        </Text>
                    </View>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h3}>
                            { item.climbed_times + " krát" }
                        </Text>
                        <Text style={Fonts.h3}>
                            {crackIdToCrackName(item.crack_type + 1)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }


    return (
        <SafeAreaView style={CommonStyles.paddedContainer}>
            <SectionList
                sections={crackStats.sends}
                renderItem={renderCrackSend}
                renderSectionHeader={({ section: { date } }) => (
                    <View style={{ padding: 10, alignItems: 'center' }}>
                        <Text style={Fonts.h1}>{date}</Text>
                    </View>
                )}
                keyExtractor={item => String(item.id)}
                ListEmptyComponent={
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={Fonts.h3}>Žádné výlezy</Text>
                    </View>
                }
            />
            <Button label={"Obnovit"} onPress={fetchCrackStats} color={Colors.crackPrimary} />
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