import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiURL } from '../constants/Other';
import { filterBoulders, mulberry32, stringToSeed } from '../scripts/utils';

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
        timerIP: null,
        timerPort: null,
        showTimerControls: false,
        showUnsentSeasonal: false
    }

    const [boulders,setBoulders] = useState([]);
    const [bouldersLoading, setBouldersLoading] = useState(true);

    const [settings, setSettings] = useState(defaultSettings);
    const [settingsLoading, setSettingsLoading] = useState(true);

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

    const [userSavedAttempts, setUserSavedAttempts] = useState(null);

    const [ sessionSends, setSessionSends ] = useState([]);

    const [ chosenDate, setChosenDate ] = useState(null)

    const [ timerStatus, setTimerStatus ] = useState('offline')

    const [ savedTimers, setSavedTimers ] = useState([]);

    const [ currentTimer, setCurrentTimer ] = useState(null);

    const [ currentTimersStatus, setCurrentTimersStatus ] = useState([]);

    const [ competitions, setCompetitions ] = useState([]);
    const [ currentCompetition, setCurrentCompetition ] = useState(null);

    const [builderStats, setBuilderStats] = useState(null);

    const [boulderQuest, setBoulderQuest] = useState({});


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
        if (settings.timerIP === undefined) {
            settings.timerIP = null;
        }
        if (settings.timerPort === undefined) {
            settings.timerPort = null;
        }
        if (settings.showTimerControls === undefined) {
            settings.showTimerControls = false;
        }
        if (settings.showUnsentSeasonal === undefined) {
            settings.showUnsentSeasonal = false;
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
        fetchChallenges();
        whoami();
        fetchUserStats();
        loadScript();
        fetchTags();
        fetchWallConfig();
        loadSavedBoulderAttempts();
        fetchCrackStats();
        fetchSessionSends(chosenDate);
        fetchTimerStatus();
        loadTimers();
        fetchCompetitions();
    }

    const whoami = () => {
        fetch(`${apiURL}/whoami`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            }
        )
            .then(response => {
                if (!response.ok) {
                    response.json()
                        .then(text => alert(text["message"]))
                        .catch(error => console.log(error));
                    setLoggedUser('Nepřihlášen');
                    setIsAdmin(false);
                    setToken('token');
                    saveToken('token');
                } else {
                    response.json().then(response => {
                        setLoggedUser(response.username),
                        setIsAdmin(response.admin)
                    }).catch(error => console.log(error));
                }
            })
            .catch(error => console.log(error));
    }

    const fetchBoulders = (ang) => {
        setBouldersLoading(true);
        fetch(`${apiURL}/boulders/${ang}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )
            .then(response => {
                if (!response.ok) {
                    whoami();
                    return [];
                }
                return response.json()
                })
            .then(jsonResponse => setBoulders(jsonResponse))
            .catch(error => console.log(error))
            .finally(() => setBouldersLoading(false));
    };

    const fetchHolds = () => {
        setHoldsLoading(true);
        fetch(`${apiURL}/holds`)
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

    const loadTimers = async () => {
        try {
            const persistentTimers = await AsyncStorage.getItem("savedTimers");
            if (persistentTimers !== null) {
                setSavedTimers(JSON.parse(persistentTimers));
            } else {
                setSavedTimers([]);
            }
        } catch (error) {
            console.log(error);
            setSavedTimers([]);
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

    const saveTimers = async () => {
        try {
            await AsyncStorage.setItem("savedTimers", JSON.stringify(savedTimers));
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


    const fetchChallenges = () => {
        fetch(`${apiURL}/challenges`)
            .then(response => response.json())
            .then(jsonResponse => setChallenges(jsonResponse))
            .catch(error => console.log(error));
    }


    const reloadBoulders = () => {
        fetchBoulders(settings.angle);
        fetchHolds();
    }


    const fetchUserStats = () => {
        fetch(`${apiURL}/stats`, {
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
        fetch(`${apiURL}/crack/stats`)
            .then(response => response.json())
            .then(response => setCrackStats(response))
            .catch(error => console.log(error));
    }


    const fetchTags = () => {
        fetch(`${apiURL}/tags`)
            .then(response => response.json())
            .then(jsonResponse => setTags(jsonResponse))
            .catch(error => console.log(error));
    }


    const fetchWallConfig = () => {
        fetch(`${apiURL}/get_config`)
            .then(response => response.json())
            .then(jsonResponse => setWallConfig(jsonResponse))
            .catch(error => console.log(error));
    }

    const fetchSessionSends = async () => {
        if (chosenDate === null) {
            return;
        }
        const response = await fetch(`${apiURL}/sends/${chosenDate}`)
        if (!response.ok) {
            return;
        }
        const jsonResponse = await response.json();
        setSessionSends(jsonResponse);
    }

    const fetchTimerStatus = async () => {
        try {
            if (settings.timerIP === null || settings.timerPort === null) {
                return;
            }
            const response = await fetch(`http://${settings.timerIP}:${settings.timerPort}/status`);
            const status = await response.text();

            setTimerStatus(status.trimEnd());

        } catch (error) {
            setTimerStatus('offline');
            console.error('Timer is not responding', error);
        }
    };

    const fetchCompetitions = async () => {
        const response = await fetch(`${apiURL}/competitions`);
        if (!response.ok) {
            return;
        }
        const jsonResponse = await response.json();
        setCompetitions(jsonResponse);
    }


    const createBuilderStats = () => {
        if (!boulders) return;
        const result = {};
        for (const boulder of boulders) {
            const name = boulder.built_by;

            if (!result[name]) {
                result[name] = { count: 0, total_rating: 0, rated_boulders: 0 };
            }

            result[name].count += 1;
            if (boulder.average_rating !== -1) {
                result[name].total_rating += boulder.average_rating;
                result[name].rated_boulders += 1;
            }
        }

        for (const name in result) {
            if (result[name].rated_boulders == 0) {
                result[name].average_rating = null;
            } else {
                result[name].average_rating = parseFloat((result[name].total_rating/result[name].rated_boulders).toFixed(2));
            }
        }

        setBuilderStats(result);
    }


    const saveBoulderQuest = async () => {
        try {
            await AsyncStorage.setItem("boulderQuest", JSON.stringify(boulderQuest));
        } catch (error) {
            console.log(error);
        }
    }


    const loadBoulderQuest = async () => {
        try {
            const persistentBoulderQuest = await AsyncStorage.getItem("boulderQuest");
            if (persistentBoulderQuest !== null) {
                setBoulderQuest(JSON.parse(persistentBoulderQuest));
            } else {
                setBoulderQuest({});
            }
        } catch (error) {
            console.log(error);
            setBoulderQuest({});
        }
    }


    const rollBoulderQuest = async () => {
        await loadBoulderQuest();
        if (!stats) return;
        const loggedUserStats = stats['users'].find(([name, _]) => name === loggedUser);
        if (!loggedUserStats) return;
        const stringDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const expectedGrade = loggedUserStats[1].expected_grade;
        if (
            boulderQuest[loggedUser] === undefined ||
            boulderQuest[loggedUser].completed === true ||
            boulderQuest[loggedUser].date !== stringDate
        ) {
            const rng = mulberry32(stringDate + stringToSeed(loggedUser));
            const newDay = boulderQuest?.[loggedUser]?.date !== stringDate ? true : false;
            const possibleBoulders = findPossibleBouldersForQuest(expectedGrade, boulderQuest?.[loggedUser]?.id, newDay);
            const randomIndex = Math.floor(rng() * possibleBoulders.length);
            setBoulderQuest({
                ...boulderQuest,
                [loggedUser]: {
                    boulder: possibleBoulders[randomIndex].id,
                    date: stringDate,
                    completed: false,
                }
            });
        }
    }


    const findPossibleBouldersForQuest = (expectedGrade, previousBoulderID, newDay) => {
        let possibleBoulders = []
        let oldFiltered = false;
        let margin = 2;
        while (possibleBoulders.length < 1) {
            possibleBoulders = filterBoulders(
                boulders,
                false,
                Math.max(expectedGrade - margin, 0),
                expectedGrade + margin,
                false,
                false,
                [],
                true,
            );
            if (newDay) {
                const oldLength = possibleBoulders.length;
                possibleBoulders = possibleBoulders.filter(boulder => boulder.id !== previousBoulderID);
                if (possibleBoulders.length !== oldLength) {
                    oldFiltered = true;
                }
            }
            margin++;
            if (margin > 60) {
                break;
            }
        }

        if (possibleBoulders.length == 0) {
            if (oldFiltered) {
                possibleBoulders = boulders.find(boulder => boulder.id === previousBoulderID);
                if (possibleBoulders) {
                    return [possibleBoulders];
                }
            }
            margin = 2;
            while (possibleBoulders.length < 1) {
                possibleBoulders = filterBoulders(
                    boulders,
                    false,
                    Math.max(expectedGrade - margin, 0),
                    expectedGrade + margin,
                    false,
                    false,
                    [],
                    false,
                );
                margin++;
                if (margin > 60) {
                    break;
                }
            }
        }
        return possibleBoulders;
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

    useEffect(() => {
        fetchSessionSends(chosenDate);
    }
    , [chosenDate]);

    useEffect(() => {
        fetchTimerStatus();
    }
    , [settings.timerIP, settings.timerPort]);


    useEffect(() => {
        saveTimers();
    }
    , [savedTimers]);


    useEffect(() => {
        createBuilderStats();
    }
    , [boulders]);

    useEffect(() => {
        rollBoulderQuest();
    }
    , [stats, boulders, loggedUser]);

    useEffect(() => {
        boulderQuest && saveBoulderQuest();
    }
    , [boulderQuest]);


    return (
        <GlobalStateContext.Provider
            value={{
                boulders,
                bouldersLoading,
                settings,
                setSettings,
                saveSettings,
                settingsLoading,
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
                userSavedAttempts,
                setUserSavedAttempts,
                sessionSends,
                chosenDate,
                setChosenDate,
                fetchSessionSends,
                timerStatus,
                savedTimers,
                setSavedTimers,
                currentTimer,
                setCurrentTimer,
                fetchTimerStatus,
                currentTimersStatus,
                setCurrentTimersStatus,
                competitions,
                fetchCompetitions,
                currentCompetition,
                setCurrentCompetition,
                builderStats,
                boulderQuest,
                setBoulderQuest
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};
