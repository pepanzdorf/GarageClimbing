import {StyleSheet, View, Text, Switch} from 'react-native';
import Fonts from "@/constants/Fonts";
import Colors from "@/constants/Colors";
import CommonStyles from "@/constants/CommonStyles";

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
            <View style={CommonStyles.container}>
                <Text style={Fonts.h3}>
                    { label }
                </Text>
            </View>
            <Switch
                trackColor={{false: Colors.borderDark, true: color}}
                thumbColor={value ? Colors.background : Colors.darkerBackground}
                onValueChange={onValueChange}
                value={value}
            />
            {
                endLabel &&
                <View style={CommonStyles.container}>
                    <Text style={Fonts.h3}>
                        { endLabel }
                    </Text>
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    switch: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        width: '100%',
    },
});
