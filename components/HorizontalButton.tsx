import { StyleSheet, Pressable, Text, DimensionValue } from 'react-native';
import Fonts from "@/constants/Fonts";
import React from "react";
import Colors from "@/constants/Colors";

type Props = {
    label: string;
    theme?: 'tiny';
    color?: string;
    onPress?: () => void;
    width?: DimensionValue;
    smallFont?: boolean;
};

export default function Button({ label, theme, onPress, color, width='100%', smallFont=false }: Props) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                {
                    opacity: pressed ? 0.5 : 1,
                    backgroundColor: color || Colors.primary,
                },
                theme === 'tiny' ? { paddingHorizontal: 10 } : { padding: 10 },
                {width: width}
            ]}
        >
            <Text style={smallFont ? Fonts.smallBold : Fonts.h3}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Colors.borderBlack,
    },
});
