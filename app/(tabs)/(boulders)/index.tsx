import React, { useContext, useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradeIdToGradeName, sortBoulderBy, filterBoulders, filterBySearch, attemptIdToAttemptName } from '../../../scripts/utils';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { StarRating } from '../../../components/StarRating';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';


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
    } = useContext(GlobalStateContext);
    const [ search, setSearch ] = useState('');
    const [ numberOfBoulders, setNumberOfBoulders ] = useState(0);
    const [ numberOfSessionSends, setNumberOfSessionSends ] = useState(0);
    const [ showFeed, setShowFeed ] = useState(false);
    const [ openDatePicker, setOpenDatePicker ] = useState(false);
    const router = useRouter();


    useEffect(() => {
        setFilteredBoulders(
            filterBoulders(
                sortBoulderBy(settings.sortby, filterBySearch(boulders, search)),
                settings.includeOpen,
                settings.lowerGrade,
                settings.upperGrade,
                settings.showUnsent,
                settings.showFavourites,
                settings.tags,
            )
        );
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

    const handleGoToBoulder = (item, index) => {
        setCurrentBoulder(item);
        setCurrentBoulderIndex(index);
        setArrowNavigationBoulders(filteredBoulders);
        router.push(`${item.id}`);
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
        )
    }

    return (
        <SafeAreaView style={{flex:1}}>
            <View style={styles.menuContainer}>
                <TouchableOpacity onPress={() => {fetchSessionSends(chosenDate); reloadBoulders()}}>
                    <View style={styles.refresh}>
                        <Text style={Fonts.h3}>
                            Refresh
                        </Text>
                        { showFeed ? (
                            <Text style={Fonts.plain}>
                                { numberOfSessionSends }/{ sessionSends.length }
                            </Text>
                        ) : (
                            <Text style={Fonts.plain}>
                                { numberOfBoulders }/{ boulders.length }
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
                { showFeed ? (
                    <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
                        <View style={styles.date}>
                            <Text style={Fonts.h3}>
                                {chosenDate.toLocaleDateString()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.search}>
                        <SearchBar
                            placeholder="Vyhledat"
                            value={search}
                            onChangeText={setSearch}
                            containerStyle={styles.searchContainer}
                            inputContainerStyle={styles.searchInputContainer}
                        />
                    </View>
                ) }
                <View style={styles.clickableIcons}>
                    <TouchableOpacity onPress={() => setShowFeed(!showFeed)}>
                        <FontAwesome name="stack-exchange" size={36} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('new_boulder')}>
                        <FontAwesome name="plus" size={36} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
            { showFeed ? (
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
            ) : (
                <View style={styles.boulders}>
                    { bouldersLoading ? ( <ActivityIndicator size="large" color="black" /> ) : (
                         <FlatList
                            data={ filteredBoulders }
                            renderItem={renderBoulder}
                            keyExtractor={item => item.id}
                        />
                    ) }
                </View>
            )}
            <DatePicker
                modal
                open={openDatePicker}
                date={ chosenDate }
                mode="date"
                onConfirm={(date) => {
                    setOpenDatePicker(false);
                    setChosenDate(date);
                }}
                onCancel={() => setOpenDatePicker(false)}
            />
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
});

