import React, {createContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiURL } from '@/constants/Other';


type Props = {
    children: ReactNode;
};

type SettingsContextType = {
    settings: any;
    setSettings: (settings: any) => void;
    saveSettings: (settings: any) => void;
    wallConfig: { angle: number };
    setWallConfig: (wallConfig: any) => void;
};

export const SettingsContext = createContext<SettingsContextType>({
    settings: undefined,
    setSettings: () => {},
    saveSettings: () => {},
    wallConfig: { angle: 20 },
    setWallConfig: () => {},
});


export const SettingsContextProvider = ({ children }: Props) => {
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

    const [ settings, setSettings ] = useState(defaultSettings);
    const [ wallConfig, setWallConfig ] = useState({ angle: 20 });


    const checkSettings = () => {
        let dirty = false;
        if (settings.angle === undefined) {
            settings.angle = 20;
            dirty = true;
        }
        if (settings.sortby === undefined) {
            settings.sortby = 1;
            dirty = true;
        }
        if (settings.upperGrade === undefined) {
            settings.upperGrade = 52;
            dirty = true;
        }
        if (settings.lowerGrade === undefined) {
            settings.lowerGrade = 0;
            dirty = true;
        }
        if (settings.darkening === undefined) {
            settings.darkening = 0.5;
            dirty = true;
        }
        if (settings.darkenPreview === undefined) {
            settings.darkenPreview = true;
            dirty = true;
        }
        if (settings.showUnsent === undefined) {
            settings.showUnsent = false;
            dirty = true;
        }
        if (settings.showFavourites === undefined) {
            settings.showFavourites = false;
            dirty = true;
        }
        if (settings.rating === undefined) {
            settings.rating = 3;
            dirty = true;
        }
        if (settings.grading === undefined) {
            settings.grading = 0;
            dirty = true;
        }
        if (settings.lineWidth === undefined) {
            settings.lineWidth = 8;
            dirty = true;
        }
        if (settings.includeOpen === undefined) {
            settings.includeOpen = true;
            dirty = true;
        }
        if (settings.tags === undefined) {
            settings.tags = [];
            dirty = true;
        }
        if (settings.timerIP === undefined) {
            settings.timerIP = null;
            dirty = true;
        }
        if (settings.timerPort === undefined) {
            settings.timerPort = null;
            dirty = true;
        }
        if (settings.showTimerControls === undefined) {
            settings.showTimerControls = false;
            dirty = true;
        }
        if (settings.showUnsentSeasonal === undefined) {
            settings.showUnsentSeasonal = false;
            dirty = true;
        }
        if (dirty) {
            setSettings(settings);
            saveSettings(settings).catch(console.error);
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
        } catch (error) {
            console.error(error);
            rewriteToDefaultSettings();
        }
    }

    const saveSettings = async (settings: any) => {
        try {
            await AsyncStorage.setItem("settings", JSON.stringify(settings));
        } catch (error) {
            console.error(error);
        }
    }


    const rewriteToDefaultSettings = () => {
        setSettings(defaultSettings);
        saveSettings(settings).catch(console.error);
    }


    const fetchWallConfig = () => {
        fetch(`${apiURL}/get_config`)
            .then(response => response.json())
            .then(jsonResponse => setWallConfig(jsonResponse))
            .catch(error => console.error(error));
    }


    useEffect(() => {
        loadSettings().then(() => checkSettings()).catch(console.error);
        fetchWallConfig();
    }, []);


    return (
        <SettingsContext.Provider
            value={{
                settings,
                setSettings,
                saveSettings,
                wallConfig,
                setWallConfig,
            }}>
            {children}
        </SettingsContext.Provider>
    );
};
