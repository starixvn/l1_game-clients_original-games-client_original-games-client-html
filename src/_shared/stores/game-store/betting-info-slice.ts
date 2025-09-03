import { StateCreator } from "zustand";

export interface BettingInfoSlice {
    totalBets: Record<string, number>;
    betPercentage: Record<string, number>;
    playerBetCount: Record<string, number>;
    ownBets: Record<string, number>;
    endBet: number;
    setTotalBets: (totalBets: Record<string, number>) => void;
    setBetPercentage: (betPercentage: Record<string, number>) => void;
    setPlayerBetCount: (playerBetCount: Record<string, number>) => void;
    setOwnBets: (ownBets: Record<string, number>) => void;
    setEndBet: (endBet: number) => void;
    registerBettingInfoEvent: (message: any) => void;
    resetBettingInfo: () => void;
}

const EVENT_TYPE = {
    OWN_BETS: "ownBets",
    TOTAL_BETS: "totalBets",
    BET_PERCENTAGE: "betPercentage",
    PLAYER_BET_COUNT: "playerBetCount",
    END_BET: "endBet",
};

export const createBettingInfoSlice: StateCreator<BettingInfoSlice> = (set) => ({
    totalBets: {},
    betPercentage: {},
    playerBetCount: {},
    ownBets: {},
    endBet: 0,
    setTotalBets: (totalBets) => set({ totalBets }),
    setBetPercentage: (betPercentage) => set({ betPercentage }),
    setPlayerBetCount: (playerBetCount) => set({ playerBetCount }),
    setOwnBets: (ownBets) => set({ ownBets }),
    setEndBet: (endBet) => set({ endBet }),
    registerBettingInfoEvent: (message) => {
        Object.values(EVENT_TYPE).forEach((event) => {
            if (message[event] !== undefined) {
                set({ [event]: message[event] });
            }
        });
    },
    resetBettingInfo: () => set({ totalBets: {}, betPercentage: {}, playerBetCount: {}, ownBets: {}, endBet: 0 }),
});
