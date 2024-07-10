import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiURL } from '../constants/Other';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const defaultSettings = {
        angle: 20,
        sortby: 1,
        upperGrade: 53,
        lowerGrade: 0,
        darkening: 0.5,
        darkenPreview: false,
        showUnsent: false,
        showFavourites: false,
        rating: 3,
        grading: 0,
    }

    const [boulders,setBoulders] = useState([]);
    const [bouldersLoading, setBouldersLoading] = useState(true);

    const [settings, setSettings] = useState(defaultSettings);
    const [settingsLoading, setSettingsLoading] = useState(true);

    const [wallImage, setWallImage] = useState(null);
    const [wallImageLoading, setWallImageLoading] = useState(true);

    const [holds, setHolds] = useState([]);
    const [holdsLoading, setHoldsLoading] = useState(true);

    const [token, setToken] = useState('token');
    const [tokenLoading, setTokenLoading] = useState(true);

    const [currentBoulder, setCurrentBoulder] = useState(null);

    const [loggedUser, setLoggedUser] = useState('nepřihlášen');
    const [isAdmin, setIsAdmin] = useState(false);

    const [reload, setReload] = useState(false);


    const fetchAll = () => {
        loadSettings();
        loadToken();
        fetchBoulders(settings.angle);
        fetchHolds();
        fetchBoulderingWallImage();
        whoami();
    }

    const whoami = () => {
        fetch(`${apiURL}/climbing/whoami`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            }
        )
            .then(response => response.json())
            .then(response => {setLoggedUser(response.username), setIsAdmin(response.admin)})
            .catch(error => console.log(error));
    }

    const fetchBoulders = (ang) => {
        setBouldersLoading(true);
        fetch(`${apiURL}/climbing/boulders/${ang}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )
            .then(response => response.json())
            .then(jsonResponse => setBoulders(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => setBouldersLoading(false));
    };

    const fetchHolds = () => {
        setHoldsLoading(true);
        fetch(`${apiURL}/climbing/holds`)
        .then(response => response.json())
        .then(jsonResponse => setHolds(jsonResponse))
        .catch(error => console.log(error))
        .finally(() => setHoldsLoading(false));
    };

    const loadSettings = async () => {
        try {
            const persistentSettings = await AsyncStorage.getItem("settings");
            if (persistentSettings !== null) {
                setSettings(JSON.parse(persistentSettings));
            } else {
                rewriteToDefaultSettings();
            }
            setSettingsLoading(false);
        } catch (error) {
            console.log(error);
            rewriteToDefaultSettings();
            setSettingsLoading(false);
        }
    }

    const loadToken = async () => {
        try {
            const persistentToken = await AsyncStorage.getItem("token");
            if (persistentToken !== null) {
                setToken(persistentToken);
            } else {
                setToken('token');
            }
            setTokenLoading(false);
        } catch (error) {
            console.log(error);
            setToken('token');
            setTokenLoading(false);
        }
    }

    const saveSettings = async () => {
        try {
            await AsyncStorage.setItem("settings", JSON.stringify(settings));
        } catch (error) {
            console.log(error);
        }
    }

    const saveToken = async (token) => {
        try {
            await AsyncStorage.setItem("token", token);
        } catch (error) {
            console.log(error);
        }
    }

    const rewriteToDefaultSettings = () => {
        setSettings(defaultSettings);
        saveSettings();
    }

    const fetchBoulderingWallImage = () => {
        fetch(`${apiURL}/climbing/wall`)
            .then(response => response.text())
            .then(textResponse => setWallImage(textResponse))
            .catch(error => console.log(error))
            .finally(() => setWallImageLoading(false));
    };

    const reloadBoulders = () => {
        fetchBoulders(settings.angle);
        fetchHolds();
    }

    useEffect(()=>{
        fetchAll();
    },[]);

    useEffect(() => {
        reloadBoulders();
        whoami();
    }
    , [token]);

    useEffect(() => {
        saveSettings(settings);
        fetchBoulders(settings.angle);
    }
    , [settings]);



    return (
        <GlobalStateContext.Provider
            value={{
                boulders,
                bouldersLoading,
                settings,
                setSettings,
                saveSettings,
                settingsLoading,
                wallImage,
                wallImageLoading,
                holds,
                holdsLoading,
                reloadBoulders,
                token,
                setToken,
                saveToken,
                tokenLoading,
                currentBoulder,
                setCurrentBoulder,
                loggedUser,
                isAdmin,
                reload,
                setReload,
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};
