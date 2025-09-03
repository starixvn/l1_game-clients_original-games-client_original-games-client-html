import { create } from "zustand";
import { BettingInfoSlice, createBettingInfoSlice } from "./betting-info-slice";
import { createGameConfigSlice, GameConfigSlice } from "./game-state.slice";
import { createSocketSlice, SocketSlice } from "./socket-slice";

export type GameStore = {
    registerEvent: (message: any) => void;
} & BettingInfoSlice &
    GameConfigSlice &
    SocketSlice;

export const useGameStore = create<GameStore>()((set, ...args) => {
    const bettingInfoSlice = createBettingInfoSlice(set, ...args);
    const gameConfigSlice = createGameConfigSlice(set, ...args);
    return {
        ...bettingInfoSlice,
        ...gameConfigSlice,
        ...createSocketSlice(set, ...args),
        registerEvent: (message) => {
            bettingInfoSlice.registerBettingInfoEvent(message);
            gameConfigSlice.registerGameConfigEvent(message);
        },
    };
});
export default useGameStore;
