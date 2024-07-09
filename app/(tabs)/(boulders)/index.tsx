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
    const { settings, boulders, isLoading, reloadAll, setCurrentBoulder } = useContext(GlobalStateContext);
    const [ search, setSearch ] = useState('');
    const [ filteredBoulders, setFilteredBoulders ] = useState([]);
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

    const renderBoulder = ({item}) => {
        return (
            <TouchableOpacity onPress={() => {setCurrentBoulder(item); router.push(`${item.id}`)}}>
                <View style={styles.boulder}>
                    <View style={styles.row}>
                        <Text style={Fonts.h3}>
                            {item.name}
                        </Text>
                        <View style={styles.row}>
                            <Text style={Fonts.h3}>
                                {gradeIdToGradeName(item.average_grade)}
                            </Text>
                            {
                                item.sent ? (
                                    <FontAwesome name="check" size={24} color="green" />
                                ) : (
                                    <FontAwesome name="times" size={24} color="red" />
                                )
                            }
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.description}>
                            <Text style={{color:"black",fontSize:16}}>
                                {item.description}
                            </Text>
                        </View>
                        <StarRating rating={item.average_rating} maxStars={5} size={20}/>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={{flex:1}}>
                <View style={styles.menuContainer}>
                    <TouchableOpacity onPress={() => reloadAll()}>
                        <View style={styles.refresh}>
                            <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                                Refresh
                            </Text>
                            <Text>
                                { numberOfBoulders } boulderů
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
                </View>
            <View style={styles.boulders}>
                { isLoading ? ( <ActivityIndicator size="large" color="black" /> ) : (
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
        backgroundColor: Colors.theme.primary,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    refresh: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'white',
    },
    search: {
        width: "70%",
    },
    boulder: {
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        backgroundColor: Colors.theme.darkerBackground,
    },
    boulders: {
        backgroundColor: Colors.theme.backgroundColor,
        paddingBottom: 90
    },
    row: {
        flexDirection:"row",
        justifyContent:"space-between",
        marginTop: 5,
    },
    description: {
        maxWidth: "70%",
    },
    searchContainer: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        borderBottomWidth: 0,
    },
    searchInputContainer: {
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: 'white',
    },
});

