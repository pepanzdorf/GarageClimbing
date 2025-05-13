import { Text, View,} from 'react-native';
import { ReactNode } from "react";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import WheelPicker from "@quidone/react-native-wheel-picker";

type Props = {
    name?: string;
    data: any[];
    value: any;
    onValueChange: (value: any) => void;
    color?: string;
    children?: ReactNode;
    width?: number | "auto" | `${number}%` | undefined;
    centered?: boolean;
    itemHeight?: number;
    visibleItemCount?: number;
    centeredView?: boolean;
    boldText?: boolean;
    scrollerWidth?: number | "auto" | `${number}%` | undefined;
};

const StyledScrollPicker = ({
    name=undefined,
    data,
    value,
    onValueChange,
    color=Colors.primary,
    children,
    width=200,
    scrollerWidth='100%',
    centered=false,
    itemHeight=35,
    visibleItemCount=3,
    centeredView=false,
    boldText=true,
}: Props)=> {


    return (
        <View style={{alignItems: centeredView ? 'center' : 'flex-start', width: width, justifyContent: 'center'}}>
            {
                name &&
                <View style={{alignItems: centered ? 'center' : 'flex-start'}}>
                    <Text style={boldText ? Fonts.h3 : Fonts.plain}>{name}</Text>
                </View>
            }
            { children }
            <View style={{width: scrollerWidth, justifyContent: 'center'}} >
                <WheelPicker
                    data={data}
                    value={value}
                    onValueChanged={({item: { value }}) => onValueChange(value)}
                    itemHeight={itemHeight}
                    visibleItemCount={visibleItemCount}
                    width={'100%'}
                    itemTextStyle={[Fonts.h2, {color: color}]}
                    overlayItemStyle={{opacity: 0.15}}
                />
            </View>
        </View>
    );
};


export default StyledScrollPicker;
