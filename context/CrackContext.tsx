import { createContext, useState, useEffect, ReactNode } from 'react';
import { apiURL } from '@/constants/Other';
import { UserCrackStatsType } from "@/types/userCrackStatsType";
import { CrackSendType } from "@/types/crackSendType";


type Props = {
    children: ReactNode;
};

type CrackContextType = {
    crackStats: {
        sends: {data: CrackSendType[], date: string}[]
        users: [string, UserCrackStatsType][]
    };
    fetchCrackStats: () => void;
};

export const CrackContext = createContext<CrackContextType>({
    crackStats: {sends: [], users: []},
    fetchCrackStats: () => {},
});

export const CrackContextProvider = ({ children } : Props) => {
    const [ crackStats, setCrackStats ] = useState<{
        sends: {data: CrackSendType[], date: string}[]
        users: [string, UserCrackStatsType][]
    }>({sends: [], users: []});


    const fetchCrackStats = () => {
        fetch(`${apiURL}/crack/stats`)
            .then(response => response.json())
            .then(response => setCrackStats(response))
            .catch(console.error);
    }


    useEffect(() => {
        fetchCrackStats();
    }
    , []);


    return (
        <CrackContext.Provider
            value={{
                crackStats,
                fetchCrackStats
        }}>
            {children}
        </CrackContext.Provider>
    );
};
