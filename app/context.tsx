import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const defaultSettings = {
        angle: 20,
        user: 'John Doe',
    }

    const [boulders,setBoulders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState(defaultSettings);

    const fetchBoulders = () => {
        setIsLoading(true);
        fetch("http://192.168.1.113:5000/climbing/boulders")
            .then(response => response.json())
            .then(jsonResponse => setBoulders(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => setIsLoading(false))
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

    useEffect(()=>{
        loadSettings();
        fetchBoulders();
    },[]);

    return (
        <GlobalStateContext.Provider value={{ boulders, fetchBoulders, isLoading, settings, setSettings, saveSettings, loadSettings }}>
            {children}
        </GlobalStateContext.Provider>
    );
};
