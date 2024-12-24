import React, { useContext, useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradeIdToGradeName, sortBoulderBy, filterBoulders, filterBySearch, attemptIdToAttemptName, findBoulderById } from '../../../scripts/utils';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { StarRating } from '../../../components/StarRating';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import ScrollPicker from "react-native-wheel-scrollview-picker";


export default function Home(){
    const {
        settings,
        boulders,
        bouldersLoading,
        reloadBoulders,
        setCurrentBoulder,
        filteredBoulders,
        setFilteredBoulders,
        currentBoulderIndex,
        setCurrentBoulderIndex,
        setArrowNavigationBoulders,
        sessionSends,
        chosenDate,
        setChosenDate,
        fetchSessionSends,
        competitions,
        fetchCompetitions,
        setCurrentCompetition
    } = useContext(GlobalStateContext);
    const [ search, setSearch ] = useState('');
    const [ numberOfBoulders, setNumberOfBoulders ] = useState(0);
    const [ numberOfSessionSends, setNumberOfSessionSends ] = useState(0);
    const [ numberOfComps, setNumberOfComps ] = useState(0);
    const [ showMode, setShowMode ] = useState(0);
    const [ iconName, setIconName ] = useState('flag-checkered');
    const [ openDatePicker, setOpenDatePicker ] = useState(false);
    const [ selectedYear, setSelectedYear ] = useState(new Date().getFullYear());
    const [ selectedMonth, setSelectedMonth ] = useState(new Date().getMonth()+1);
    const [ selectedDay, setSelectedDay ] = useState(new Date().getDate());
    const router = useRouter();

    const yearData = Array(77).fill().map((_, i) => 2024+i);
    const monthData = Array(12).fill().map((_, i) => i+1);
    const dayData = Array(31).fill().map((_, i) => i+1);


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

    const handleGoToBoulder = (item, index) => {
        setCurrentBoulder(item);
        setCurrentBoulderIndex(index);
        setArrowNavigationBoulders(filteredBoulders);
        router.push(`${item.id}`);
    }

    const handleReroute = (boulder_id) => {
        let boulder = findBoulderById(boulder_id, boulders);

        setCurrentBoulder(boulder);
        router.push(`${boulder.id}`);
    }

    const handleRerouteComp = (comp) => {
        setCurrentCompetition(comp);
        router.push(`comps/${comp.id}`);
    }

    const rotateMode = () => {
        if (showMode === 0) {
            setShowMode(1);
            setIconName('stack-exchange');
        } else if (showMode === 1) {
            setShowMode(2);
            setIconName('list');
        } else {
            setShowMode(0);
            setIconName('flag-checkered');
        }
    }

    const handleNew = () => {
        if (showMode === 0) {
            router.push('new_boulder')
        } else if (showMode === 1) {
            router.push('new_comp')
        }
    }

    const renderBoulder = ({item, index}) => {
        return (
            <TouchableOpacity onPress={() => handleGoToBoulder(item, index)}>
                <View style={[styles.boulder, {borderColor: item.sent ? Colors.primary : Colors.borderDark}]}>
                    <View style={styles.firstRow}>
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
                    <View style={styles.secondRow}>
                        <Text style={[Fonts.plain, styles.description]}>
                            {item.description}
                        </Text>
                        <View>
                            <StarRating rating={item.average_rating} maxStars={5} size={20}/>
                            <Text style={[Fonts.plain, styles.description]}>
                                {item.built_by}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const renderSend = ({item, index}) => {
        const send = item;
        return (
            <TouchableOpacity onPress={() => handleReroute(send.boulder_id)}>
                <View key={send.id} style={styles.sendContainer}>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            {send.name}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            {send.username}
                        </Text>
                        <Text style={Fonts.h3}>
                            {gradeIdToGradeName(send.grade, settings.grading)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.small}>
                            {new Date(send.sent_date).toLocaleDateString() + " " + new Date(send.sent_date).toLocaleTimeString()}
                        </Text>
                        {(send.challenge_id != 1) ? (
                            <View style={styles.crownContainer}>
                                <View>
                                    <FontAwesome5 name="crown" size={20} color='gold' />
                                </View>
                                <View style={{position: 'absolute'}}>
                                    <Text style={Fonts.small}>
                                        {send.challenge_id}
                                    </Text>
                                </View>
                            </View>) : null }
                    </View>
                    <View style={styles.row}>
                        <StarRating rating={send.rating} maxStars={5} size={20}/>
                        <Text style={Fonts.h3}>
                            {
                                send.attempts === 0 ? (
                                    attemptIdToAttemptName(send.attempts)
                                ) : (
                                    send.attempts <= 3 ? (
                                        attemptIdToAttemptName(send.attempts) + " pokusy"
                                    ) : (
                                        attemptIdToAttemptName(send.attempts) + " pokusů"
                                    )
                                )
                            }
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }


    const renderCompetition = ({item, index}) => {
        return (
            <TouchableOpacity onPress={() => handleRerouteComp(item)} key={item.id}>
                <View style={styles.compContainer}>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            {item.name}
                        </Text>
                        <Text style={Fonts.small}>
                            {new Date(item.build_time).toLocaleDateString() + " " + new Date(item.build_time).toLocaleTimeString()}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            {item.built_by}
                        </Text>
                        <Text style={Fonts.h3}>
                            {gradeIdToGradeName(item.grade, settings.grading)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            Boulderů:
                        </Text>
                        <Text style={Fonts.h3}>
                            {item.boulders.length}
                        </Text>
                    </View>
                    <View style={styles.row}>

                    </View>
                </View>
            </TouchableOpacity>
        )
    }


    const renderShowMode = () => {
        if (showMode === 0) {
            return (
                <View style={styles.boulders}>
                    { bouldersLoading ? ( <ActivityIndicator size="large" color="black" /> ) : (
                         <FlatList
                            data={ filteredBoulders }
                            renderItem={renderBoulder}
                            keyExtractor={item => item.id}
                        />
                    ) }
                </View>
            )
        } else if (showMode === 1) {
            return (
                <View style={styles.boulders}>
                    { competitions ? (
                            <FlatList
                                data={ competitions }
                                renderItem={ renderCompetition }
                                keyExtractor={ item => item.id }
                            />
                        ) : ( <ActivityIndicator size="large" color="black" /> )
                    }
                </View>
            )
        } else {
            return (
                <View style={styles.boulders}>
                    { sessionSends ? (
                            <FlatList
                                data={ sessionSends }
                                renderItem={ renderSend }
                                keyExtractor={ item => item.id }
                            />
                        ) : ( <ActivityIndicator size="large" color="black" /> )
                    }
                </View>
            )
        }
    }

    const renderMenu = () => {
        let count = null;
        let middle = null;
        if (showMode === 0) {
            count = <Text style={Fonts.plain}>
                        { numberOfBoulders }/{ boulders.length }
                    </Text>
            middle = <View style={styles.search}>
                         <SearchBar
                              placeholder="Vyhledat"
                              value={search}
                              onChangeText={setSearch}
                              containerStyle={styles.searchContainer}
                              inputContainerStyle={styles.searchInputContainer}
                         />
                     </View>
        } else if (showMode === 1) {
            count = <Text style={Fonts.plain}>
                        { numberOfComps }/{ competitions.length }
                    </Text>
        } else {
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
        }
        return (
            <View style={styles.menuContainer}>
                <TouchableOpacity onPress={() => {fetchSessionSends(chosenDate); reloadBoulders(), fetchCompetitions()}}>
                    <View style={styles.refresh}>
                        <Text style={Fonts.h3}>
                            Refresh
                        </Text>
                        { count }
                    </View>
                </TouchableOpacity>
                { middle }
                <View style={styles.clickableIcons}>
                    <TouchableOpacity onPress={() => router.push('timers')}>
                        <FontAwesome5 name="clock" size={36} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={rotateMode}>
                        <FontAwesome5 name={iconName} size={36} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNew}>
                        <FontAwesome name="plus" size={36} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={{flex:1}}>
            { renderMenu() }
            { renderShowMode() }
            <Modal
                visible={openDatePicker}
                transparent={true}
            >
                <View style={styles.modalViewOuter}>
                    <View style={styles.modalViewInner}>
                        <View style={styles.datePick}>
                            <View style={styles.scrollPicker}>
                                <ScrollPicker
                                    dataSource={dayData}
                                    selectedIndex={selectedDay-1}
                                    highlightBorderWidth={2}
                                    itemTextStyle={Fonts.h3}
                                    activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                                    onValueChange={(value) => setSelectedDay(value)}
                                />
                            </View>
                            <View style={styles.scrollPicker}>
                                <ScrollPicker
                                    dataSource={monthData}
                                    selectedIndex={selectedMonth-1}
                                    highlightBorderWidth={2}
                                    itemTextStyle={Fonts.h3}
                                    activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                                    onValueChange={(value) => setSelectedMonth(value)}
                                />
                            </View>
                            <View style={styles.scrollPicker}>
                                <ScrollPicker
                                    dataSource={yearData}
                                    selectedIndex={selectedYear-2024}
                                    highlightBorderWidth={2}
                                    itemTextStyle={Fonts.h3}
                                    activeItemTextStyle={[Fonts.h3, {color: Colors.primary}]}
                                    onValueChange={(value) => setSelectedYear(value)}
                                />
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setOpenDatePicker(false)}>
                            <View style={styles.button}>
                                <Text style={Fonts.plainBold}>
                                    OK
                                </Text>
                            </View>
                        </TouchableOpacity>
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
    },
    refresh: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        backgroundColor: Colors.primary,
    },
    search: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: Colors.background,
        borderTopWidth: 0,
        borderBottomWidth: 0,
    },
    searchInputContainer: {
        borderWidth: 1,
        borderBottomColor: Colors.border,
        borderRadius: 10,
        backgroundColor: Colors.darkerBackground,
    },
    boulder: {
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        backgroundColor: Colors.darkerBackground,
    },
    boulders: {
        backgroundColor: Colors.backgroundColor,
        flex: 1,
    },
    firstRow: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
    secondRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
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
    name: {
        flex:1,
        flexWrap: 'wrap',
        marginRight: 10,
    },
    crownContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        borderRadius: 10,
        backgroundColor: Colors.darkerBackground,
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
    },
    clickableIcons: {
        flexDirection: 'row',
        gap: 10,
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
        backgroundColor: Colors.modalBackground,
        margin: 20,
        borderRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        backgroundColor: Colors.background,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 15,
        paddingHorizontal: 30,
    },
    datePick: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    scrollPicker: {
        width: 100,
        height: 150,
    },
    compContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        borderRadius: 10,
        backgroundColor: Colors.darkerBackground,
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
    },
});

