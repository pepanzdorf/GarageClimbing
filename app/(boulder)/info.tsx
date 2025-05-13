import { useContext, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Linking, Image, Modal, Pressable } from 'react-native';
import { BoulderContext } from '@/context/BoulderContext';
import { SettingsContext } from '@/context/SettingsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradeIdToGradeName } from '@/scripts/utils';
import { BoulderWall } from '@/components/BoulderWall';
import { HoldType } from "@/types/holdType";
import { useRouter } from 'expo-router';
import Button from "@/components/HorizontalButton";
import Table from "@/components/Table";
import CommonStyles from "@/constants/CommonStyles";
import * as Application from 'expo-application';
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'

export default function Info(){
    const { holds, boulders, stats, setCurrentBoulder, builderStats } = useContext(BoulderContext);
    const { settings, wallConfig } = useContext(SettingsContext);
    const [ nHolds, setNHolds ] = useState(0);
    const [ nVolumes, setNVolumes ] = useState(0);
    const [ bouldersByGrade, setBouldersByGrade ] = useState<{[key: string]: number}>({});
    const [ tableData, setTableData ] = useState<string[][]>([[]]);
    const [ savings, setSavings ] = useState(0);
    const [ overallSends, setOverallSends ] = useState(0);
    const [ modalVisible, setModalVisible ] = useState(false);
    const [ pressedHold, setPressedHold ] = useState<HoldType>();


    const router = useRouter();

    const makeTableData = () => {
        let data = [['V', 'Font', 'YDS', 'French sport', 'Melda-scale']];
        for (let i = 0; i < 53; i += 1) {
            const rowData = [];
            for (let j = 0; j < 5; j += 1) {
                rowData.push(gradeIdToGradeName(i, j));
            }
            data.push(rowData);
        }
        setTableData(data);
    }


    const calculateBouldersByGrade = useCallback(() => {
        let bbg: { [key: number]: number } = {};
        if (!boulders) {
            return;
        }
        boulders.forEach((boulder) => {
            if (bbg[boulder.average_grade]) {
                bbg[boulder.average_grade] += 1;
            } else {
                bbg[boulder.average_grade] = 1;
            }
        });
        setBouldersByGrade(bbg);
    }, [boulders]);


    const calculateSends = useCallback(() => {
        let sends = 0;
        stats['users'].forEach((user) => {
            sends += user[1]['all_sends'];
        });
        setOverallSends(sends);
    }, [stats]);


    const calculateSavings = useCallback(() => {
        let savings = 0;
        stats['users'].forEach((user) => {
            savings += user[1]['sessions']['overall'] * 200;
        });
        setSavings(savings);
    }, [stats]);


    const handleReroute = (boulderId: number) => {
        const clickedBoulder = boulders.find(boulder => boulder.id === boulderId);
        setCurrentBoulder(clickedBoulder);
        setModalVisible(false);
        router.push(`/${boulderId}`);
    }


    const renderBoulderInfo = (boulder: string[]) => {
        return (
            <Pressable
                key={boulder[2]}
                onPress={() => handleReroute(Number(boulder[2]))}
                style={({ pressed }) => [{opacity: pressed ? 0.5 : 1}]}
            >
                <Text style={{fontSize: 18}}>{boulder[0]} - {gradeIdToGradeName(Number(boulder[1]), settings.grading)}</Text>
            </Pressable>
        );
    }


    const createHoldInfo = (hold: HoldType) => {
        const tops = hold.types_counts['0'] ? hold.types_counts['0'] : 0;
        const feet = hold.types_counts['1'] ? hold.types_counts['1'] : 0;
        const middle = hold.types_counts['2'] ? hold.types_counts['2'] : 0;
        const starts = hold.types_counts['3'] ? hold.types_counts['3'] : 0;
        const count = hold.total_count ? hold.total_count : 0;
        const message =
            `Vyskytuje se v ${count} boulderech\nTop: ${tops}\nNoha: ${feet}\nRuka: ${middle}\nStart: ${starts}\n\nBouldery:\n`;

        return (
            <ScrollView>
                <View style={styles.modalView}>
                    <Text style={Fonts.h1}>Stisknut chyt ID: {hold.id}</Text>
                    <Text style={Fonts.h3}>{message}</Text>
                    {
                        count > 0 &&
                        hold['boulders'].map(boulder => renderBoulderInfo(boulder))
                    }
                </View>
            </ScrollView>
        );
    }


    useEffect(() => {
        if (holds && holds['volumes'] && holds['holds']) {
            setNHolds(holds['holds'].length);
            setNVolumes(holds['volumes'].length);
        }
    }
    , [holds]);

    useEffect(() => {
        calculateBouldersByGrade();
    }
    , [boulders, calculateBouldersByGrade]);

    useEffect(() => {
        makeTableData();
    }, []);

    useEffect(() => {
        stats && calculateSavings();
        stats && calculateSends();
    }, [stats, calculateSavings, calculateSends]);

    return (
        <SafeAreaView style={CommonStyles.container}>
            <ScrollView>
                <View style={CommonStyles.header}>
                    <Text style={Fonts.h1}>
                        Garážové lezení
                    </Text>
                </View>
                <View style={[CommonStyles.paddedContainer, CommonStyles.smallGapped]}>
                    <Button label="Jít na spáru" onPress={() => router.push('/(crack)')} color={Colors.crackPrimary}/>
                    <Button label="Jít na ferraty" onPress={() => router.push('/(ferrata)')} color={Colors.ferrataPrimary}/>
                    <View>
                        <Text style={Fonts.h3}>Youtube: </Text>
                        <Text
                            style={styles.link}
                            onPress={() => Linking.openURL('https://www.youtube.com/@KokosKokosovic')}
                        >
                            https://www.youtube.com/@KokosKokosovic
                        </Text>
                    </View>
                    <View>
                        <Text style={Fonts.h3}>Počet chytů: </Text>
                        {
                            holds && (<Text style={Fonts.plainBold}>{nHolds}</Text>)
                        }
                    </View>
                    <View>
                        <Text style={Fonts.h3}>Počet struktur: </Text>
                        {
                            holds && (<Text style={Fonts.plainBold}>{nVolumes}</Text>)
                        }
                    </View>
                    <View>
                        <Text style={Fonts.h3}>Počet boulderů: </Text>
                        {
                            boulders && (<Text style={Fonts.plainBold}>{boulders.length}</Text>)
                        }
                    </View>
                    <View>
                        <Text style={Fonts.h3}>Počet výlezů: </Text>
                        {
                            stats && (<Text style={Fonts.plainBold}>{overallSends}</Text>)
                        }
                    </View>
                    <View>
                        <Text style={Fonts.h3}>Aktuální úhel stěny: </Text>
                        {
                            wallConfig && (<Text style={Fonts.plainBold}>{wallConfig.angle}˚</Text>)
                        }
                    </View>
                    <View>
                        <Text style={Fonts.h3}>Počet lezení: </Text>
                        {
                            stats && (<Text style={Fonts.plainBold}>{stats['sessions']['overall']}</Text>)
                        }
                    </View>
                    <View>
                        <Text style={Fonts.h3}>Ušetřeno za vstupné: </Text>
                        {
                            stats && (<Text style={Fonts.plainBold}>{savings} Kč</Text>)
                        }
                    </View>
                    <BoulderWall
                        holds={holds}
                        darken={settings.darkenPreview}
                        darkening={settings.darkening}
                        lineWidth={settings.lineWidth}
                        isInfo={true}
                        onHoldPress={(hold) => {
                            setPressedHold(hold as HoldType);
                            setModalVisible(true);
                        }}
                    />
                    {
                        boulders && (
                            <View style={CommonStyles.smallGapped}>
                                <Text style={Fonts.h3}>Počet boulderů podle obtížnosti: </Text>
                                {
                                    Object.keys(bouldersByGrade).map((grade: string) =>
                                        {
                                            return (
                                                <View style={CommonStyles.justifiedRow} key={grade}>
                                                    <Text style={Fonts.plainBold}>
                                                        {gradeIdToGradeName(Number(grade), settings.grading)}
                                                    </Text>
                                                    <Text style={Fonts.plainBold}>{bouldersByGrade[grade]}</Text>
                                                </View>
                                            )
                                        }
                                    )
                                }
                            </View>
                        )
                    }
                    {
                        builderStats && (
                            <View style={CommonStyles.smallGapped}>
                                <Text style={Fonts.h3}>Počet postavených boulderů (průměrné hodnocení):</Text>
                                {
                                    Object.entries(builderStats)
                                        .sort((a, b) => b[1].count - a[1].count)
                                        .map((builder) =>
                                        {
                                            return (
                                                <View style={CommonStyles.justifiedRow} key={builder[0]}>
                                                    <Text style={Fonts.plainBold}>{builder[0]}</Text>
                                                    <Text style={Fonts.plainBold}>
                                                        {builder[1].count} ({builder[1].average_rating})
                                                    </Text>
                                                </View>
                                            )
                                        }
                                    )
                                }
                            </View>
                        )
                    }
                    <Table data={tableData} />
                    <Image
                        source={require("../../assets/images/icon.png")}
                        style={{width: '100%', height: undefined, aspectRatio: 1}}
                    />
                    <View>
                        <Text style={Fonts.h3}>Autor aplikace:</Text>
                        <Text style={Fonts.plainBold}>Melichar Konečný</Text>
                    </View>
                    <View>
                        <Text style={Fonts.h3}>Verze aplikace:</Text>
                        <Text style={Fonts.plainBold}>{Application.nativeApplicationVersion}</Text>
                    </View>
                </View>
            </ScrollView>

            <Modal visible={modalVisible}>
                {pressedHold && createHoldInfo(pressedHold)}
                <Button label={"OK"} onPress={() => setModalVisible(false)} />
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    link: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
});
