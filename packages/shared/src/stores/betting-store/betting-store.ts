import { create } from "zustand";

export type BettingStore = {
    selectedChip: number;
    ownBets: Record<string, number>;
    isAutoRebetActive: boolean;
    actions: {
        setSelectedChip: (selectedChip: number) => void;
        setIsAutoRebetActive: (isAutoRebetActive: boolean) => void;
        setOwnBets: (ownBets: Record<string, number>) => void;
    };
    registerEvent: (message: any) => void;
};

const EVENT_TYPE = {
    OWN_BETS: "ownBets",
};

export const useBettingStore = create<BettingStore>()((set) => {
    return {
        selectedChip: 1,
        ownBets: {},
        isAutoRebetActive: false,
        actions: {
            setSelectedChip: (selectedChip: number) => set({ selectedChip }),
            setIsAutoRebetActive: (isAutoRebetActive: boolean) => set({ isAutoRebetActive }),
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
