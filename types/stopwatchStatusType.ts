export type StopwatchStatusType = {
    running: boolean,
    paused: boolean,
    paused_at: [number, number, number, number, number, number, number, number],
    started_at: [number, number, number, number, number, number, number, number],
    paused_for: number,
    shown: boolean
}