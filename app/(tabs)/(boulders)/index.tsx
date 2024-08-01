import React, { useContext, useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradeIdToGradeName, sortBoulderBy, filterBoulders, filterBySearch } from '../../../scripts/utils';
import { Colors } from '../../../constants/Colors'
import { Fonts } from '../../../constants/Fonts'
import { StarRating } from '../../../components/StarRating';
import { FontAwesome } from '@expo/vector-icons';


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
    } = useContext(GlobalStateContext);
    const [ search, setSearch ] = useState('');
    const [ numberOfBoulders, setNumberOfBoulders ] = useState(0);
    const router = useRouter();


    useEffect(() => {
        setFilteredBoulders(
            filterBoulders(
                sortBoulderBy(settings.sortby, filterBySearch(boulders, search)),
                true,
                settings.lowerGrade,
                settings.upperGrade,
                settings.showUnsent,
                settings.showFavourites
            )
        );
    }
    , [search, boulders, settings]);

    useEffect(() => {
        setNumberOfBoulders(filteredBoulders.length);
    }
    , [filteredBoulders]);

    const renderBoulder = ({item, index}) => {
        return (
            <TouchableOpacity onPress={() => {setCurrentBoulder(item); setCurrentBoulderIndex(index); router.push(`${item.id}`)}}>
                <View style={styles.boulder}>
                    <View style={styles.firstRow}>
                        <Text style={[Fonts.h3, styles.name]}>
                            {item.name}
                        </Text>
                        <View style={styles.iconRow}>
                            <Text style={Fonts.h3}>
                                {gradeIdToGradeName(item.average_grade, settings.grading)}
                            </Text>
                            {
                                item.sent ? (
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
                        <View style={{flex:1}}>
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

    return (
        <SafeAreaView style={{flex:1}}>
            <View style={styles.menuContainer}>
                <TouchableOpacity onPress={() => reloadBoulders()}>
                    <View style={styles.refresh}>
                        <Text style={Fonts.h3}>
                            Refresh
                        </Text>
                        <Text style={Fonts.plain}>
                            { numberOfBoulders }/{ boulders.length }
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.search}>
                    <SearchBar
                        placeholder="Vyhledat"
                        value={search}
                        onChangeText={setSearch}
                        containerStyle={styles.searchContainer}
                        inputContainerStyle={styles.searchInputContainer}
                    />
                </View>
                <TouchableOpacity onPress={() => router.push('new_boulder')}>
                    <FontAwesome name="plus" size={36} color={Colors.primary} />
                </TouchableOpacity>
            </View>
            <View style={styles.boulders}>
                { bouldersLoading ? ( <ActivityIndicator size="large" color="black" /> ) : (
                     <FlatList
                        data={ filteredBoulders }
                        renderItem={renderBoulder}
                        keyExtractor={item => item.id}
                    />
                ) }
            </View>
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
        flex:2,
        flexWrap: 'wrap',
        marginRight: 10,
    },
    name: {
        flex:1,
        flexWrap: 'wrap',
        marginRight: 10,
    }
});

