export type UserBoulderStatsType = {
    all_sends: number;
    challenges: number;
    icon: string;
    user_description: string;
    border: number;
    sessions: {
        previous_seasons: {
            [key: string]: number;
        };
        current: number;
        overall: number;
    };
    expected_grade: number;
    completed_quests: number;
    previous_seasons: {
        [key: string]: {
            unique_sends: {
                [key: string]: {
                    sends: number;
                    flashes: number;
                    boulders: number[];
                    flashed_boulders: number[];
                };
            };
            score: number;
            placement: number;
        };
    };
    unique_sends: {
        [key: string]: {
            sends: number;
            flashes: number;
            boulders: number[];
            flashed_boulders: number[];
        };
    };
    sum_sends: number;
    sum_flashes: number;
    completed_grades: number[];
    score: number;
    overall_score: number;
    unlocked_borders: number[];
    to_unlock: {
        [key: string]: string | number[];
    }
};
