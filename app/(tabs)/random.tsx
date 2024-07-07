import React, { useEffect, useState, useContext } from "react";
import {View, Text, ActivityIndicator, Button} from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useRouter } from 'expo-router';
import { gradeIdToGradeName } from '../../scripts/utils';

export default function Random(){
    const { boulders, fetchBoulders, isLoading, settings } = useContext(GlobalStateContext);
    const [bouldersInRange, setBouldersInRange] = useState([]);
    const [nBouldersInRange, setNBouldersInRange] = useState(0);
    const [gradeRange, setGradeRange] = useState([0, 53]);
    const [randomBoulder, setRandomBoulder] = useState(null);
    const router = useRouter();



    const multiSliderValuesChange = values => {setGradeRange(values); filterBoulders();};

    function getRandomBoulder() {
        filterBoulders();

        if (bouldersInRange.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * bouldersInRange.length);

        return bouldersInRange[randomIndex];
    }

    function filterBoulders() {
        const [minGrade, maxGrade] = gradeRange;
        const chosenBoulders = boulders.filter(boulder => {
                const boulderGrade = boulder.grade;
                const boulderAngle = boulder.angle;
                return boulderGrade >= minGrade && boulderGrade <= maxGrade && boulderAngle === settings.angle;
            });
        setBouldersInRange(chosenBoulders);
        setNBouldersInRange(chosenBoulders.length);
    }

    function showRandomBoulder(boulder) {
        if (boulder === null) {
            alert('No boulders found in this grade range');
        } else {
            alert(boulder.name);
        }
    }


    useEffect(() => {
        filterBoulders();
    }, [boulders, settings.angle]);

    return (
        <SafeAreaView style={{flex:1,backgroundColor:"white"}}>
            <View style={{margin:10,borderWidth:0.5,padding:10,alignItems:'center'}}>
                <MultiSlider
                    values={[0, 53]}
                    sliderLength={280}
                    onValuesChange={multiSliderValuesChange}
                    min={0}
                    max={53}
                    step={1}
                    snapped
                    allowOverlap
                    markerStyle={{height: 20, width: 20}}
                    touchDimensions={{height: 60, width: 60, borderRadius: 20, slipDisplacement: 200}}
                ></MultiSlider>
                <Text>Grade Range</Text>
                <Text>From: {gradeIdToGradeName(gradeRange[0])}</Text>
                <Text>To: {gradeIdToGradeName(gradeRange[1])}</Text>
                <Text>Number of boulders in range: {nBouldersInRange}</Text>
                <Button title="Get Random Boulder" onPress={() => {
                        const rBoulder = getRandomBoulder(boulders, gradeRange);
                        if (nBouldersInRange === 0) {
                            alert('Žádný boulder nenalezen v tomto rozmezí obtížnosti');
                        } else {
                            setRandomBoulder(rBoulder);
                        }
                    }
                }></Button>
            </View>
            <View style={{backgroundColor:"white"}}>
                <Text>{randomBoulder?.name ?? "žádný"}</Text>
                {
                    randomBoulder &&
                    <Button title="Jít na boulder" onPress={() => router.push(`${randomBoulder.id}`)}></Button>
                }
            </View>
        </SafeAreaView>
    )
}
