import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Fonts } from '../constants/Fonts'
import { Colors } from '../constants/Colors'

const NumberInput = (props) => {

    return (
        <View style={styles.container}>
            <FontAwesome name="minus" size={30} color={Colors.highlight} onPress={() => props.setValue(Math.max(props.minValue, props.value - 1))}/>
            <TextInput
                style={{fontSize: 40}}
                onChangeText={text => props.setValue(text)}
                value={props.value.toString()}
                keyboardType='numeric'
            />
            <FontAwesome name="plus" size={30} color={Colors.primary} onPress={() => props.setValue(props.value + 1)}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.darkerBorder,
        borderRadius: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        gap: 5,
    },

});


export { NumberInput };
