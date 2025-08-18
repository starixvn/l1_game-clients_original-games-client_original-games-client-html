import { create } from "zustand";

export type BettingStore = {
    selectedChip: number;
    setSelectedChip: (selectedChip: number) => void;
};

export const useBettingStore = create<BettingStore>()((set, ...a) => {
    return {
        selectedChip: 1,
        setSelectedChip: (selectedChip: number) => set({ selectedChip }),
    };
});

export default useBettingStore;
