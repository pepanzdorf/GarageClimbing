import { TimerIntervalType } from "@/types/timerIntervalType";

export type TimerType = {
    name: string,
    intervals: TimerIntervalType[],
    loops: number
}