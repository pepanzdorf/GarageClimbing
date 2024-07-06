
import React, { useEffect, useState } from "react";
import {View, Text, FlatList} from 'react-native';

export default function App(){
  const [users,setUsers] = useState([]);

  useEffect(()=>{
    fetchData()
  },[]);

  const fetchData = () => {
    fetch("http://192.168.1.113:5000/climbing/boulders")
      .then(response => response.json())
      .then(jsonResponse => setUsers(jsonResponse))
      .catch(error => console.log(error))
  };

  const renderUser = ({item}) => {
    return (
      <View style={{margin:10,borderWidth:0.5,padding:10}}>
        <Text style={{color:"black",fontSize:16,fontWeight:"bold"}}>
          User {item.id}
        </Text>
        <Text style={{color:"black"}}>grade : {item.grade}</Text>
        <Text style={{color:"black"}}>name : {item.name}</Text>
        <Text style={{color:"black"}}>angle : {item.angle}</Text>
      </View>
    )
  }
  return (
    <View style={{flex:1,backgroundColor:"white"}}>
      <FlatList
        data={users.sort((a,b) => a.name.localeCompare(b.name))}
        renderItem={renderUser}
        />
    </View>
  )
}
