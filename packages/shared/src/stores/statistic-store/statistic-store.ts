import { create } from "zustand";
import { StatisticSlice, createStatisticSlice } from "./statistic-slice";

export type StatisticStore = StatisticSlice;

export const useStatisticStore = create<StatisticStore>()((set, ...args) => {
    const statisticSlice = createStatisticSlice(set, ...args);

    return {
        ...statisticSlice,
    };
});

export default useStatisticStore;
