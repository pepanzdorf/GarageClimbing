export type UserCrackStatsType = {
    "horizontal": {
        [key: string] : {
            best_consecutive: number,
            climbed_distance: number
        }
    },
    "overall_distance": number,
    "vertical": {
        [key: string] : {
            best_consecutive: number,
            climbed_distance: number
        }
    }
};
