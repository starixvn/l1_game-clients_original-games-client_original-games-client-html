import { create } from "zustand";

export type BettingStore = {
    selectedChip: number;
    ownBets: Record<string, number>;
    actions: {
        setSelectedChip: (selectedChip: number) => void;
        setOwnBets: (ownBets: Record<string, number>) => void;
    };
    registerEvent: (message: any) => void;
};

const EVENT_TYPE = {
    OWN_BETS: "ownBets",
};

export const useBettingStore = create<BettingStore>()((set, ...a) => {
    return {
        selectedChip: 1,
        ownBets: {},
        actions: {
            setSelectedChip: (selectedChip: number) => set({ selectedChip }),
            setOwnBets: (ownBets: Record<string, number>) => set({ ownBets }),
        },
        registerEvent: (message) => {
            Object.values(EVENT_TYPE).forEach((event) => {
                if (message[event] !== undefined) {
                    set({ [event]: message[event] });
                }
            });
        },
    };
});

export default useBettingStore;
