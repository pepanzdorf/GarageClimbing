import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiURL } from '../constants/Other';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const defaultSettings = {
        angle: 20,
        sortby: 1,
        upperGrade: 52,
        lowerGrade: 0,
        darkening: 0.5,
        darkenPreview: true,
        showUnsent: false,
        showFavourites: false,
        rating: 3,
        grading: 0,
        lineWidth: 8,
        includeOpen: true,
        tags: [],
    }

    const [boulders,setBoulders] = useState([]);
    const [bouldersLoading, setBouldersLoading] = useState(true);

    const [settings, setSettings] = useState(defaultSettings);
    const [settingsLoading, setSettingsLoading] = useState(true);

    const [wallImage, setWallImage] = useState(null);
    const [wallImageLoading, setWallImageLoading] = useState(true);

    const [holds, setHolds] = useState({});
    const [holdsLoading, setHoldsLoading] = useState(true);

    const [token, setToken] = useState('token');
    const [tokenLoading, setTokenLoading] = useState(true);

    const [currentBoulder, setCurrentBoulder] = useState(null);
    const [currentHolds, setCurrentHolds] = useState(null);

    const [loggedUser, setLoggedUser] = useState('Nepřihlášen');
    const [isAdmin, setIsAdmin] = useState(false);

    const [reload, setReload] = useState(false);

    const [currentChallenge, setCurrentChallenge] = useState({id: 1, name: "Žádný", description: "nic", score: 1});
    const [challenges, setChallenges] = useState([]);

    const [stats, setStats] = useState(null);

    const [ filteredBoulders, setFilteredBoulders ] = useState([]);

    const [ currentBoulderIndex, setCurrentBoulderIndex ] = useState();

    const [ arrowNavigationBoulders, setArrowNavigationBoulders ] = useState([]);

    const [ calculateScoreScript, setCalculateScoreScript ] = useState(null);

    const [ tags, setTags ] = useState([]);

    const [ wallConfig, setWallConfig ] = useState(null);

    const [ savedBoulderAttempts, setSavedBoulderAttempts ] = useState();

    const [ crackStats, setCrackStats ] = useState(null);


    const checkSettings = () => {
        if (settings.angle === undefined) {
            settings.angle = 20;
        }
        if (settings.sortby === undefined) {
            settings.sortby = 1;
        }
        if (settings.upperGrade === undefined) {
            settings.upperGrade = 52;
        }
        if (settings.lowerGrade === undefined) {
            settings.lowerGrade = 0;
        }
        if (settings.darkening === undefined) {
            settings.darkening = 0.5;
        }
        if (settings.darkenPreview === undefined) {
            settings.darkenPreview = true;
        }
        if (settings.showUnsent === undefined) {
            settings.showUnsent = false;
        }
        if (settings.showFavourites === undefined) {
            settings.showFavourites = false;
        }
        if (settings.rating === undefined) {
            settings.rating = 3;
        }
        if (settings.grading === undefined) {
            settings.grading = 0;
        }
        if (settings.lineWidth === undefined) {
            settings.lineWidth = 8;
        }
        if (settings.includeOpen === undefined) {
            settings.includeOpen = true;
        }
        if (settings.tags === undefined) {
            settings.tags = [];
        }
        saveSettings();
    }


    const loadScript = async () => {
        try {
            const response = await fetch(`${apiURL}/static/calculate_score.js`);
            const scriptText = await response.text();

            setCalculateScoreScript(() => new Function("grade, attempts, score", scriptText));

        } catch (error) {
            console.error('Error loading script:', error);
        }
    };

    const fetchAll = () => {
        loadSettings();
        loadToken();
        fetchBoulders(settings.angle);
        fetchHolds();
        fetchBoulderingWallImage();
        fetchChallenges();
        whoami();
        fetchUserStats();
        loadScript();
        fetchTags();
        fetchWallConfig();
        loadSavedBoulderAttempts();
        fetchCrackStats();
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

    const loadSavedBoulderAttempts = async () => {
        try {
            const boulderAttempts = await AsyncStorage.getItem("boulderAttempts");
            if (boulderAttempts) {
                setSavedBoulderAttempts(JSON.parse(boulderAttempts));
            } else {
                setSavedBoulderAttempts({});
            }
        } catch (error) {
            console.log(error);
        }
    }

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

    const saveBoulderAttempts = async () => {
        try {
            await AsyncStorage.setItem("boulderAttempts", JSON.stringify(savedBoulderAttempts));
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


    const fetchChallenges = () => {
        fetch(`${apiURL}/climbing/boulders/challenges`)
            .then(response => response.json())
            .then(jsonResponse => setChallenges(jsonResponse))
            .catch(error => console.log(error));
    }


    const reloadBoulders = () => {
        fetchBoulders(settings.angle);
        fetchHolds();
    }


    const fetchUserStats = () => {
        fetch(`${apiURL}/climbing/stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({angle: settings.angle})
        })
            .then(response => response.json())
            .then(response => setStats(response))
            .catch(error => console.log(error));
    }

    const fetchCrackStats = () => {
        fetch(`${apiURL}/climbing/crack/stats`)
            .then(response => response.json())
            .then(response => setCrackStats(response))
            .catch(error => console.log(error));
    }


    const fetchTags = () => {
        fetch(`${apiURL}/climbing/get_tags`)
            .then(response => response.json())
            .then(jsonResponse => setTags(jsonResponse))
            .catch(error => console.log(error));
    }


    const fetchWallConfig = () => {
        fetch(`${apiURL}/climbing/get_config`)
            .then(response => response.json())
            .then(jsonResponse => setWallConfig(jsonResponse))
            .catch(error => console.log(error));
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
        checkSettings();
    }
    , [settings]);

    useEffect(() => {
        savedBoulderAttempts && saveBoulderAttempts();
    }
    , [savedBoulderAttempts]);

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
                currentChallenge,
                setCurrentChallenge,
                challenges,
                setCurrentHolds,
                currentHolds,
                stats,
                setStats,
                fetchUserStats,
                filteredBoulders,
                setFilteredBoulders,
                currentBoulderIndex,
                setCurrentBoulderIndex,
                arrowNavigationBoulders,
                setArrowNavigationBoulders,
                calculateScoreScript,
                tags,
                wallConfig,
                setWallConfig,
                savedBoulderAttempts,
                setSavedBoulderAttempts,
                crackStats,
                fetchCrackStats,
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};
