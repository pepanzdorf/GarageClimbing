import {StyleSheet, View, Text, Switch} from 'react-native';
import Fonts from "@/constants/Fonts";
import Colors from "@/constants/Colors";

type Props = {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    endLabel?: string;
    color?: string;
};

export default function RowSwitch({ label, value, onValueChange, endLabel=undefined, color=Colors.primary }: Props) {
    return (
        <View style={styles.switch}>
            <Text style={Fonts.h3}>
                { label }
            </Text>
            <Switch
                trackColor={{false: Colors.borderDark, true: color}}
                thumbColor={value ? Colors.background : Colors.darkerBackground}
                onValueChange={onValueChange}
                value={value}
            />
            {
                endLabel &&
                <Text style={Fonts.h3}>
                    { endLabel }
                </Text>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    switch: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
});
