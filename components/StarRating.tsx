import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const StarRating = props => {
    const filledStars = Math.floor(props.rating);
    const halfStar = props.rating - filledStars >= 0.5;
    const emptyStars = props.maxStars - filledStars - (halfStar ? 1 : 0);

    return (
        <View style={{flexDirection: 'row', height: props.size, width: props.maxStars*props.size}}>
            {
                Array(filledStars)
                    .fill()
                    .map((_, index) => (
                        <FontAwesome key={`filled-${index}`} name="star" size={props.size} color="gold" />
                    ))
            }
            {
                halfStar && <FontAwesome name="star-half-full" size={props.size} color="gold" />
            }
            {
                Array(emptyStars)
                    .fill()
                    .map((_, index) => (
                        <FontAwesome key={`empty-${index}`} name="star-o" size={props.size} color="gold" />
                    ))
            }
        </View>
    );
};


export { StarRating };
