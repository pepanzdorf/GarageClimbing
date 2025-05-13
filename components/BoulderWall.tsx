import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { Svg, Path, Rect, ClipPath, Defs, G, Use, Mask, Pattern, Line } from 'react-native-svg'
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { apiURL } from "@/constants/Other";
import { createRef, useCallback, useEffect, useState } from "react";
import { HoldType, BoulderHoldType } from "@/types/holdType";
import { mulberry32, numberToFillColor, numberToStrokeColor } from "@/scripts/utils";


type Props = {
    holds: { holds: HoldType[]; volumes: HoldType[]; } | { holds: BoulderHoldType[]; volumes: BoulderHoldType[]; };
    lineWidth: number;
    onHoldPress?: (hold: HoldType | BoulderHoldType, index: number) => void;
    onVolumePress?: (hold: HoldType | BoulderHoldType, index: number) => void;
    darken: boolean;
    darkening?: number;
    isInfo?: boolean;
    isBuild?: boolean;
    removeRandomHold?: boolean;
    currentBoulderId?: number;
    colorsHolds?: number[];
    colorsVolumes?: number[];
}

const imageAspectRatio = 820.5611 / 1198.3861;


const BoulderWall = ({
    holds,
    lineWidth,
    onHoldPress=() => {},
    onVolumePress=() => {},
    darken,
    darkening,
    isInfo=false,
    isBuild=false,
    removeRandomHold=false,
    currentBoulderId=0,
    colorsHolds=[],
    colorsVolumes=[]
}: Props) => {
    const [ maxRank, setMaxRank ] = useState(1);
    const [ randomHold, setRandomHold ] = useState<null | number>(null);

    const windowAspectRatio = Dimensions.get('window').width / Dimensions.get('window').height;
    const tabBarHeight = useBottomTabBarHeight();
    const maxHeight = Dimensions.get('window').height - tabBarHeight * 3;
    const isImageWider = windowAspectRatio < imageAspectRatio;
    const zoomableViewRef = createRef<ReactNativeZoomableView>();


    const getColorForValue = (value: number, min: number, max: number) => {
        const normalizedValue = (value - min) / (max - min);
        const hue = 260 - Math.round(320 * normalizedValue);

        return `hsl(${hue},100%,50%)`;
    }


    const chooseRandomHold = useCallback(() => {
        let randomHoldIDs: number[] = [];
        holds["holds"].forEach((hold) => {
            const h = hold as BoulderHoldType;
            if (h.hold_type === 1 || h.hold_type === 2) {
                randomHoldIDs.push(h.id);
            }
        });

        const rng = mulberry32(Number(new Date().toISOString().split('T')[0].replace(/-/g, '')) + currentBoulderId);

        const randomIndex = Math.floor(rng() * randomHoldIDs.length);

        setRandomHold(randomHoldIDs[randomIndex]);
    }, [holds, currentBoulderId]);


    const calculateMaxRank = useCallback(() => {
        let mr = 1;
        holds['holds'].forEach((hold) => {
            const h = hold as HoldType;
            if (h.rank > mr) {
                mr = h.rank;
            }
        });
        setMaxRank(mr);
    }, [holds]);


    const restartZoomableView = () => {
        zoomableViewRef.current!.zoomTo(1);
        setTimeout(() => {
            zoomableViewRef.current!.moveTo(0, 0);
        }, 500);
    }


    useEffect(() => {
        if (isInfo) {
            calculateMaxRank();
        }
        if (removeRandomHold) {
            chooseRandomHold();
        } else {
            setRandomHold(null);
        }
    }, [isInfo, removeRandomHold, currentBoulderId, calculateMaxRank, chooseRandomHold]);


    return (
        <ReactNativeZoomableView
            ref={zoomableViewRef}
            maxZoom={20}
            minZoom={1}
            initialZoom={1}
            bindToBorders={true}
            disablePanOnInitialZoom={true}
            onDoubleTapAfter={restartZoomableView}
            style={{flex: 1}}
            animatePin={false}
        >
            <View style={{maxHeight: maxHeight}}>
                <ImageBackground
                    style={isImageWider ? styles.backgroundImageWider : styles.backgroundImageHigher }
                    source={{uri: `${apiURL}/static/stena.jpg`}}
                >
                    <Svg height="100%" width="100%" viewBox="0 0 820.5611 1198.3861">
                        <Defs>
                            <G id="holds">
                                {holds["holds"].map((hold, index) => (
                                    <Path
                                        key={hold.id}
                                        fill={
                                            isInfo ? 'none' :
                                                (isBuild ? numberToFillColor(colorsHolds[index])
                                                    : numberToFillColor((hold as BoulderHoldType).hold_type))
                                        }
                                        stroke={
                                            isInfo ? getColorForValue((hold as HoldType).rank, 0, maxRank)
                                                : (isBuild ? numberToStrokeColor(colorsHolds[index]) :
                                                    numberToStrokeColor((hold as BoulderHoldType).hold_type))
                                        }
                                        strokeWidth={isBuild ? (colorsHolds[index] === -1 ? 2 : lineWidth) : lineWidth}
                                        d={hold.path}
                                        onPress={() => onHoldPress(hold, index)}
                                        strokeDasharray={hold.id === randomHold ? "3,5" : ""}
                                    />
                                ))}
                            </G>
                            {
                                !isInfo && (
                                    <>
                                        <G id="volumes">
                                            {holds['volumes'].map((hold, index) => {
                                                const typedHold = hold as BoulderHoldType;
                                                return (
                                                    <Path
                                                        key={typedHold.id}
                                                        fill={isBuild ? numberToFillColor(colorsVolumes[index]) :
                                                            numberToFillColor(typedHold.hold_type)}
                                                        stroke={isBuild ? numberToStrokeColor(colorsVolumes[index]) :
                                                            numberToStrokeColor(typedHold.hold_type)}
                                                        strokeWidth={isBuild ? (colorsVolumes[index] === -1 ? 2 : lineWidth) : lineWidth}
                                                        d={typedHold.path}
                                                        onPress={() => onVolumePress(hold, index)}
                                                    />
                                                )})
                                            }
                                        </G>
                                        <Mask id="mask_volumes">
                                            <Rect x="0" y="0" width="100%" height="100%" fill="white" />
                                            {holds['volumes'].map((hold) => {
                                                const typedHold = hold as BoulderHoldType;
                                                return (
                                                    <Path
                                                        key={typedHold.id}
                                                        fill="black"
                                                        strokeWidth={lineWidth}
                                                        d={typedHold.path}
                                                    />
                                                )})
                                            }
                                        </Mask>
                                    </>
                                )
                            }
                            <ClipPath id="clip_holds">
                                <Use href="#holds" />
                            </ClipPath>
                            <Mask id="mask_holds">
                                <Rect x="0" y="0" width="100%" height="100%" fill="white" />
                                <Rect x="0" y="0" width="100%" height="100%" fill="black" clipPath="url(#clip_holds)" clipRule="nonzero" />
                            </Mask>
                            <Pattern id="hatch" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                                <Line x1="0" y1="0" x2="0" y2="10" stroke="black" strokeWidth="5" />
                            </Pattern>
                        </Defs>
                        <G mask={"url(#mask_holds)"}>
                            <Rect
                                x="0" y="0" width="100%" height="100%"
                                opacity={darken ? darkening : 0}
                                fill="black"
                                mask={isInfo ? undefined : "url(#mask_volumes)"}
                            />
                            {
                                !isInfo && ( <Use href="#volumes"/> )
                            }
                            <Use href="#holds"/>
                        </G>
                        {
                            Array(maxRank).fill(0).map((_, i) => (
                                <Rect
                                    key={i}
                                    x="0" y={i*10}
                                    width="20" height="10"
                                    fill={getColorForValue(i, 0, maxRank)}
                                />
                            ))
                        }
                    </Svg>
                </ImageBackground>
            </View>
        </ReactNativeZoomableView>
    );
}


const styles = StyleSheet.create({
    backgroundImageHigher: {
        resizeMode:'contain',
        width: undefined,
        height: '100%',
        aspectRatio: imageAspectRatio,
    },
    backgroundImageWider: {
        resizeMode:'contain',
        width: '100%',
        height: undefined,
        aspectRatio: imageAspectRatio,
    },
});


export { BoulderWall };
