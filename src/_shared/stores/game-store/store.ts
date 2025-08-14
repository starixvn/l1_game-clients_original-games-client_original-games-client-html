import { create } from "zustand";
import { BettingInfoSlice, createBettingInfoSlice } from "./betting-info-slice";

export type GameStore = BettingInfoSlice & {
    registerEvent: (message: any) => void;
};

const EVENT_TYPE = {
    OWN_BETS: "ownBets",
    TOTAL_BETS: "totalBets",
    BET_PERCENTAGE: "betPercentage",
    PLAYER_BET_COUNT: "playerBetCount",
};

export const useGameStore = create<GameStore>()((set, ...a) => ({
    ...createBettingInfoSlice(set, ...a),
    registerEvent: (message) => {
        Object.values(EVENT_TYPE).forEach((event) => {
            if (message[event] !== undefined) {
                set({ [event]: message[event] });
            }
        });
    },
}));
export default useGameStore;
