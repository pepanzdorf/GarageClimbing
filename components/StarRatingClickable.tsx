import React, { useContext, useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const StarRatingClickable = props => {
    const [ rating, setRating ] = useState(props.initialRating);
    const [ filledStars, setFilledStars ] = useState(Math.floor(props.initialRating));


    updateRating = (newRating) => {
        setRating(newRating);
        props.onRatingChange(newRating);
        setFilledStars(Math.floor(newRating));
    }

    useEffect(() => {
        updateRating(props.initialRating);
    }, [props.initialRating]);

    return (
        <View style={{flexDirection: 'row', height: props.size, width: props.maxStars*props.size}}>
            {
                Array(props.maxStars)
                    .fill()
                    .map((_, index) => {
                        if (index < filledStars)
                        { return(
                            <TouchableOpacity key={`${index}`} onPress={() => updateRating(index+1)}>
                                <FontAwesome key={`${index}`} name="star" size={props.size} color="gold" />
                            </TouchableOpacity>
                            )
                        } else {
                            return (
                            <TouchableOpacity key={`${index}`} onPress={() => updateRating(index+1)}>
                                <FontAwesome key={`${index}`} name="star-o" size={props.size} color="grey" />
                            </TouchableOpacity>
                            )
                        }
                    })
            }
        </View>
    );
};


export { StarRatingClickable };
