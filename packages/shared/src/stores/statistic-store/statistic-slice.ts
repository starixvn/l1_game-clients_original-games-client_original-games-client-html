import { StateCreator } from "zustand";

export interface StatisticSlice {
    // State
    isShowStatistic: boolean;

    // Actions
    showStatistic: () => void;
    hideStatistic: () => void;
}

export const createStatisticSlice: StateCreator<StatisticSlice> = (set, get) => ({
    // Initial state
    isShowStatistic: false,

    showStatistic: () => set({ isShowStatistic: true }),
    hideStatistic: () => set({ isShowStatistic: false }),
});
