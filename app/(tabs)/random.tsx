import React, { useEffect, useState, useContext } from "react";
import {View, Text, FlatList, ActivityIndicator, Button} from 'react-native';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

export default function Random(){

  const { boulders, fetchBoulders, isLoading } = useContext(GlobalStateContext);
  const [bouldersInRange, setBouldersInRange] = useState([]);
  const [nBouldersInRange, setNBouldersInRange] = useState(0);
  const [gradeRange, setGradeRange] = useState([0, 53]);

  const gradeIdToGradeName = (gradeId) => {
      const gradeNumber = Math.floor(gradeId / 3);
      const gradeSign = gradeId % 3;
        const gradeSigns = ['-', '', '+'];
        return 'V' + gradeNumber + gradeSigns[gradeSign];
        }

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
                        return boulderGrade >= minGrade && boulderGrade <= maxGrade;
                    });
                    setBouldersInRange(chosenBoulders);
                    setNBouldersInRange(chosenBoulders.length);
                }


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
            const randomBoulder = getRandomBoulder(boulders, gradeRange);
            if (nBouldersInRange === 0) {
                alert('No boulders found in this grade range');
            } else {
                alert('Random boulder: ' + randomBoulder.name);
            }
        }
        }></Button>
    </View>

    </SafeAreaView>
  )
}
