import { createContext, useState, useEffect, ReactNode } from 'react';
import { apiURL } from '@/constants/Other';
import { FerrataSendType } from "@/types/ferrataSendType";


type Props = {
    children: ReactNode;
};

type FerrataContextType = {
    ferrataStats: {
        sends: FerrataSendType[]
    };
    fetchFerrataStats: () => void;
};

export const FerrataContext = createContext<FerrataContextType>({
    ferrataStats: {sends: []},
    fetchFerrataStats: () => {},
});

export const FerrataContextProvider = ({ children } : Props) => {
    const [ ferrataStats, setFerrataStats ] = useState<{
        sends: FerrataSendType[]
    }>({sends: []});


    const fetchFerrataStats = () => {
        fetch(`${apiURL}/ferrata/stats`)
            .then(response => response.json())
            .then(response => setFerrataStats(response))
            .catch(console.error);
    }


    useEffect(() => {
        fetchFerrataStats();
    }
    , []);


    return (
        <FerrataContext.Provider
            value={{
                ferrataStats,
                fetchFerrataStats
        }}>
            {children}
        </FerrataContext.Provider>
    );
};
