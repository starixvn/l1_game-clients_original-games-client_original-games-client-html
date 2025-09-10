import { StateCreator } from "zustand";

export interface PFBetsSlice {
    // State
    ownBets: Record<string, any>;

    // Actions
    setOwnBets: (bets: Record<string, any>) => void;
    setNewGameState: () => void;
    registerPFBetsEvent: (message: any) => void;
}

const EVENT_TYPE = {
    OWN_BETS: "ownBets",
};

export const createPFBetsSlice: StateCreator<PFBetsSlice> = (set) => ({
    // Initial state
    ownBets: {},

    // Actions
    setOwnBets: (bets) => set({ ownBets: bets }),

    setNewGameState: () => set({ ownBets: {} }),

    registerPFBetsEvent: (message) => {
        Object.values(EVENT_TYPE).forEach((event) => {
            if (message[event] !== undefined) {
                set({ [event]: message[event] });
            }
        });
    },
}); 