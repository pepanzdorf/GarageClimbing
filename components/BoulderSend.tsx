import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { attemptIdToAttemptName, gradeIdToGradeName } from "@/scripts/utils";
import { FontAwesome5 } from "@expo/vector-icons";
import { StarRating } from "@/components/StarRating";
import { SendType } from "@/types/sendType";
import Fonts from "@/constants/Fonts";
import Colors from "@/constants/Colors";
import CommonStyles from "@/constants/CommonStyles";


type Props = {
    send: SendType;
    onPress?: (send: SendType) => void;
    grading: number;
    withName: boolean;
};

export default function BoulderSend({ send, onPress=()=>{}, grading, withName }: Props) {
    return (
        <TouchableOpacity onPress={() => onPress(send)}>
            <View style={styles.itemContainer}>
                { withName &&
                    <View style={CommonStyles.justifiedRow}>
                        <Text style={Fonts.h3}>
                            {send.name}
                        </Text>
                    </View>
                }
                <View style={CommonStyles.justifiedRow}>
                    <Text style={Fonts.h3}>
                        {send.username}
                    </Text>
                    <Text style={Fonts.h3}>
                        {gradeIdToGradeName(send.grade, grading)}
                    </Text>
                </View>
                <View style={CommonStyles.justifiedRow}>
                    <Text style={Fonts.small}>
                        {new Date(send.sent_date).toLocaleDateString() + " " + new Date(send.sent_date).toLocaleTimeString()}
                    </Text>
                    {(send.challenge_id !== 1) ? (
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
                <View style={CommonStyles.justifiedRow}>
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
    );
}


const styles = StyleSheet.create({
    itemContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        borderRadius: 10,
        backgroundColor: Colors.darkerBackground,
        marginTop: 10,
    },
    crownContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
