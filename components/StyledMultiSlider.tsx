import {StyleSheet, View} from 'react-native';
import React from "react";
import Colors from "@/constants/Colors";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import CommonStyles from "@/constants/CommonStyles";

type Props = {
    min: number;
    max: number;
    step: number;
    values: number[];
    onValuesChange: (values: number[]) => void;
    sliderLength?: number;
    onValuesChangeFinish?: (values: number[]) => void;
    allowOverlap?: boolean;
    snapped?: boolean;
};

export default function StyledMultiSlider({
    min,
    max,
    step,
    values,
    onValuesChange,
    sliderLength,
    onValuesChangeFinish=()=>{},
    snapped=false,
    allowOverlap=false
}: Props) {
    return (
        <View style={CommonStyles.centered}>
            <MultiSlider
                values={values}
                min={min}
                max={max}
                step={step}
                onValuesChange={onValuesChange}
                onValuesChangeFinish={onValuesChangeFinish}
                sliderLength={sliderLength || 280}
                markerStyle={styles.markerStyle}
                selectedStyle={{backgroundColor: Colors.primary}}
                unselectedStyle={{backgroundColor: Colors.border}}
                touchDimensions={{
                    height: 60,
                    width: 60,
                    borderRadius: 20,
                    slipDisplacement: 200,
                }}
                allowOverlap={allowOverlap}
                snapped={snapped}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    markerStyle: {
        height: 20,
        width: 20,
        backgroundColor: Colors.primary,
    },
});
