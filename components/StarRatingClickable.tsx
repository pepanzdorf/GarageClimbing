import React, { useState, useEffect } from "react";
import { View, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';


type Props = {
    initialRating: number;
    maxStars: number;
    size: number;
    onRatingChange: (rating: number) => void;
}


const StarRatingClickable = (props: Props) => {
    const [ filledStars, setFilledStars ] = useState(Math.floor(props.initialRating));


    const updateRating = (newRating: number) => {
        props.onRatingChange(newRating);
        setFilledStars(Math.floor(newRating));
    }

    useEffect(() => {
        setFilledStars(Math.floor(props.initialRating));
    }, [props.initialRating]);

    return (
        <View style={{flexDirection: 'row', height: props.size, width: props.maxStars*props.size, justifyContent: 'center'}}>
            {
                Array.from({ length: props.maxStars })
                    .map((_, index) => {
                        return(
                            <Pressable key={index} onPress={() => updateRating(index+1)}>
                                <FontAwesome
                                    name={index < filledStars ? "star" : "star-o"}
                                    size={props.size}
                                    color={index < filledStars ? "gold" : "grey"}
                                />
                            </Pressable>
                        )
                })
            }
        </View>
    );
};


export { StarRatingClickable };
