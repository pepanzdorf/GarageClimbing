import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBoulderDetail();
  }, [id]);

  const fetchBoulderDetail = () => {
      fetch(`http://192.168.1.113:5000/climbing/boulders/${id}`)
        .then(response => response.json())
        .then(jsonResponse => setDetails(jsonResponse))
        .catch(error => console.log(error))
        .finally(() => setIsLoading(false))
    };

  return (
    <View style={styles.container}>
        {
          isLoading ? ( <ActivityIndicator size="large" color="black" /> ) : (
                        <View>
                            <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                                {details.name}
                            </Text>
                            <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                                {details.grade}
                            </Text>
                            <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
                                {details.angle}
                            </Text>
                        </View>
                      )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
