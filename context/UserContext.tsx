import { createContext, useState, useEffect, ReactNode } from 'react';
import { apiURL } from '@/constants/Other';
import AsyncStorage from '@react-native-async-storage/async-storage';


type Props = {
    children: ReactNode;
};

type UserContextType = {
    token: string;
    setToken: (token: string) => void;
    loggedUser: string;
    isAdmin: boolean;
    saveToken: (token: string) => void;
    whoami: () => void;
};

export const UserContext = createContext<UserContextType>({
    token: 'token',
    setToken: () => {},
    loggedUser: 'Nepřihlášen',
    isAdmin: false,
    saveToken: () => {},
    whoami: () => {},
});

export const UserContextProvider = ({ children } : Props) => {
    const [ token, setToken ] = useState('token');
    const [ loggedUser, setLoggedUser ] = useState('Nepřihlášen');
    const [ isAdmin, setIsAdmin ] = useState(false);


    const whoami = () => {
        fetch(`${apiURL}/whoami`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => {
                if (!response.ok) {
                    response.json()
                        .then(text => alert(text["message"]))
                        .catch(error => console.log(error));
                    setLoggedUser('Nepřihlášen');
                    setIsAdmin(false);
                    setToken('token');
                    saveToken('token').catch(console.error);
                } else {
                    response.json().then(response => {
                        setLoggedUser(response.username);
                        setIsAdmin(response.admin);
                    }).catch(error => console.log(error));
                }
            })
            .catch(error => console.log(error));
    }


    const loadToken = async () => {
        try {
            const persistentToken = await AsyncStorage.getItem("token");
            if (persistentToken !== null) {
                setToken(persistentToken);
            } else {
                setToken('token');
            }
        } catch (error) {
            console.log(error);
            setToken('token');
        }
    }

    const saveToken = async (token: string) => {
        try {
            await AsyncStorage.setItem("token", token);
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        whoami();
    }
    , [token]);


    useEffect(() => {
        loadToken().catch(console.error);
    }, []);

    return (
        <UserContext.Provider
            value={{
                token,
                setToken,
                loggedUser,
                isAdmin,
                saveToken,
                whoami,
        }}>
            {children}
        </UserContext.Provider>
    );
};
