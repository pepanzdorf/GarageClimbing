import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { SettingsContext } from "@/context/SettingsContext";
import { TimerType } from "@/types/timerType";
import { TimerStatusType } from "@/types/timerStatusType";
import AsyncStorage from '@react-native-async-storage/async-storage';


type Props = {
    children: ReactNode;
};

type TimerContextType = {
    timerStatus: string;
    savedTimers: TimerType[];
    setSavedTimers: (savedTimers: TimerType[]) => void;
    currentTimersStatus: TimerStatusType[];
    setCurrentTimersStatus: (currentTimersStatus: TimerStatusType[]) => void;
    pingTimer: () => void;
    saveTimers: (timers: TimerType[]) => void;
};

export const TimerContext = createContext<TimerContextType>({
    timerStatus: 'offline',
    savedTimers: [],
    setSavedTimers: () => {},
    currentTimersStatus: [],
    setCurrentTimersStatus: () => {},
    pingTimer: () => {},
    saveTimers: () => {},
});


export const TimerContextProvider = ({ children }: Props) => {
    const { settings } = useContext(SettingsContext);
    const [ timerStatus, setTimerStatus ] = useState('offline')
    const [ savedTimers, setSavedTimers ] = useState<TimerType[]>([]);
    const [ currentTimersStatus, setCurrentTimersStatus ] = useState<TimerStatusType[]>([]);


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


    const saveTimers = async (timers: TimerType[]) => {
        try {
            await AsyncStorage.setItem("savedTimers", JSON.stringify(timers));
        } catch (error) {
            console.log(error);
        }
    }


    const pingTimer = async () => {
        try {
            if (settings.timerIP === null || settings.timerPort === null) {
                setTimerStatus('offline');
                return;
            }
            const response = await fetch(`http://${settings.timerIP}:${settings.timerPort}/status`);
            if (response.ok) {
                setTimerStatus('online');
            } else {
                setTimerStatus('offline');
            }
        } catch (error) {
            setTimerStatus('offline');
            console.error('Timer is not responding', error);
        }
    };


    useEffect(() => {
        pingTimer().catch(console.error);
    }
    , [settings.timerIP, settings.timerPort]);


    useEffect(() => {
        loadTimers().catch(console.error);
        pingTimer().catch(console.error);
    }
    , []);


    return (
        <TimerContext.Provider
            value={{
                timerStatus,
                savedTimers,
                setSavedTimers,
                currentTimersStatus,
                setCurrentTimersStatus,
                pingTimer,
                saveTimers,
            }}>
            {children}
        </TimerContext.Provider>
    );
};
