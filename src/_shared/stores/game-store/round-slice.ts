import { StateCreator } from "zustand";
import { GameDurations, RoundState } from "../../../components/game-base/type";

export interface RoundSlice {
    prevRoundState: RoundState;
    roundState: RoundState;
    isPlayStartRoundAnimation: boolean;
    nextRoundState: RoundState;
    durations: GameDurations;
    defaultResult: any;
    defaultSettlementResult: any;
    remainingTime: number;
    setGameState: (message: any) => void;
}

export const createRoundSlice: StateCreator<RoundSlice> = (set) => ({
    prevRoundState: RoundState.None,
    roundState: RoundState.None,
    isPlayStartRoundAnimation: false,
    nextRoundState: RoundState.None,
    durations: null,
    defaultResult: null,
    defaultSettlementResult: null,
    remainingTime: 0,
    setGameState: (newGameState) => {
        set({
            ...newGameState,
        });
    },
});
