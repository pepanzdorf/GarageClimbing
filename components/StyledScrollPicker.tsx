import { Text, View, DimensionValue } from 'react-native';
import { ReactNode, useRef, useImperativeHandle, forwardRef } from "react";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import ScrollPicker, { ScrollPickerHandle } from "react-native-wheel-scrollview-picker";

type Props = {
    name?: string;
    data: any[];
    selectedIndex: number;
    onValueChange: (value: any, index: number) => void;
    color?: string;
    children?: ReactNode;
    width?: DimensionValue;
    centered?: boolean;
};

const StyledScrollPicker = forwardRef<ScrollPickerHandle, Props>(({
    name=undefined,
    data,
    selectedIndex,
    onValueChange,
    color=Colors.primary,
    children,
    width='50%',
    centered=false,
}, ref)=> {
    const scrollRef = useRef<ScrollPickerHandle>(null)

    useImperativeHandle(ref, () => scrollRef.current as ScrollPickerHandle);


    return (
        <View style={{width: width}}>
            {
                name &&
                <View style={{alignItems: centered ? 'center' : 'flex-start'}}>
                    <Text style={Fonts.h3}>{name}</Text>
                </View>
            }
            { children }
            <ScrollPicker
                ref={scrollRef}
                dataSource={data}
                selectedIndex={selectedIndex}
                wrapperHeight={70}
                wrapperBackground="#FFFFFF"
                itemHeight={35}
                highlightColor={Colors.border}
                highlightBorderWidth={2}
                itemTextStyle={Fonts.h3}
                activeItemTextStyle={[Fonts.h3, {color: color}]}
                onValueChange={onValueChange}
            />
        </View>
    );
});

StyledScrollPicker.displayName = "StyledScrollPicker";
export default StyledScrollPicker;
