export type HoldType = {
    boulders: string[][];
    id: number;
    is_volume: boolean;
    path: string;
    rank: number;
    total_count: number;
    types_counts: {
        [key: string]: number;
    }
};

export type BoulderHoldType = {
    id: number;
    hold_type: number;
    is_volume: boolean;
    path: string;
}