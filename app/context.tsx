import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const defaultSettings = {
        angle: 20,
        user: 'John Doe',
        sortby: 1,
        upperGrade: 53,
        lowerGrade: 0
    }

    const [boulders,setBoulders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState(defaultSettings);
    const [wallImage, setWallImage] = useState(null);
    const [holds, setHolds] = useState([]);


    const executeInOrder = async () => {
        setIsLoading(true);
        await loadSettings();
        await fetchBoulders(settings.angle);
        await fetchHolds();
        await fetchBoulderingWallImage();
        setIsLoading(false);
    }

    const fetchBoulders = (ang) => {
        fetch(`http://192.168.1.113:5000/climbing/boulders/${ang}`)
            .then(response => response.json())
            .then(jsonResponse => setBoulders(jsonResponse))
            .catch(error => console.log(error))
    };

    const fetchHolds = () => {
        fetch("http://192.168.1.113:5000/climbing/holds")
        .then(response => response.json())
        .then(jsonResponse => setHolds(jsonResponse))
        .catch(error => console.log(error))
    };

    const loadSettings = async () => {
        try {
            const persistentSettings = await AsyncStorage.getItem("settings");
            if (persistentSettings !== null) {
                setSettings(JSON.parse(persistentSettings));
            } else {
                rewriteToDefaultSettings();
            }
        } catch (error) {
            console.log(error);
            rewriteToDefaultSettings();
        }
    }

    const saveSettings = async () => {
        try {
            await AsyncStorage.setItem("settings", JSON.stringify(settings));
        } catch (error) {
            console.log(error);
        }
    }

    const rewriteToDefaultSettings = () => {
        setSettings(defaultSettings);
        saveSettings();
    }

    const fetchBoulderingWallImage = () => {
        fetch("http://192.168.1.113:5000/climbing/wall")
            .then(response => response.text())
            .then(textResponse => setWallImage(textResponse))
            .catch(error => console.log(error))
    };

    const reloadAll = () => {
        fetchBoulders(settings.angle);
        fetchHolds();
        fetchBoulderingWallImage();
    }

    useEffect(()=>{
        executeInOrder();
    },[]);

    return (
        <GlobalStateContext.Provider value={{ boulders, fetchBoulders, isLoading, settings, setSettings, saveSettings, loadSettings, wallImage, holds, reloadAll }}>
            {children}
        </GlobalStateContext.Provider>
    );
};
