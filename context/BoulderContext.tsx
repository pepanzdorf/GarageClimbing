import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { apiURL } from '@/constants/Other';
import { TagType } from '@/types/tagType';
import { BoulderHoldType, HoldType } from "@/types/holdType";
import { BoulderType } from "@/types/boulderType";
import { UserBuildersStatsType } from "@/types/userBuilderStatsType";
import { UserBoulderStatsType } from "@/types/userBoulderStatsType";
import { BorderType } from "@/types/borderType";
import { UserContext } from "@/context/UserContext";
import { SettingsContext } from "@/context/SettingsContext";
import { ChallengeType } from "@/types/challengeType";
import { SendType } from "@/types/sendType";
import { CompetitionType } from "@/types/competitionType";
import { BoulderQuestType } from "@/types/boulderQuestType";
import { UserSavedAttemptsType } from "@/types/userSavedAttemptsType";
import { filterBoulders, mulberry32, stringToSeed } from "@/scripts/utils";
import AsyncStorage from '@react-native-async-storage/async-storage';


type Props = {
    children: ReactNode;
};

type BoulderContextType = {
    tags: TagType[];
    holds: { holds: HoldType[]; volumes: HoldType[]; };
    boulders: BoulderType[];
    stats: {
        sessions: {
            previous_seasons: {
                [key: string]: number;
            };
            current: number;
            overall: number;
        };
        users: [string, UserBoulderStatsType][];
    },
    fetchUserStats: () => void;
    currentBoulder: BoulderType | undefined;
    setCurrentBoulder: (boulder: BoulderType | undefined) => void;
    builderStats: { [key: string]: UserBuildersStatsType } | null;
    borders: BorderType[];
    challenges: ChallengeType[];
    currentChallenge: ChallengeType;
    setCurrentChallenge: (challenge: ChallengeType) => void;
    reloadBoulders: () => void;
    filteredBoulders: BoulderType[];
    setFilteredBoulders: (boulders: BoulderType[]) => void;
    currentBoulderIndex: number;
    setCurrentBoulderIndex: (index: number) => void;
    sessionSends: SendType[];
    chosenDate: string;
    setChosenDate: (date: string) => void;
    fetchSessionSends: (chosenDate: string) => void;
    competitions: CompetitionType[];
    currentCompetition: CompetitionType | undefined;
    setCurrentCompetition: (competition: CompetitionType | undefined) => void;
    fetchCompetitions: () => void;
    boulderQuest: { [key: string]: BoulderQuestType };
    setBoulderQuest: (boulderQuest: { [key: string]: BoulderQuestType }) => void;
    reload: boolean;
    setReload: (reload: boolean) => void;
    currentHolds: { holds: BoulderHoldType[]; volumes: BoulderHoldType[]; };
    setCurrentHolds: (holds: { holds: BoulderHoldType[]; volumes: BoulderHoldType[]; }) => void;
    arrowNavigationBoulders: BoulderType[];
    setArrowNavigationBoulders: (boulders: BoulderType[]) => void;
    userSavedAttempts: UserSavedAttemptsType;
    setUserSavedAttempts: (usa: UserSavedAttemptsType) => void;
    savedBoulderAttempts: {[key: string]: UserSavedAttemptsType};
    setSavedBoulderAttempts: (sba: {[key: string]: UserSavedAttemptsType}) => void;
    saveBoulderAttempts: () => void;
};

export const BoulderContext = createContext<BoulderContextType>({
    tags: [],
    holds: { holds: [], volumes: [] },
    boulders: [],
    stats: {
        sessions: {
            previous_seasons: {},
            current: 0,
            overall: 0
        },
        users: []
    },
    fetchUserStats: () => {},
    currentBoulder: undefined,
    setCurrentBoulder: () => {},
    builderStats: null,
    borders: [],
    challenges: [],
    currentChallenge: {id: 1, name: "Žádný", description: "nic", score: 1},
    setCurrentChallenge: () => {},
    reloadBoulders: () => {},
    filteredBoulders: [],
    setFilteredBoulders: () => {},
    currentBoulderIndex: 0,
    setCurrentBoulderIndex: () => {},
    sessionSends: [],
    chosenDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
    setChosenDate: () => {},
    fetchSessionSends: () => {},
    competitions: [],
    currentCompetition: undefined,
    setCurrentCompetition: () => {},
    fetchCompetitions: () => {},
    boulderQuest: {},
    setBoulderQuest: () => {},
    reload: false,
    setReload: () => {},
    currentHolds: { holds: [], volumes: [] },
    setCurrentHolds: () => {},
    arrowNavigationBoulders: [],
    setArrowNavigationBoulders: () => {},
    userSavedAttempts: {},
    setUserSavedAttempts: () => {},
    savedBoulderAttempts: {},
    setSavedBoulderAttempts: () => {},
    saveBoulderAttempts: () => {}
});


export const BoulderContextProvider = ({ children }: Props) => {
    const { token, whoami, loggedUser } = useContext(UserContext);
    const { settings } = useContext(SettingsContext);
    const [ tags, setTags ] = useState([]);
    const [ holds, setHolds ] = useState({ holds: [], volumes: [] });
    const [ boulders, setBoulders ] = useState<BoulderType[]>([]);
    const [ currentBoulder, setCurrentBoulder ] = useState<BoulderType | undefined>(undefined);
    const [ builderStats, setBuilderStats ] = useState<{ [key: string] : UserBuildersStatsType } | null>(null);
    const [ stats, setStats ] = useState<
        {
            sessions: {
                previous_seasons: {
                    [key: string]: number;
                };
                current: number;
                overall: number;
            };
            users: [string, UserBoulderStatsType][];
        }
    >(
        {
            sessions: {
                previous_seasons: {},
                current: 0,
                overall: 0
            },
            users: []
        }
    );
    const [ borders, setBorders ] = useState<BorderType[]>([]);
    const [ currentChallenge, setCurrentChallenge ] = useState<ChallengeType>({id: 1, name: "Žádný", description: "nic", score: 1});
    const [ challenges, setChallenges ] = useState<ChallengeType[]>([]);
    const [ filteredBoulders, setFilteredBoulders ] = useState<BoulderType[]>([]);
    const [ currentBoulderIndex, setCurrentBoulderIndex ] = useState(0);
    const [ sessionSends, setSessionSends ] = useState<SendType[]>([]);
    const [ chosenDate, setChosenDate ] = useState(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`);
    const [ competitions, setCompetitions ] = useState<CompetitionType[]>([]);
    const [ currentCompetition, setCurrentCompetition ] = useState<CompetitionType | undefined>(undefined);
    const [ boulderQuest, setBoulderQuest ] = useState<{ [key: string]: BoulderQuestType}>({});
    const [ reload, setReload ] = useState(false);
    const [ currentHolds, setCurrentHolds ] = useState<{ holds: BoulderHoldType[]; volumes: BoulderHoldType[]; }>({ holds: [], volumes: [] });
    const [ arrowNavigationBoulders, setArrowNavigationBoulders ] = useState<BoulderType[]>([]);
    const [ savedBoulderAttempts, setSavedBoulderAttempts ] = useState<{[key: string]: UserSavedAttemptsType}>({});
    const [ userSavedAttempts, setUserSavedAttempts ] = useState<UserSavedAttemptsType>({});


    const fetchTags = () => {
        fetch(`${apiURL}/tags`)
            .then(response => response.json())
            .then(jsonResponse => setTags(jsonResponse))
            .catch(console.error);
    }


    const fetchHolds = () => {
        fetch(`${apiURL}/holds`)
            .then(response => response.json())
            .then(jsonResponse => setHolds(jsonResponse))
            .catch(console.error);
    };


    const fetchBoulders = (angle: number) => {
        fetch(`${apiURL}/boulders/${angle}`,
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
            .catch(console.error);
    };


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
            .catch(console.error);
    }


    const createBuilderStats = () => {
        if (!boulders) return;
        const result: { [key: string]: UserBuildersStatsType } = {};
        for (const boulder of boulders) {
            const name = boulder.built_by;

            if (!result[name]) {
                result[name] = { count: 0, total_rating: 0, rated_boulders: 0, average_rating: null };
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
                result[name].average_rating =
                    parseFloat((result[name].total_rating/result[name].rated_boulders).toFixed(2));
            }
        }

        setBuilderStats(result);
    }


    const fetchBorders = async () => {
        try {
            const response = await fetch(`${apiURL}/static/borders/borders.json`);
            const data = await response.json();
            setBorders(data);
        } catch (error) {
            console.error('Error fetching borders:', error);
        }
    };


    const fetchChallenges = () => {
        fetch(`${apiURL}/challenges`)
            .then(response => response.json())
            .then(jsonResponse => setChallenges(jsonResponse))
            .catch(console.error);
    }


    const reloadBoulders = () => {
        fetchBoulders(settings.angle);
        fetchHolds();
    }


    const fetchSessionSends = async (chosenDate: string) => {
        const response = await fetch(`${apiURL}/sends/${chosenDate}`)
        if (!response.ok) {
            return;
        }
        const jsonResponse = await response.json();
        setSessionSends(jsonResponse);
    }


    const fetchCompetitions = async () => {
        const response = await fetch(`${apiURL}/competitions`);
        if (!response.ok) {
            return;
        }
        const jsonResponse = await response.json();
        setCompetitions(jsonResponse);
    }


    const saveBoulderQuest = async () => {
        try {
            await AsyncStorage.setItem("boulderQuest", JSON.stringify(boulderQuest));
        } catch (error) {
            console.error('Error saving boulder quest:', error);
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
            console.error('Error loading boulder quest:', error);
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
            boulderQuest[loggedUser].completed ||
            boulderQuest[loggedUser].date !== stringDate ||
            boulderQuest[loggedUser].possibleBoulders === undefined
        ) {
            const rng = mulberry32(Number(stringDate) + stringToSeed(loggedUser));
            const newDay = boulderQuest?.[loggedUser]?.date !== stringDate;
            const possibleBoulders = findPossibleBouldersForQuest(expectedGrade, boulderQuest?.[loggedUser]?.boulder, newDay);
            const randomIndex = Math.floor(rng() * possibleBoulders.length);
            setBoulderQuest({
                ...boulderQuest,
                [loggedUser]: {
                    boulder: possibleBoulders[randomIndex].id,
                    date: stringDate,
                    completed: false,
                    possibleBoulders: possibleBoulders
                        .filter(boulder => boulder.id !== possibleBoulders[randomIndex].id)
                        .map(boulder => boulder.id),
                }
            });
        }
    }


    const findPossibleBouldersForQuest = (expectedGrade: number, previousBoulderID: number, newDay: boolean) => {
        let possibleBoulders: BoulderType[] = []
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
                const oldBoulder = boulders.find(boulder => boulder.id === previousBoulderID);
                if (oldBoulder) {
                    return [oldBoulder];
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


    const loadSavedBoulderAttempts = async () => {
        try {
            const persistentBoulderAttempts = await AsyncStorage.getItem("boulderAttempts");
            if (persistentBoulderAttempts) {
                setSavedBoulderAttempts(JSON.parse(persistentBoulderAttempts));
            } else {
                setSavedBoulderAttempts({});
            }
        } catch (error) {
            console.error(error)
        }
    }


    const saveBoulderAttempts = async () => {
        try {
            await AsyncStorage.setItem("boulderAttempts", JSON.stringify(savedBoulderAttempts));
        } catch (error) {
            console.error(error);
        }
    }


    useEffect(() => {
        fetchTags();
        fetchHolds();
        fetchBoulders(settings.angle);
        fetchUserStats();
        fetchBorders().catch(console.error);
        fetchChallenges();
        fetchCompetitions().catch(console.error);
        loadSavedBoulderAttempts().catch(console.error);
        rollBoulderQuest().catch(console.error);
    }, []);


    useEffect(() => {
        fetchBoulders(settings.angle);
    }, [settings]);


    useEffect(() => {
        createBuilderStats();
    }, [boulders]);


    useEffect(() => {
        fetchSessionSends(chosenDate).catch(console.error);
    }
    , [chosenDate]);


    useEffect(() => {
        rollBoulderQuest().catch(console.error);
    }
    , [stats, boulders, loggedUser]);

    useEffect(() => {
        boulderQuest && saveBoulderQuest();
    }
    , [boulderQuest]);


    useEffect(() => {
        savedBoulderAttempts && saveBoulderAttempts();
    }, [savedBoulderAttempts]);


    return (
        <BoulderContext.Provider
            value={{
                tags,
                holds,
                boulders,
                stats,
                fetchUserStats,
                currentBoulder,
                setCurrentBoulder,
                builderStats,
                borders,
                challenges,
                currentChallenge,
                setCurrentChallenge,
                reloadBoulders,
                filteredBoulders,
                setFilteredBoulders,
                currentBoulderIndex,
                setCurrentBoulderIndex,
                sessionSends,
                chosenDate,
                setChosenDate,
                fetchSessionSends,
                competitions,
                currentCompetition,
                setCurrentCompetition,
                fetchCompetitions,
                boulderQuest,
                setBoulderQuest,
                reload,
                setReload,
                currentHolds,
                setCurrentHolds,
                arrowNavigationBoulders,
                setArrowNavigationBoulders,
                userSavedAttempts,
                setUserSavedAttempts,
                savedBoulderAttempts,
                setSavedBoulderAttempts,
                saveBoulderAttempts
            }}>
            {children}
        </BoulderContext.Provider>
    );
};
