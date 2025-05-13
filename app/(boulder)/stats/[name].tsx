import {useContext, useState, useEffect, Fragment, useCallback} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, FlatList, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BoulderContext } from "@/context/BoulderContext";
import { UserContext } from "@/context/UserContext";
import { SettingsContext } from "@/context/SettingsContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Entypo } from '@expo/vector-icons';
import { apiURL } from '@/constants/Other';
import { gradeIdToGradeName, gradeToColor, findBoulderById } from '@/scripts/utils';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { UserBoulderStatsType } from "@/types/userBoulderStatsType";
import { BorderType } from "@/types/borderType";
import { BoulderType } from "@/types/boulderType";
import { useAudioPlayer } from "expo-audio";
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'

export default function UserStats() {
    const { name } = useLocalSearchParams();
    const { stats, boulders, borders, fetchUserStats, setCurrentBoulder } = useContext(BoulderContext);
    const { loggedUser, token } = useContext(UserContext);
    const { settings } = useContext(SettingsContext);

    const router = useRouter();
    const player = useAudioPlayer();
    const [ userStats, setUserStats ] = useState<UserBoulderStatsType | undefined>(undefined);
    const [ chosenBorder, setChosenBorder ] = useState<BorderType | undefined>(undefined)
    const [ seasonalModal, setSeasonalModal ] = useState(false)
    const [ borderModal, setBorderModal ] = useState(false)
    const [ bouldersModal, setBouldersModal ] = useState(false)
    const [ chosenSeason, setChosenSeason ] = useState('')
    const [ chosenBackground, setChosenBackground ] = useState('#DADADA')
    const [ borderDimensions, setBorderDimensions ] = useState({width: 0, height: 0})
    const [ sortedBorders, setSortedBorders ] = useState<BorderType[]>([])
    const [ modalBoulders, setModalBoulders ] = useState<{'boulders': number[], 'flashed_boulders': number[]}>({'boulders': [], 'flashed_boulders': []})
    const [ boulderDifferences, setBoulderDifferences ] =
        useState<{
        'all_time': {
            'guest': number[],
            'user': number[]
        },
        'season': {
            'guest': number[],
            'user': number[]
        }
        }>({'all_time': {'guest': [], 'user': []}, 'season': {'guest': [], 'user': []}})
    const [ boulderDifferencesModal, setBoulderDifferencesModal ] = useState(false)


    const playSound = (sound: string) => {
        player.replace({uri: `${apiURL}/static/borders/sounds/${sound}.mp3`});
        player.play();
    }

    const sortBorders = useCallback(() => {
        if (!userStats) return;
        let unlocked: BorderType[] = [];
        let locked: BorderType[] = [];
        let selected: BorderType[] = [];
        for (let i = 0; i < borders.length; i++) {
            if (userStats['border'] === i) {
                selected.push(borders[i]);
            } else if (userStats['unlocked_borders'].includes(i)) {
                unlocked.push(borders[i]);
            } else {
                locked.push(borders[i]);
            }
        }
        setSortedBorders([...selected, ...unlocked, ...locked]);
    }, [userStats, borders]);


    const chooseBorder = useCallback(() => {
        if (!userStats) {
            setChosenBorder(borders[0]);
            Image.getSize(
                `${apiURL}/static/borders/images/${borders[0].image}.png`,
                (width, height) => {
                    setBorderDimensions({width: width, height: height});
                },
                (error) => {
                    console.error('Failed to get image size:', error);
                }
            );
            return;
        }

        setChosenBorder(borders[userStats['border']]);
        Image.getSize(
            `${apiURL}/static/borders/images/${borders[userStats['border']].image}.png`,
            (width, height) => {
                setBorderDimensions({width: width, height: height});
            },
            (error) => {
                console.error('Failed to get image size:', error);
            }
        );
    }, [userStats, borders]);

    const scoreColor = (score: number) => {
        if (score < 100) return '#DADADA';
        if (score >= 100 && score < 1000) return '#CD7F32';
        if (score >= 1000 && score < 5000) return '#F1D400';
        if (score >= 5000 && score < 10000) return '#32CB88';
        if (score >= 10000 && score < 20000) return '#41EDFF';
        if (score >= 20000 && score < 50000) return '#8E00DB';
        if (score >= 50000) return '#BF2C34';
        return '#DADADA';
    }

    const thisUserStats = useCallback(() => {
        if (stats) {
            stats['users'].forEach((user) => {
                if (user[0] === name) {
                    setUserStats(user[1]);
                }
            });
        }
    }, [stats, name]);

    const renderBorder = ({item, index}: {item: BorderType, index: number}) => {
        if (userStats!['unlocked_borders'].includes(item.id)) {
            return (
                <TouchableOpacity onPress={() => handleChangeBorder(item)} key={item.id}>
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            backgroundColor: index === 0 ? Colors.primary : "transparent"
                        }}
                        key={`image-${item.id}`}
                    >
                        <Image source={{uri: `${apiURL}/static/borders/images/${item.image}.png`}} style={styles.borderChoice}/>
                    </View>
                </TouchableOpacity>
            )
        } else {
            let longHint = item.hint;
            if (userStats!['to_unlock'][item.id]) {
                if (typeof userStats!['to_unlock'][item.id] == 'string') {
                    longHint += "\n" + userStats!['to_unlock'][item.id];
                } else {
                    for (let i = 0; i < userStats!['to_unlock'][item.id].length; i++) {
                        let boulder = findBoulderById(Number(userStats!['to_unlock'][item.id][i]), boulders);
                        if (boulder) {
                            longHint += "\n" + boulder.name + " - " + gradeIdToGradeName(boulder.average_grade, settings.grading);
                        }
                    }
                }
            }
            const Wrapper = item.has_sound ? TouchableOpacity : Fragment;
            const wrapperProps = item.has_sound ? { onPress: () => playSound(item.sound as string) } : {};

            return (
                <Wrapper
                    key={item.id}
                    {...wrapperProps}
                >
                    <View style={{alignItems: 'center', justifyContent: 'center', borderWidth: 1}}>
                        <Image source={{uri: `${apiURL}/static/borders/images/${item.image}.png`}} style={styles.borderChoice} blurRadius={50}/>
                        <Text style={[Fonts.plain, {position: 'absolute'}]}>{longHint}</Text>
                    </View>
                </Wrapper>
            )
        }
    }

    const handleChangeBorder = (border: BorderType) => {
        sendBorderChange(border);
        setBorderModal(false);
    }

    const handleIconClick = () => {
        if (!chosenBorder) return;
        if (chosenBorder.has_sound) {
            playSound(chosenBorder.sound as string);
        }
        if (loggedUser === name) {
            setBorderModal(true);
        }
    }

    const sendBorderChange = (border: BorderType) => {
        fetch(`${apiURL}/set_border/${border.id}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response =>  {
            if (response.ok) {
                setChosenBorder(borders[border.id]);
                Image.getSize(
                    `${apiURL}/static/borders/images/${borders[border.id].image}.png`,
                    (width, height) => {
                        setBorderDimensions({width: width, height: height});
                    },
                    (error) => {
                        console.error('Failed to get image size:', error);
                    }
                );
                fetchUserStats();
            }
        })
        .catch(console.error);
    }

    const createGradeSetInfo = (boulders: {'boulders': number[], 'flashed_boulders': number[]}) => {
        return (
            <ScrollView>
                <View style={styles.modalView}>
                    <Text style={Fonts.h1}>Vylezené bouldery</Text>
                    {
                        boulders.boulders.map(boulder => renderBoulderInfo(boulder, boulders.flashed_boulders))
                    }
                </View>
            </ScrollView>
        );
    }


    const createDifferenceInfo = () => {
        return (
            <ScrollView>
                <View style={styles.modalView}>
                    <View style={styles.differencesContainerOuter}>
                        <Text style={Fonts.h1}>Sezóna</Text>
                        <View style={styles.differencesContainerInner}>
                            <Text style={Fonts.h3}>{name} vylezl/a {loggedUser} ne</Text>
                            {
                                boulderDifferences['season']['guest'].map(boulder => renderBoulderInfo(boulder))
                            }
                        </View>
                        <View style={styles.differencesContainerInner}>
                            <Text style={Fonts.h3}>{loggedUser} vylezl/a {name} ne</Text>
                            {
                                boulderDifferences['season']['user'].map(boulder => renderBoulderInfo(boulder))
                            }
                        </View>
                    </View>
                    <View style={styles.differencesContainerOuter}>
                        <Text style={Fonts.h1}>Celkově</Text>
                        <View style={styles.differencesContainerInner}>
                            <Text style={Fonts.h3}>{name} vylezl/a {loggedUser} ne</Text>
                            {
                                boulderDifferences['all_time']['guest'].map(boulder => renderBoulderInfo(boulder))
                            }
                        </View>
                        <View style={styles.differencesContainerInner}>
                            <Text style={Fonts.h3}>{loggedUser} vylezl/a {name} ne</Text>
                            {
                                boulderDifferences['all_time']['user'].map(boulder => renderBoulderInfo(boulder))
                            }
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }


    const renderBoulderInfo = (boulder_id: number, flashed_boulders: number[] = []) => {
        let boulder = findBoulderById(boulder_id, boulders);
        if (!boulder) return null;
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


    const handleReroute = (boulder: BoulderType) => {
        setCurrentBoulder(boulder);
        setBouldersModal(false);
        setSeasonalModal(false);
        setBoulderDifferencesModal(false);
        setBorderModal(false);
        router.push(`/${boulder.id}`);
    }


    const renderSendsByGrade = (sends_by_grade:
        {[key: string]: {
            sends: number;
            flashes: number;
            boulders: number[];
            flashed_boulders: number[];
        }
    }) => {
        return (
            <View style={{gap: 5, marginTop: 20}}>
                {
                    Object.keys(sends_by_grade).map((key) => {
                        return (
                            <TouchableOpacity key={key} onPress={() => {
                                    setModalBoulders({'boulders': sends_by_grade[key]['boulders'],
                                            'flashed_boulders': sends_by_grade[key]['flashed_boulders']});
                                    setBouldersModal(true)}}>
                                <View key={key} style={styles.boulderStatsContainer}>
                                    <Text style={Fonts.h3}>{gradeIdToGradeName(Number(key), settings.grading)}</Text>
                                    <View style={CommonStyles.justifiedRow}>
                                        <Text style={Fonts.plainBold}>Výlezů:</Text>
                                        <Text style={Fonts.plainBold}>{sends_by_grade[key]['sends']}</Text>
                                        <Text style={Fonts.plainBold}>Z toho flashů:</Text>
                                        <Text style={Fonts.plainBold}>{sends_by_grade[key]['flashes']}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }


    const findBoulderDifferences = () => {
        if (!userStats) return;
        if (!boulders) return;
        if (loggedUser === 'Nepřihlášen') return;
        const all_time_boulders_guest = new Set<number>();
        const season_boulders_guest = new Set<number>();
        for (const key in userStats['unique_sends']) {
            userStats['unique_sends'][key]['boulders'].forEach((boulder) => {
                season_boulders_guest.add(boulder);
                all_time_boulders_guest.add(boulder);
            });
        }
        for (const season_key in userStats['previous_seasons']) {
            for (const key in userStats['previous_seasons'][season_key]['unique_sends']) {
                userStats['previous_seasons'][season_key]['unique_sends'][key]['boulders'].forEach((boulder) => {
                    all_time_boulders_guest.add(boulder);
                });
            }
        }

        const all_time_boulders_user = new Set<number>();
        const season_boulders_user = new Set<number>();

        for (const boulder of boulders) {
            if (boulder.sent_season) {
                all_time_boulders_user.add(boulder.id);
                season_boulders_user.add(boulder.id);
            } else if (boulder.sent) {
                all_time_boulders_user.add(boulder.id);
            }
        }

        const all_time_guest_host_difference = [...all_time_boulders_guest].filter(x => !all_time_boulders_user.has(x));
        const season_boulders_guest_host_difference = [...season_boulders_guest].filter(x => !season_boulders_user.has(x));
        const all_time_host_guest_difference = [...all_time_boulders_user].filter(x => !all_time_boulders_guest.has(x));
        const season_boulders_host_guest_difference = [...season_boulders_user].filter(x => !season_boulders_guest.has(x));

        setBoulderDifferences({
            'all_time': {
                'guest': all_time_guest_host_difference,
                'user': all_time_host_guest_difference
            },
            'season': {
                'guest': season_boulders_guest_host_difference,
                'user': season_boulders_host_guest_difference
            }
        });
    }


    useEffect(() => {
        thisUserStats();
    }
    , [thisUserStats]);

    useEffect(() => {
        chooseBorder();
        if (userStats) {
            setChosenBackground(scoreColor(userStats['score']));
            sortBorders();
        }
    }
    , [userStats, chooseBorder, sortBorders]);


    return (
        <SafeAreaView style={CommonStyles.paddedContainer}>
            <View style={[styles.userStats, {backgroundColor: chosenBackground}]}>
                {
                    userStats &&
                    <ScrollView>
                        <View style={styles.header}>
                            <Text style={Fonts.h1}>{name}</Text>
                        </View>
                        {
                            chosenBorder &&
                            <View style={styles.iconContainer}>
                                <ReactNativeZoomableView
                                    maxZoom={20}
                                    minZoom={1}
                                    initialZoom={1}
                                    bindToBorders={true}
                                    disablePanOnInitialZoom={true}
                                    animatePin={false}
                                >
                                    <TouchableOpacity onPress={handleIconClick}>
                                        <View style={[styles.borderedIcon, {aspectRatio: borderDimensions.width/borderDimensions.height}]}>
                                            <Image source={{uri: apiURL + userStats['icon']}} style={styles.icon}/>
                                            <Image source={{uri: `${apiURL}/static/borders/images/${chosenBorder.image}.png`}} style={styles.border}/>
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
                            <Text style={Fonts.h3}>Splněných úkolů:</Text>
                            <Text style={Fonts.plainBold}>{userStats['completed_quests']}</Text>
                            <View style={CommonStyles.wrapRow}>
                                {
                                    userStats['completed_grades'].map((value) => {
                                        return (
                                            <View style={styles.awardContainer} key={value}>
                                                <FontAwesome5 name="award" size={40} color={gradeToColor(value)} />
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
                            <View style={CommonStyles.wrapRow}>
                                {
                                    userStats['previous_seasons'] &&
                                    Object.keys(userStats['previous_seasons']).map((key) => {
                                        return (
                                            <TouchableOpacity key={key} onPress={() => {setChosenSeason(key); setSeasonalModal(true)}}>
                                                <View style={styles.awardContainer}>
                                                    <Entypo name="trophy" size={40} color={scoreColor(userStats['previous_seasons'][key]['score'])} />
                                                    <View style={{position: 'absolute', top: 2}}>
                                                        <Text style={[Fonts.small, {textShadowColor: 'white', textShadowRadius: 10}]}>
                                                            {key.split('-')[0]}
                                                        </Text>
                                                    </View>
                                                    <View style={{position: 'absolute', top: 16}}>
                                                        <Text style={[Fonts.small, {textShadowColor: 'white', textShadowRadius: 10}]}>
                                                            {key.split('-')[1]}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        </View>
                        <Button label={"Porovnat"} onPress={() => {
                            findBoulderDifferences();
                            setBoulderDifferencesModal(true)
                        }}/>
                        {
                            renderSendsByGrade(userStats['unique_sends'])
                        }
                    </ScrollView>
                }
            </View>

            <Modal visible={seasonalModal}>
                {
                    chosenSeason && userStats &&
                    <View style={{flex:1, marginTop: 30, marginBottom: 30}}>
                        <ScrollView style={{flex:1, marginLeft: 20, marginRight: 20}}>
                            <View style={{alignItems: 'center', gap:10, marginBottom: 20}}>
                                <Text style={Fonts.h1}>Sezóna: {chosenSeason}</Text>
                                <Text style={Fonts.h3}>Skóre: {userStats['previous_seasons'][chosenSeason]['score']}</Text>
                                <Text style={Fonts.h3}>Umístění: {userStats['previous_seasons'][chosenSeason]['placement']}</Text>
                            </View>
                            {
                                renderSendsByGrade(userStats['previous_seasons'][chosenSeason]['unique_sends'])
                            }
                        </ScrollView>
                        <Button label={"Zavřít"} onPress={() => setSeasonalModal(false)}/>
                    </View>
                }
            </Modal>

            <Modal visible={borderModal}>
                {
                    <View style={{flex:1, marginTop: 30, marginBottom: 30}}>
                         <FlatList
                            data={sortedBorders}
                            renderItem={renderBorder}
                            keyExtractor={item => String(item.id)}
                        />
                    </View>
                }
            </Modal>

            <Modal visible={bouldersModal}>
                {modalBoulders && createGradeSetInfo(modalBoulders)}
                <Button label={"Zavřít"} onPress={() => setBouldersModal(false)}/>
            </Modal>

            <Modal visible={boulderDifferencesModal}>
                { boulderDifferences && createDifferenceInfo() }
                <Button label={"Zavřít"} onPress={() => setBoulderDifferencesModal(false)}/>
            </Modal>
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
        marginBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 25,
        backgroundColor: Colors.transparentWhite,
        borderWidth: 1,
        borderColor: Colors.borderDark,
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
    modalView: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    differencesContainerOuter: {
        padding: 10,
        borderRadius: 25,
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        flex: 1,
        alignItems: 'center',
    },
    differencesContainerInner: {
        marginTop: 10,
        alignItems: 'center',
    },
});