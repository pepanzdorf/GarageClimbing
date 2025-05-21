import { useContext, useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsContext } from "@/context/SettingsContext";
import { BoulderContext } from "@/context/BoulderContext";
import { UserContext } from "@/context/UserContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradeIdToGradeName, sortBoulderBy, filterBoulders, filterBySearch, findBoulderById } from '@/scripts/utils';
import { StarRating } from '@/components/StarRating';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { BoulderType } from "@/types/boulderType";
import { CompetitionType } from "@/types/competitionType";
import { SendType } from "@/types/sendType";
import Colors from '@/constants/Colors'
import Fonts from '@/constants/Fonts'
import IconDropdown from '@/components/IconDropdown';
import CommonStyles from "@/constants/CommonStyles";
import Button from "@/components/HorizontalButton";
import BoulderSend from "@/components/BoulderSend";
import SearchInput from "@/components/SearchInput";
import StyledScrollPicker from "@/components/StyledScrollPicker";


export default function Home(){
    const { loggedUser } = useContext(UserContext);
    const {
        boulders,
        setCurrentBoulder,
        reloadBoulders,
        filteredBoulders,
        setArrowNavigationBoulders,
        setFilteredBoulders,
        setCurrentBoulderIndex,
        sessionSends,
        chosenDate,
        setChosenDate,
        fetchSessionSends,
        competitions,
        fetchCompetitions,
        setCurrentCompetition,
        boulderQuest,
    } = useContext(BoulderContext);
    const { settings } = useContext(SettingsContext);
    const [ search, setSearch ] = useState<string>('');
    const [ numberOfBoulders, setNumberOfBoulders ] = useState(0);
    const [ numberOfSessionSends, setNumberOfSessionSends ] = useState(0);
    const [ numberOfComps, setNumberOfComps ] = useState(0);
    const [ showMode, setShowMode ] = useState(0);
    const [ openDatePicker, setOpenDatePicker ] = useState(false);
    const [ selectedYear, setSelectedYear ] = useState(new Date().getFullYear());
    const [ selectedMonth, setSelectedMonth ] = useState(new Date().getMonth()+1);
    const [ selectedDay, setSelectedDay ] = useState(new Date().getDate());
    const [ possibleQuestBoulders, setPossibleQuestBoulders ] = useState<BoulderType[]>([]);
    const router = useRouter();

    const yearData = Array.from({length: 77}).map((_, i) => ({value: 2024+i, label: 2024+i}));
    const monthData = Array.from({length: 12}).map((_, i) => ({value: i+1, label: i+1}));
    const dayData = Array.from({length: 31}).map((_, i) => ({value: i+1, label: i+1}));


    useEffect(() => {
        if (search === '') {
            setFilteredBoulders(
                filterBoulders(
                    sortBoulderBy(settings.sortby, boulders),
                    settings.includeOpen,
                    settings.lowerGrade,
                    settings.upperGrade,
                    settings.showUnsent,
                    settings.showFavourites,
                    settings.tags,
                    settings.showUnsentSeasonal
                )
            );
        } else {
            setFilteredBoulders(
                sortBoulderBy(settings.sortby, filterBySearch(boulders, search))
            );
        }
    }
    , [search, boulders, settings]);

    useEffect(() => {
        setPossibleQuestBoulders(
            sortBoulderBy(settings.sortby, possibleQuestBoulders)
        );
    }
    , [settings]);

    useEffect(() => {
        setNumberOfBoulders(filteredBoulders.length);
    }
    , [filteredBoulders]);

    useEffect(() => {
        if (sessionSends) {
            setNumberOfSessionSends(sessionSends.length);
        }
    }
    , [sessionSends]);

    useEffect(() => {
        if (competitions) {
            setNumberOfComps(competitions.length);
        }
    }
    , [competitions]);

    useEffect(() => {
        setChosenDate(`${selectedYear}-${selectedMonth}-${selectedDay}`);
    }
    , [selectedYear, selectedMonth, selectedDay]);

    useEffect(() => {
        if (boulderQuest?.[loggedUser]?.possibleBoulders) {
            setPossibleQuestBoulders(
                sortBoulderBy(
                    settings.sortby,
                    boulderQuest[loggedUser].possibleBoulders.map((boulder_id) =>
                        findBoulderById(boulder_id, boulders)).filter((boulder) => boulder !== undefined)
                )
            );
        }
    }
    , [boulderQuest]);

    const handleGoToBoulder = (item: BoulderType, index: number) => {
        setCurrentBoulder(item);
        setCurrentBoulderIndex(index);
        setArrowNavigationBoulders(filteredBoulders);
        router.push(`/${item.id}`);
    }

    const handleReroute = (send: SendType) => {
        let boulder = findBoulderById(send.boulder_id, boulders);
        if (!boulder) return;

        setCurrentBoulder(boulder);
        router.push(`/${boulder.id}`);
    }

    const handleRerouteComp = (comp: CompetitionType) => {
        setCurrentCompetition(comp);

        router.push(`/comp/${comp.id}`);
    }

    const handleNew = () => {
        if (showMode === 0) {
            router.push('/boulder_editor?edit=false')
        } else if (showMode === 1) {
            router.push('/comp/comp_editor')
        }
    }

    const renderBoulder = ({item, index}: { item: BoulderType, index: number }) => {
        let isQuest = false;
        if (boulderQuest?.[loggedUser]?.boulder === item.id) {
            isQuest = true;
        }
        return (
            <TouchableOpacity onPress={() => handleGoToBoulder(item, index)}>
                <View style={[
                    styles.itemContainer,
                    {
                        borderColor: isQuest ? Colors.first : item.sent ? Colors.primary : Colors.borderDark,
                        borderWidth: isQuest ? 3 : 1,
                    },
                ]}>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={[Fonts.h3, styles.name]}>
                            {item.name}
                        </Text>
                        <View style={styles.iconRow}>
                            <Text style={Fonts.h3}>
                                {gradeIdToGradeName(item.average_grade, settings.grading)}
                            </Text>
                            {
                                item.sent_season ? (
                                    <FontAwesome name="check" size={24} color="green" />
                                ) : (
                                    <FontAwesome name="times" size={24} color="red" />
                                )
                            }
                            {
                                item.favourite ? (
                                    <FontAwesome name="heart" size={24} color="red" />
                                ) : (
                                    <FontAwesome name="heart-o" size={24} color="red" />
                                )
                            }
                        </View>
                    </View>
                    <View style={[CommonStyles.justifiedRow, {marginTop: 5}]}>
                        <Text style={[Fonts.plain, styles.description]}>
                            {item.description}
                        </Text>
                        <View>
                            <StarRating rating={item.average_rating} maxStars={5} size={20}/>
                            <Text style={[Fonts.plain, styles.builder]}>
                                {item.built_by}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }


    const renderCompetition = ({ item }: { item: CompetitionType }) => {
        return (
            <TouchableOpacity onPress={() => handleRerouteComp(item)}>
                <View style={styles.itemContainer}>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h3}>
                            {item.name}
                        </Text>
                        <Text style={Fonts.small}>
                            {new Date(item.build_time).toLocaleDateString() + " " + new Date(item.build_time).toLocaleTimeString()}
                        </Text>
                    </View>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h3}>
                            {item.built_by}
                        </Text>
                        <Text style={Fonts.h3}>
                            {gradeIdToGradeName(item.grade, settings.grading)}
                        </Text>
                    </View>
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h3}>
                            Boulderů:
                        </Text>
                        <Text style={Fonts.h3}>
                            {item.boulders.length}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }


    const renderShowMode = () => {
        if (showMode === 0) {
            return (
                <FlatList
                    data={ filteredBoulders }
                    renderItem={ renderBoulder }
                    keyExtractor={ item => String(item.id) }
                />
            )
        } else if (showMode === 1) {
            return (
                <FlatList
                    data={ competitions }
                    renderItem={ renderCompetition }
                    keyExtractor={ item => String(item.id) }
                />
            )
        } else if (showMode === 2) {
            return (
                <FlatList
                    style={{
                        marginLeft: 15,
                        marginRight: 15
                    }}
                    data={ sessionSends }
                    renderItem={({item}) => (
                        <BoulderSend
                            send={item}
                            grading={settings.grading}
                            withName={true}
                            onPress={handleReroute}
                        />
                    )}
                    keyExtractor={ item => String(item.id) }
                />
            )
        } else {
            let questBoulder = findBoulderById(boulderQuest?.[loggedUser]?.boulder, boulders);
            return (
                <>
                    {
                        questBoulder ? (
                            renderBoulder({item: questBoulder, index: 0})
                        ) : (
                            <Text style={Fonts.h3}>
                                Žádný quest boulder
                            </Text>
                        )
                    }
                    <FlatList
                        data={ possibleQuestBoulders }
                        renderItem={renderBoulder}
                        keyExtractor={ item => String(item.id) }
                    />
                </>
            )
        }
    }

    const renderMenu = () => {
        let count;
        let middle = null;
        if (showMode === 0) {
            count = <Text style={Fonts.plain}>
                { numberOfBoulders }/{ boulders.length }
            </Text>
            middle = <SearchInput value={search} onChangeText={setSearch}/>
        } else if (showMode === 1) {
            count = <Text style={Fonts.plain}>
                { numberOfComps }/{ competitions.length }
            </Text>
        } else if (showMode === 2) {
            count = <Text style={Fonts.plain}>
                { numberOfSessionSends }/{ sessionSends.length }
            </Text>
            middle = <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
                <View style={styles.date}>
                    <Text style={Fonts.h3}>
                        {selectedDay}.{selectedMonth}.{selectedYear}
                    </Text>
                </View>
            </TouchableOpacity>
        } else {
            count = <Text style={Fonts.plain}>
                { boulderQuest?.[loggedUser]?.possibleBoulders.length }
            </Text>
        }
        return (
            <View style={styles.menuContainer}>
                <TouchableOpacity onPress={() => { fetchSessionSends(chosenDate); reloadBoulders(); fetchCompetitions() }}>
                    <View style={styles.refresh}>
                        <Text style={Fonts.h3}>
                            Refresh
                        </Text>
                        { count }
                    </View>
                </TouchableOpacity>
                { middle }
                <View style={[CommonStyles.row, CommonStyles.smallGapped]}>
                    <IconDropdown
                        menuIcon={<FontAwesome name="chevron-down" color={Colors.primary}/>}
                        menuItems={[
                            <TouchableOpacity onPress={() => setShowMode(0)} key={"list"}>
                                <FontAwesome5 name="list" size={36} color={Colors.primary} />
                            </TouchableOpacity>,
                            <TouchableOpacity onPress={() => setShowMode(1)} key={"flag-checkered"}>
                                <FontAwesome5 name="flag-checkered" size={36} color={Colors.primary} />
                            </TouchableOpacity>,
                            <TouchableOpacity onPress={() => setShowMode(2)} key={"stack-exchange"}>
                                <FontAwesome5 name="stack-exchange" size={36} color={Colors.primary} />
                            </TouchableOpacity>,
                            <TouchableOpacity onPress={() => setShowMode(3)} key={"map-marker-question-outline"}>
                                <MaterialCommunityIcons name="map-marker-question-outline" size={36} color={Colors.primary} />
                            </TouchableOpacity>
                        ]}
                        size={36}
                    />
                    <TouchableOpacity onPress={handleNew}>
                        <FontAwesome name="plus" size={36} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={CommonStyles.container}>
            { renderMenu() }
            { renderShowMode() }
            <Modal
                visible={openDatePicker}
                transparent={true}
            >
                <View style={styles.modalViewOuter}>
                    <View style={styles.modalViewInner}>
                        <View style={styles.datePick}>
                            <StyledScrollPicker
                                data={dayData}
                                value={selectedDay}
                                onValueChange={setSelectedDay}
                                width={'30%'}
                                visibleItemCount={5}
                            />
                            <StyledScrollPicker
                                data={monthData}
                                value={selectedMonth}
                                onValueChange={setSelectedMonth}
                                width={'30%'}
                                visibleItemCount={5}
                            />
                            <StyledScrollPicker
                                data={yearData}
                                value={selectedYear}
                                onValueChange={setSelectedYear}
                                width={'30%'}
                                visibleItemCount={5}
                            />
                        </View>
                        <Button label={"OK"} onPress={() => setOpenDatePicker(false)} width={'auto'}/>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: Colors.background,
        borderTopColor: Colors.background,
        borderBottomColor: Colors.borderDark,
        borderWidth: 1,
        zIndex: 1,
    },
    refresh: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        backgroundColor: Colors.primary,
    },
    itemContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        borderRadius: 10,
        backgroundColor: Colors.darkerBackground,
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
    },
    iconRow: {
        flexDirection:"row",
        gap: 5,
    },
    description: {
        flex:1,
        flexWrap: 'wrap',
        marginRight: 10,
    },
    builder: {
        maxWidth: 110,
        flexWrap: 'wrap',
        marginRight: 10,
    },
    name: {
        flex:1,
        flexWrap: 'wrap',
        marginRight: 10,
    },
    crownContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    date: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    modalViewOuter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalViewInner: {
        backgroundColor: Colors.background,
        margin: 20,
        borderRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    datePick: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
});

