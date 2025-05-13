import { Pressable, StyleSheet, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "@/constants/Colors";


type Props = {
    withSend?: boolean;
    withShow?: boolean;
    onSend?: () => void;
    onShow?: () => void;
    onPause:() => void;
    onStop:() => void;
    onStart:() => void;
}


const TimerControls = ({
    withSend=false,
    withShow=false,
    onSend=() => {},
    onShow=() => {},
    onPause,
    onStop,
    onStart,
}: Props) => {
    return (
        <View style={styles.menuContainer}>
            {
                withSend &&
                <Pressable
                    onPress={onSend}
                    style={({pressed}) => ({
                        opacity: pressed ? 0.5 : 1,
                    })}
                >
                    <FontAwesome name="send" size={40} color={Colors.primary}/>
                </Pressable>
            }
            {
                withShow &&
                <Pressable
                    onPress={onShow}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.5 : 1,
                    })}
                >
                    <FontAwesome name="eye" size={40} color={Colors.primary}/>
                </Pressable>
            }
            <Pressable
                onPress={onPause}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                })}
            >
                <FontAwesome name="pause" size={40} color='orange'/>
            </Pressable>
            <Pressable
                onPress={onStop}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                })}
            >
                <FontAwesome name="stop" size={40} color='red'/>
            </Pressable>
            <Pressable
                onPress={onStart}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                })}
            >
                <FontAwesome name="play" size={40} color='green'/>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
});


export { TimerControls };
