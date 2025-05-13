import { DimensionValue, View } from "react-native";
import ColorPicker, {ColorFormatsObject, HueCircular, Preview} from "reanimated-color-picker";


type Props = {
    onComplete: (color: ColorFormatsObject) => void;
    size?: DimensionValue;
}


const StyledColorPicker = ({
    onComplete,
    size="100%"
}: Props) => {
    return (
        <View style={{width: size}}>
            <ColorPicker value={"rgb(255, 0, 0)"} onCompleteJS={onComplete}>
                <HueCircular />
                <Preview hideInitialColor={true} hideText={true} style={{height: 60}}/>
            </ColorPicker>
        </View>
    );
}

export { StyledColorPicker };
