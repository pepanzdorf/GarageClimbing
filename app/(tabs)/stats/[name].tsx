import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView,Button, FlatList, ImageBackground, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, FontAwesome, Entypo } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { apiURL } from '../../../constants/Other';
import { gradeIdToGradeName, gradeToColor, findBoulderById, playSound } from '../../../scripts/utils';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';


export default function UserStats() {
    const { name } = useLocalSearchParams();
    const { stats, settings, loggedUser, token, boulders, fetchUserStats, setCurrentBoulder } = useContext(GlobalStateContext);
    const router = useRouter();
    const [userStats, setUserStats] = useState(null)
    const [chosenBorder, setChosenBorder] = useState(null)
    const [seasonalModal, setSeasonalModal] = useState(false)
    const [borderModal, setBorderModal] = useState(false)
    const [bouldersModal, setBouldersModal] = useState(false)
    const [chosenSeason, setChosenSeason] = useState(null)
    const [chosenBackground, setChosenBackground] = useState('#DADADA')
    const [borderDimensions, setBorderDimensions] = useState({width: 0, height: 0})
    const [sortedBorders, setSortedBorders] = useState([])
    const [modalBoulders, setModalBoulders] = useState({'boulders': [], 'flashed_boulders': []})

    const borders = [
        {'image': require('../../../assets/images/borders/blank_frame.png'), 'hint': 'zadarmo'}, // free
        {'image': require('../../../assets/images/borders/wood_frame.png'), 'hint': '1000+ bodů'}, // 1000 points
        {'image': require('../../../assets/images/borders/bronze_frame.png'), 'hint': '5000+ bodů'}, // 5000 points
        {'image': require('../../../assets/images/borders/silver_frame.png'), 'hint': '10000+ bodů'}, // 10000 points
        {'image': require('../../../assets/images/borders/gold_frame.png'), 'hint': '20000+ bodů'}, // 20000 points
        {'image': require('../../../assets/images/borders/plat_frame.png'), 'hint': '35000+ bodů'}, // 35000 points
        {'image': require('../../../assets/images/borders/diamond_frame.png'), 'hint': '50000+ bodů'}, // 50000 points
        {'sound': require('../../../assets/audio/dragon_roar.mp3'), 'image': require('../../../assets/images/borders/dragon_frame.png'), 'hint': '75000+ bodů'}, // 75000 points
        {'image': require('../../../assets/images/borders/god_frame.png'), 'hint': '100000+ bodů'}, // 100000 points
        {'image': require('../../../assets/images/borders/dirt_frame.png'), 'hint': ''}, // brokolice V4-, dlouhá housenka V4+, Zimní květináč V4-, zeleninová V4-, Hedvábná stezka V3+
        {'image': require('../../../assets/images/borders/animal_frame.png'), 'hint': ''}, // kozel V3+, Mrtvá ryba V2-, Nabodnuté jablíčko V3-, protáhlá opice V3, Tupé bodliny V3, zvířecí trio V3-, Pro začátek dobrá V3+
        {'image': require('../../../assets/images/borders/mud_frame.png'), 'hint': 'Někdy ten výlez pár pokusů zabere'}, // Mít boulder na 25+ pokusů
        {'image': require('../../../assets/images/borders/stone_frame.png'), 'hint': ''}, // Kamenný pilíř V4+, Malé šutry mezi prsty V5-, Přírodní lehká V4-, Intuitivní rotace V4-, zahřívačka V4-, Čekárnová V4+
        {'sound': require('../../../assets/audio/splash.mp3'), 'image': require('../../../assets/images/borders/water_frame.png'), 'hint': ''}, // Bazénová V4+, Kapka na plachtě V3+, Okapová l+p V4, Po dešti V3+, Procházka v dešti V4-, Tok proudu V3-, Z louže to klouže V4-
        {'image': require('../../../assets/images/borders/muscle_frame.png'), 'hint': ''}, // Dej si spoďák V5+, Školní kampus V4, Rozmáčkni nástup V5+, Pěkná se silovým startem V4-, píďalka na spoďáku V6, Míla a Srštnost V6
        {'sound': require('../../../assets/audio/oof.mp3'), 'image': require('../../../assets/images/borders/bandage_frame.png'), 'hint': ''}, // AU TO BOLÍ V4+, Pěstí loktem a do holeně V4, Rychlá bolest V3+, Uraženej kotník V4+, Dyno trénink V3-
        {'image': require('../../../assets/images/borders/ice_frame.png'), 'hint': 'V zimě se leze nejlépe'}, // 10 sendů v zimě
        {'sound': require('../../../assets/audio/caveman.mp3'), 'image': require('../../../assets/images/borders/caveman_frame.png'), 'hint': ''}, // huuh uggh V4, Krsštl V5, Sss V3, Vzpomínky na minulost V3-
        {'sound': require('../../../assets/audio/wind.mp3'), 'image': require('../../../assets/images/borders/nature_frame.png'), 'hint': ''}, // Definice dřevěnosti V3, Jabloň V4, Přírodní lehká V4-, Přírodní lišta V3, smlsnout malinu V4, Stisky jak dřevo V4, Z jablíčka na jablíčko V3+
        {'image': require('../../../assets/images/borders/christmas_frame.png'), 'hint': 'Proč na Vánoce dávat dárky, když můžeš lézt'}, // christmas climbing 2024
        {'sound': require('../../../assets/audio/lightning.mp3'), 'image': require('../../../assets/images/borders/flash_frame.png'), 'hint': 'Proč lézt dvakrát, když stačí jednou'}, // 50 flashes (unique boulders)
        {'sound': require('../../../assets/audio/saw.mp3'), 'image': require('../../../assets/images/borders/builder_frame.png'), 'hint': 'Lezecká stěna je k ničemu, když na ní nejsou žádné cesty'}, // build 20 boulders
        {'image': require('../../../assets/images/borders/donation_frame.png'), 'hint': '?'}, // For donation
        {'sound': require('../../../assets/audio/ascend.mp3'), 'image': require('../../../assets/images/borders/sun_frame.png'), 'hint': 'Jednou ascendnout nestačí'}, // climb ascension 50 times
        {'image': require('../../../assets/images/borders/hold_frame.png'), 'hint': ''}, // Přímá lehká V1, Jedle za 500 V2, NATAHOVACÍ V3, Kolečko Uno V4, Srdcovka V5, lamač kostí a drtič šlach V6, Projekt: Rozlet orla V7, MarMel 4 V8?
        {'sound': require('../../../assets/audio/frog.mp3'), 'image': require('../../../assets/images/borders/frog_frame.png'), 'hint': ''}, // Podeber a skoč, Dyno trénink, Double dyno, Příjemné koule, Dva kroky, (Ne)skok, nemysli a běž
        {'image': require('../../../assets/images/borders/sushi_frame.png'), 'hint': ''}, // Pro pocit, Dlouhá housenka, Inverzní sněhulák, Nepříjemná Barbora, píďalka na spoďáku
        {'image': require('../../../assets/images/borders/wing_frame.png'), 'hint': 'Okřídlený lezec nohy nepotřebuje'}, // 15 sends with campus challenge
        {'sound': require('../../../assets/audio/minecraft_eating.mp3'), 'image': require('../../../assets/images/borders/bbq_frame.png'), 'hint': '?'}, // Bbq climbing
        {'sound': require('../../../assets/audio/honk.wav'), 'image': require('../../../assets/images/borders/goose_frame.png'), 'hint': 'Stiskni mě 🔊'}, // climb 50 times with goose challenge
        {'image': require('../../../assets/images/borders/sandbag_frame.png'), 'hint': 'Profesionální podceňovač boulderů'}, // rate 10 boulders two grades lower than average
        {'image': require('../../../assets/images/borders/balloon_frame.png'), 'hint': 'Profesionální přeceňovač boulderů'}, // rate 10 boulders two grades higher than average
    ];

    const sortBorders = () => {
        let unlocked = [];
        let locked = [];
        let selected = [];
        for (let i = 0; i < borders.length; i++) {
            if (userStats['border'] == i) {
                selected.push({'id': i, 'data': borders[i]});
            } else if (userStats['unlocked_borders'].includes(i)) {
                unlocked.push({'id': i, 'data': borders[i]});
            } else {
                locked.push({'id': i, 'data': borders[i]});
            }
        }
        setSortedBorders([...selected, ...unlocked, ...locked]);
    }


    const chooseBorder = () => {
        if (!userStats) {
            setChosenBorder(borders[0]);
            setBorderDimensions(Image.resolveAssetSource(borders[0].image))
            return;
        }

        setChosenBorder(borders[userStats['border']]);
        setBorderDimensions(Image.resolveAssetSource(borders[userStats['border']].image))
    }

    const scoreColor = (score) => {
        if (score < 100) return '#DADADA';
        if (score >= 100 && score < 1000) return '#CD7F32';
        if (score >= 1000 && score < 5000) return '#F1D400';
        if (score >= 5000 && score < 10000) return '#32CB88';
        if (score >= 10000 && score < 20000) return '#41EDFF';
        if (score >= 20000 && score < 50000) return '#8E00DB';
        if (score >= 50000) return '#BF2C34';
    }

    const thisUserStats = () => {
        if (stats) {
            stats['users'].forEach((user) => {
                if (user[0] == name) {
                    setUserStats(user[1]);
                }
            });
        }
    }

    const renderBorder = ({item, index}) => {
        if (index == 0) {
            return (
                <TouchableOpacity onPress={() => handleChangeBorder(item.id)} key={item.id}>
                    <View style={{alignItems: 'center', justifyContent: 'center',  borderWidth: 1, backgroundColor: Colors.primary}} key={`image-${item.id}`}>
                        <Image source={item.data.image} style={styles.borderChoice}/>
                    </View>
                </TouchableOpacity>
            )
        }
        if (userStats['unlocked_borders'].includes(item.id)) {
            return (
                <TouchableOpacity onPress={() => handleChangeBorder(item.id)} key={item.id}>
                    <View style={{alignItems: 'center', justifyContent: 'center', borderWidth: 1}} key={`image-${item.id}`}>
                        <Image source={item.data.image} style={styles.borderChoice}/>
                    </View>
                </TouchableOpacity>
            )
        } else {
            let longHint = item.data.hint;
            if (userStats['to_unlock'][item.id]) {
                if (typeof userStats['to_unlock'][item.id] == 'string') {
                    longHint += "\n" + userStats['to_unlock'][item.id];
                } else {
                    for (let i = 0; i < userStats['to_unlock'][item.id].length; i++) {
                        let boulder = findBoulderById(userStats['to_unlock'][item.id][i], boulders);
                        longHint += "\n" + boulder.name + " - " + gradeIdToGradeName(boulder.average_grade, settings.grading);
                    }
                }
            }
            if (item.data.sound) {
                return (
                    <TouchableOpacity onPress={() => playSound('border_sound', item.data.sound)} key={item.id}>
                        <View style={{alignItems: 'center', justifyContent: 'center', borderWidth: 1}} key={`image-${item.id}`}>
                            <Image source={item.data.image} style={styles.borderChoice} blurRadius={50}/>
                            <Text style={[Fonts.plain, {position: 'absolute'}]}>{longHint}</Text>
                        </View>
                    </TouchableOpacity>
                )
            } else {
                return (
                    <View style={{alignItems: 'center', justifyContent: 'center', borderWidth: 1}} key={`image-${item.id}`}>
                        <Image source={item.data.image} style={styles.borderChoice} blurRadius={50}/>
                        <Text style={[Fonts.plain, {position: 'absolute'}]}>{longHint}</Text>
                    </View>
                )
            }
        }
    }

    const handleChangeBorder = (border) => {
        sendBorderChange(border);
        setBorderModal(false);
    }

    const handleIconClick = () => {
        if (chosenBorder.sound) {
            playSound('border_sound', chosenBorder.sound);
        }
        if (loggedUser == name) {
            setBorderModal(true);
        }
    }

    const sendBorderChange = (border_id) => {
        fetch(`${apiURL}/climbing/set_border/${border_id}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response =>  {
            if (response.ok) {
                setChosenBorder(borders[border_id]);
                setBorderDimensions(Image.resolveAssetSource(borders[border_id].image))
                fetchUserStats();
            }
        })
        .catch(error => console.log(error));
    }

    const createGradeSetInfo = (bds) => {
        return (
            <ScrollView>
                <View style={styles.modalView}>
                    <Text style={Fonts.h1}>Vylezené bouldery</Text>
                    {
                        bds.boulders.map(boulder => renderBoulderInfo(boulder, bds.flashed_boulders))
                    }
                </View>
            </ScrollView>
        );
    }

    const renderBoulderInfo = (boulder_id, flashed_boulders) => {
        let boulder = findBoulderById(boulder_id, boulders);
        let tc = 'transparent';
        if (flashed_boulders.includes(boulder_id)) {
            tc = 'gold';
        }

        return (
            <TouchableOpacity key={boulder.id} onPress={() => handleReroute(boulder)}>
                <View style={{backgroundColor: tc}}>
                    <Text style={{fontSize: 18}}>{boulder.name}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    const handleReroute = (boulder) => {
        setCurrentBoulder(boulder);
        setBouldersModal(false);
        router.push(`${boulder.id}`);
    }

    useEffect(() => {
        thisUserStats();
        chooseBorder();
        if (userStats) {
            setChosenBackground(scoreColor(userStats['score']));
            sortBorders();
        }
    }
    , [stats, name]);

    useEffect(() => {
        chooseBorder();
        if (userStats) {
            setChosenBackground(scoreColor(userStats['score']));
            sortBorders();
        }
    }
    , [userStats]);


    return (
        <SafeAreaView style={styles.container}>
            {
                userStats && (
                <View style={{flex:1}}>
                    <View style={[styles.userStats, {backgroundColor: chosenBackground}]}>
                        <ScrollView>
                            <View style={styles.header}>
                                <Text style={Fonts.h1}>{name}</Text>
                            </View>
                            {
                                userStats['icon'] &&
                                <View style={styles.iconContainer}>
                                    <ReactNativeZoomableView
                                        maxZoom={20}
                                        minZoom={1}
                                        initialZoom={1}
                                        bindToBorders={true}
                                        onZoomAfter={this.logOutZoomState}
                                        disablePanOnInitialZoom={true}
                                    >
                                        <TouchableOpacity onPress={handleIconClick}>
                                            <View style={[styles.borderedIcon, {aspectRatio: borderDimensions.width/borderDimensions.height}]}>
                                                <Image source={{uri: apiURL + userStats['icon']}} style={styles.icon}/>
                                                <Image source={chosenBorder.image} style={styles.border}/>
                                            </View>
                                        </TouchableOpacity>
                                    </ReactNativeZoomableView>
                                </View>
                            }
                            {
                                userStats['user_description'] &&
                                <View style={styles.description}>
                                    <Text style={Fonts.plainBold}>{userStats['user_description']}</Text>
                                </View>
                            }
                            <View style={styles.genericStats}>
                                <Text style={Fonts.h3}>Skóre (sezóna):</Text>
                                <Text style={Fonts.plainBold}>{userStats['score']}</Text>
                                <Text style={Fonts.h3}>Skóre (historicky):</Text>
                                <Text style={Fonts.plainBold}>{userStats['overall_score']}</Text>
                                <Text style={Fonts.h3}>Počet lezení:</Text>
                                <Text style={Fonts.plainBold}>{userStats['sessions']['overall']}/{stats['sessions']['overall']}</Text>
                                <Text style={Fonts.h3}>Počet lezení (sezóna):</Text>
                                <Text style={Fonts.plainBold}>{userStats['sessions']['current']}/{stats['sessions']['current']}</Text>
                                <Text style={Fonts.h3}>Počet výlezů (i duplicitní):</Text>
                                <Text style={Fonts.plainBold}>{userStats['all_sends']}</Text>
                                <Text style={Fonts.h3}>Splněných výzev (unikátní):</Text>
                                <Text style={Fonts.plainBold}>{userStats['challenges']}</Text>
                                <View style={{flexDirection:"row", flexWrap: 'wrap'}}>
                                    {
                                        userStats['completed_grades'].map((value) => {
                                            return (
                                                <View style={styles.awardContainer} key={value}>
                                                    <View>
                                                        <FontAwesome5 name="award" size={40} color={gradeToColor(value)} />
                                                    </View>
                                                    <View style={{position: 'absolute', top: 4}}>
                                                        <Text style={Fonts.plainBold}>
                                                            V{value}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )
                                        })
                                    }
                                </View>
                                <View style={{flexDirection:"row", flexWrap: 'wrap'}}>
                                    {
                                        userStats['previous_seasons'] &&
                                        Object.keys(userStats['previous_seasons']).map((key) => {
                                            return (
                                                <TouchableOpacity key={key} onPress={() => {setChosenSeason(key); setSeasonalModal(true)}}>
                                                    <View style={styles.awardContainer}>
                                                        <View>
                                                            <Entypo name="trophy" size={40} color={scoreColor(userStats['previous_seasons'][key]['score'])} />
                                                        </View>
                                                        <View style={{position: 'absolute', top: 2}}>
                                                            <Text style={Fonts.small}>
                                                                {key.split(' ')[0]}
                                                            </Text>
                                                        </View>
                                                        <View style={{position: 'absolute', top: 16}}>
                                                            <Text style={Fonts.small}>
                                                                {key.split(' ')[1]}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>
                            </View>
                            <View style={{gap: 5}}>
                                {
                                    Object.keys(userStats['unique_sends']).map((key) => {
                                        return (
                                            <TouchableOpacity key={key} onPress={() => {
                                                    setModalBoulders({'boulders': userStats['unique_sends'][key]['boulders'],
                                                            'flashed_boulders': userStats['unique_sends'][key]['flashed_boulders']});
                                                    setBouldersModal(true)}}>
                                                <View key={key} style={styles.boulderStatsContainer}>
                                                    <Text style={Fonts.h3}>{gradeIdToGradeName(key, settings.grading)}</Text>
                                                    <View style={styles.row}>
                                                        <Text style={Fonts.plainBold}>Výlezů:</Text>
                                                        <Text style={Fonts.plainBold}>{userStats['unique_sends'][key]['sends']}</Text>
                                                        <Text style={Fonts.plainBold}>Z toho flashů:</Text>
                                                        <Text style={Fonts.plainBold}>{userStats['unique_sends'][key]['flashes']}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    }
                                    )
                                }
                            </View>
                        </ScrollView>
                    </View>
                    <Modal visible={seasonalModal}>
                        {
                            chosenSeason &&
                            <View style={{flex:1, marginTop: 30, marginBottom: 30}}>
                                <ScrollView style={{flex:1, marginLeft: 20, marginRight: 20}}>
                                    <View style={{alignItems: 'center', gap:10, marginBottom: 20}}>
                                        <Text style={Fonts.h1}>Sezóna: {chosenSeason}</Text>
                                        <Text style={Fonts.h3}>Skóre: {userStats['previous_seasons'][chosenSeason]['score']}</Text>
                                    </View>
                                    <View style={{gap: 5}}>
                                        {
                                            Object.keys(userStats['previous_seasons'][chosenSeason]['unique_sends']).map((key) => {
                                                return (
                                                    <View key={key} style={styles.boulderStatsContainer}>
                                                        <Text style={Fonts.h3}>{gradeIdToGradeName(key, settings.grading)}</Text>
                                                        <View style={styles.row}>
                                                            <Text style={Fonts.plainBold}>Výlezů:</Text>
                                                            <Text style={Fonts.plainBold}>{userStats['previous_seasons'][chosenSeason]['unique_sends'][key]['sends']}</Text>
                                                            <Text style={Fonts.plainBold}>Z toho flashů:</Text>
                                                            <Text style={Fonts.plainBold}>{userStats['previous_seasons'][chosenSeason]['unique_sends'][key]['flashes']}</Text>
                                                        </View>
                                                    </View>
                                                )
                                            }
                                            )
                                        }
                                    </View>
                                </ScrollView>
                                <TouchableOpacity onPress={() => setSeasonalModal(false)}>
                                    <View style={styles.button}>
                                        <Text style={Fonts.h3}>Zavřít</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        }
                    </Modal>
                    <Modal visible={borderModal}>
                        {
                            <View style={{flex:1, marginTop: 30, marginBottom: 30}}>
                                 <FlatList
                                    data={sortedBorders}
                                    renderItem={renderBorder}
                                    keyExtractor={item => item.id}
                                />
                            </View>
                        }
                    </Modal>
                    <Modal visible={bouldersModal}>
                        {modalBoulders && createGradeSetInfo(modalBoulders)}
                        <TouchableOpacity onPress={() => setBouldersModal(false)}>
                            <View style={styles.modalOk}>
                                <Text style={styles.textStyle}>OK</Text>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
                )
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    userStats: {
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
        flex: 1,
        padding: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 25,
        backgroundColor: Colors.transparentWhite,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
        paddingBottom: 10,
        marginBottom: 20,
    },
    boulderStatsContainer: {
        padding: 10,
        gap: 10,
        backgroundColor: Colors.transparentPrimary,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    genericStats: {
        gap: 10,
        marginBottom: 20,
        padding: 10,
        backgroundColor: Colors.transparentWhite,
        borderRadius: 25,
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    awardContainer: {
        alignItems: 'center',
        justifyContent: 'center',
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
     },
    description: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: Colors.transparentWhite,
        borderRadius: 25,
        marginTop: 20,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    borderedIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        height: undefined,
        width: 280,
    },
    icon: {
        width: 170,
        height: 170,
        borderRadius: 5,
    },
    border: {
        height: '100%',
        width: '100%',
        position: 'absolute',
    },
    borderChoice: {
        height: 300,
        width: 300,
    },
    modalOk: {
        backgroundColor: Colors.primary,
        padding: 10,
        margin: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    modalView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
});