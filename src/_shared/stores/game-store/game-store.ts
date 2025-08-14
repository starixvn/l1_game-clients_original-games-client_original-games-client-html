import { create } from "zustand";
import { BettingInfoSlice, createBettingInfoSlice } from "./betting-info-slice";
import { createGameConfigSlice, GameConfigSlice } from "./game-config.slice";
import { createRoundStateSlice, RoundStateSlice } from "./round-state-slice";

export type GameStore = {
    registerEvent: (message: any) => void;
} & BettingInfoSlice &
    GameConfigSlice &
    RoundStateSlice;

export const useGameStore = create<GameStore>()((set, ...a) => {
    const bettingInfoSlice = createBettingInfoSlice(set, ...a);
    const gameConfigSlice = createGameConfigSlice(set, ...a);
    return {
        ...bettingInfoSlice,
        ...gameConfigSlice,
        ...createRoundStateSlice(set, ...a),
        registerEvent: (message) => {
            bettingInfoSlice.registerBettingInfoEvent(message);
            gameConfigSlice.registerGameConfigEvent(message);
        },
    };
});
export default useGameStore;
