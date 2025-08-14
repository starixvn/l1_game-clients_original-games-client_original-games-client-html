import { StateCreator } from "zustand";

export interface BettingInfoSlice {
    totalBets: Record<string, number>;
    betPercentage: Record<string, number>;
    playerBetCount: Record<string, number>;
    ownBets: Record<string, number>;
    setTotalBets: (totalBets: Record<string, number>) => void;
    setBetPercentage: (betPercentage: Record<string, number>) => void;
    setPlayerBetCount: (playerBetCount: Record<string, number>) => void;
    setOwnBets: (ownBets: Record<string, number>) => void;
}

export const createBettingInfoSlice: StateCreator<BettingInfoSlice> = (set) => ({
    totalBets: {},
    betPercentage: {},
    playerBetCount: {},
    ownBets: {},
    setTotalBets: (totalBets) => set({ totalBets }),
    setBetPercentage: (betPercentage) => set({ betPercentage }),
    setPlayerBetCount: (playerBetCount) => set({ playerBetCount }),
    setOwnBets: (ownBets) => set({ ownBets }),
});
