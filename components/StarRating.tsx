import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Fonts from '@/constants/Fonts'


type Props = {
    rating: number;
    maxStars: number;
    size: number;
}


const StarRating = (props: Props) => {
    const filledStars = Math.floor(props.rating);
    const halfStar = props.rating - filledStars >= 0.5;
    const emptyStars = props.maxStars - filledStars - (halfStar ? 1 : 0);

    if (props.rating === -1) {
        return (
            <View style={{height: props.size}}>
                <Text style={Fonts.plainBold}>Nehodnoceno</Text>
            </View>
        );
    }

    return (
        <View style={{flexDirection: 'row', height: props.size, width: props.maxStars*props.size}}>
            {
                Array.from({ length: filledStars })
                    .map((_, index) => (
                        <FontAwesome key={`filled-${index}`} name="star" size={props.size} color="gold" />
                    ))
            }
            {
                halfStar && <FontAwesome name="star-half-full" size={props.size} color="gold" />
            }
            {
                Array.from({ length: emptyStars })
                    .map((_, index) => (
                        <FontAwesome key={`empty-${index}`} name="star-o" size={props.size} color="gold" />
                    ))
            }
        </View>
    );
};


export { StarRating };
