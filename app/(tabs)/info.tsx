import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Linking, Dimensions, ImageBackground, Image, Alert, Modal, TouchableOpacity } from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'
import { gradeIdToGradeName } from '../../scripts/utils';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Svg, Path, Rect, ClipPath, Defs, G, Use, Mask, Pattern, Line } from 'react-native-svg'
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { useRouter } from 'expo-router';


export default function Info(){
    const { holds, boulders, stats, wallImage, settings, wallConfig, setCurrentBoulder } = useContext(GlobalStateContext);
    const [ nHolds, setNHolds ] = useState(0);
    const [ nVolumes, setNVolumes ] = useState(0);
    const [ bouldersByGrade, setBouldersByGrade ] = useState({});
    const [ maxCount, setMaxCount ] = useState(0);
    const [ tableHead, setTableHead ] = useState(['V', 'Font', 'YDS', 'French sport', 'Melda-scale']);
    const [ tableData, setTableData ] = useState();
    const [ savings, setSavings ] = useState(0);
    const [ modalVisible, setModalVisible ] = useState(false);
    const [ pressedHold, setPressedHold ] = useState();

    const windowAspectRatio = Dimensions.get('window').width / Dimensions.get('window').height;
    const tabBarHeight = useBottomTabBarHeight();
    const maxHeight = Dimensions.get('window').height - tabBarHeight*3;
    const imageAspectRatio = 820.5611 / 1198.3861;
    const isImageWider = windowAspectRatio < imageAspectRatio;
    const zoomableViewRef = React.createRef<ReactNativeZoomableView>();
    const router = useRouter();

    const makeTableData = () => {
        let data = [];
        for (let i = 0; i < 53; i += 1) {
            const rowData = [];
            for (let j = 0; j < 5; j += 1) {
                rowData.push(gradeIdToGradeName(i, j));
            }
            data.push(rowData);
        }
        setTableData(data);
    }

    const getColorForValue = (value, min, max) => {
        let normalizedValue = Math.log(value - min + 1) / Math.log(max - min + 1);
        let hue = 240 - Math.round(240 * normalizedValue);

        return ["hsl(", hue, ",100%,50%)"].join("");
    }

    const calculateMaxCount = () => {
        let mc = 0;
        holds['false'].forEach((hold) => {
            if (calcHoldCount(hold) > mc) {
                mc = calcHoldCount(hold);
            }
        });
        setMaxCount(mc);
    }

    const calcHoldCount = (hold) => {
        let count = 0;
        Object.keys(hold.types_counts).forEach((key) => {
            count += hold.types_counts[key];
        });
        return count;
    }

    const calculateBouldersByGrade = () => {
        let bbg = {};
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
    }

    const calculateSends = () => {
        let sends = 0;
        stats['users'].forEach((user) => {
            sends += user[1]['all_sends'];
        });
        return sends;
    }

    const calculateSavings = () => {
        let savings = 0;
        if (!stats) {
            return;
        }
        stats['users'].forEach((user) => {
            savings += user[1]['sessions']['overall'] * 200;
        });
        setSavings(savings);
    }

    const handleReroute = (boulder_id) => {
        const clickedBoulder = boulders.find(boulder => boulder.id == boulder_id);
        setCurrentBoulder(clickedBoulder);
        setModalVisible(false);
        router.push(`${boulder_id}`);
    }

    const renderBoulderInfo = (boulder) => {
        return (
            <TouchableOpacity key={boulder[2]} onPress={() => handleReroute(boulder[2])}>
                <View>
                    <Text style={{fontSize: 18}}>{boulder[0]} - {gradeIdToGradeName(boulder[1], settings.grading)}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    const createHoldInfo = (hold) => {
        const tops = hold.types_counts['0'] ? hold.types_counts['0'] : 0;
        const feet = hold.types_counts['1'] ? hold.types_counts['1'] : 0;
        const middle = hold.types_counts['2'] ? hold.types_counts['2'] : 0;
        const starts = hold.types_counts['3'] ? hold.types_counts['3'] : 0;
        const count = tops + feet + middle + starts;
        let message = `Vyskytuje se v ${count} boulderech\nTop: ${tops}\nNoha: ${feet}\nRuka: ${middle}\nStart: ${starts}\n\nBouldery:\n`;

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
        if (holds && holds['true'] && holds['false']) {
            setNHolds(holds['false'].length);
            setNVolumes(holds['true'].length);
            calculateMaxCount();
        }
    }
    , [holds]);

    useEffect(() => {
        calculateBouldersByGrade();
    }
    , [boulders]);

    useEffect(() => {
        makeTableData();
    }, []);

    useEffect(() => {
        calculateSavings();
    }, [stats]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={Fonts.h1}>Garážové lezení</Text>
                </View>
                <View style={styles.info}>
                    <TouchableOpacity onPress={() => router.navigate('/(crack)/log')}>
                        <View style={styles.crackLink}>
                            <Text style={Fonts.h3}>Jít na spáru</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Youtube: </Text>
                        <Text style={styles.link} onPress={() => Linking.openURL('https://www.youtube.com/@KokosKokosovic')}>https://www.youtube.com/@KokosKokosovic</Text>
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Počet chytů: </Text>
                        {
                            holds && (<Text style={Fonts.plainBold}>{nHolds}</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Počet struktur: </Text>
                        {
                            holds && (<Text style={Fonts.plainBold}>{nVolumes}</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Počet boulderů: </Text>
                        {
                            boulders && (<Text style={Fonts.plainBold}>{boulders.length}</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Počet výlezů: </Text>
                        {
                            stats && (<Text style={Fonts.plainBold}>{calculateSends()}</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Aktuální úhel stěny: </Text>
                        {
                            wallConfig && (<Text style={Fonts.plainBold}>{wallConfig.angle}˚</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Počet lezení: </Text>
                        {
                            stats && (<Text style={Fonts.plainBold}>{stats['sessions']['overall']}</Text>)
                        }
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Ušetřeno za vstupné: </Text>
                        {
                            stats && (<Text style={Fonts.plainBold}>{savings} Kč</Text>)
                        }
                    </View>
                    {
                        maxCount > 0 &&
                        <ReactNativeZoomableView
                            ref={zoomableViewRef}
                            maxZoom={20}
                            minZoom={1}
                            initialZoom={1}
                            bindToBorders={true}
                            onZoomAfter={this.logOutZoomState}
                            disablePanOnInitialZoom={true}
                            onDoubleTapAfter={() => zoomableViewRef.current!.zoomTo(1)}
                            style={{flex: 1}}
                            key={maxCount}
                        >
                            <View style={{maxHeight: maxHeight}}>
                                <ImageBackground style={isImageWider ? styles.backgroundImageWider : styles.backgroundImageHigher } source={{uri: `data:image/png;base64,${wallImage}`}}>
                                    <Svg style={styles.svgContainer} height="100%" width="100%" viewBox="0 0 820.5611 1198.3861">
                                        <Defs>
                                            <G id="holds">
                                                {holds["false"].map((hold) => (
                                                    <Path
                                                        key={hold.hold_id}
                                                        fill= 'none'
                                                        stroke={getColorForValue(calcHoldCount(hold), 0, maxCount)}
                                                        strokeWidth={settings.lineWidth}
                                                        d={hold.path}
                                                        onPress={() => {setModalVisible(true); setPressedHold(hold);}}
                                                    />
                                                ))}
                                            </G>
                                            <ClipPath id="clip_holds">
                                                <Use href="#holds" />
                                            </ClipPath>
                                            <Mask id="mask_holds">
                                                <Rect x="0" y="0" width="100%" height="100%" fill="white" />
                                                <Rect x="0" y="0" width="100%" height="100%" fill="black" clipPath="url(#clip_holds)" clipRule="nonzero" />
                                            </Mask>
                                            <Pattern id="hatch" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                                                <Line x1="0" y1="0" x2="0" y2="10" stroke="black" strokeWidth="5" />
                                            </Pattern>
                                        </Defs>
                                        <Rect
                                            x="0" y="0" width="100%" height="100%"
                                            opacity={settings.darkenPreview ? settings.darkening : 0}
                                            fill="black"
                                            mask="url(#mask_holds)"
                                        />
                                        <Use href="#holds" mask="url(#mask_holds)"/>
                                        {
                                            Array(maxCount).fill(0).map((_, i) => (
                                                <Rect
                                                    key={i}
                                                    x="0" y={i*10}
                                                    width="20" height="10"
                                                    fill={getColorForValue(i, 0, maxCount)}
                                                />
                                            ))
                                        }
                                    </Svg>
                                </ImageBackground>
                            </View>
                        </ReactNativeZoomableView>
                    }
                    {
                        boulders && (
                            <View>
                                <Text style={Fonts.h3}>Počet boulderů podle obtížnosti: </Text>
                                {
                                    Object.keys(bouldersByGrade).map((grade) =>
                                        {
                                            return (
                                                <View style={styles.row} key={grade}>
                                                    <Text style={Fonts.plainBold}>{gradeIdToGradeName(grade, settings.grading)}</Text>
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
                        tableData &&
                        <View style={styles.container}>
                            <Table borderStyle={{borderWidth: 2, borderColor: Colors.borderDark}}>
                                <Row data={tableHead}/>
                                <Rows data={tableData}/>
                            </Table>
                        </View>
                    }
                    <Image source={require("../../assets/images/icon.png")} style={{width: '100%', height: undefined, aspectRatio: 1}}/>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Autor aplikace: </Text>
                        <Text style={Fonts.plainBold}>Melichar Konečný</Text>
                    </View>
                    <View style={styles.field}>
                        <Text style={Fonts.h3}>Verze aplikace: </Text>
                        <Text style={Fonts.plainBold}>1.1.6</Text>
                    </View>
                </View>
            </ScrollView>

            <Modal visible={modalVisible}>
                {pressedHold && createHoldInfo(pressedHold)}
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <View style={styles.button}>
                        <Text style={styles.textStyle}>OK</Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    info: {
        marginTop: 20,
        flex: 1,
        textAlign: 'center',
        padding: 10,
        paddingLeft: 30,
        paddingRight: 30,
        gap: 20,
    },
    header: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
        marginBottom: 20,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    link: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    field: {
    },
    backgroundImageHigher: {
        resizeMode:'contain',
        width: undefined,
        height: '100%',
        aspectRatio: 820.5611 / 1198.3861,
    },
    backgroundImageWider: {
        resizeMode:'contain',
        width: '100%',
        height: undefined,
        aspectRatio: 820.5611 / 1198.3861,
    },
    modalView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 10,
        margin: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    crackLink: {
        flex: 1,
        marginBottom: 20,
        backgroundColor: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});
