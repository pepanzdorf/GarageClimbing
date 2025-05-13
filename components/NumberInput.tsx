import { View, StyleSheet, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors'


type Props = {
    minValue?: number;
    maxValue?: number;
    value: number;
    setValue: (n: number) => void;
    border?: boolean;
    size: number;
}

const NumberInput = ({
    minValue=undefined,
    maxValue=undefined,
    value,
    setValue,
    border=false,
    size
}: Props) => {
    const clamp = (value: number) => {
        if (minValue !== undefined) value = Math.max(minValue, value);
        if (maxValue !== undefined) value = Math.min(maxValue, value);
        return value;
    }


    function checkValue(value: any) {
        const intValue = parseInt(value);
        if (isNaN(intValue)) {
            return minValue ? minValue : 0;
        }
        return clamp(intValue);
    }


    return (
        <View style={[border ? { borderWidth: 1, borderRadius: 10, borderColor: Colors.borderBlack } : null, styles.container]}>
            <FontAwesome name="minus" size={size} color={Colors.highlight} onPress={() => setValue(clamp(value - 1))}/>
            <TextInput
                style={{fontSize: size+10}}
                onChangeText={(text) => setValue(checkValue(text))}
                value={value.toString()}
                inputMode='numeric'
            />
            <FontAwesome name="plus" size={size} color={Colors.primary} onPress={() => setValue(clamp(value + 1))}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 5,
        alignItems: 'center',
        gap: 5,
    },

});


export { NumberInput };
