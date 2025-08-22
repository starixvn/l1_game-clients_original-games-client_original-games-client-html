import { create } from "zustand";
import { BettingInfoSlice, createBettingInfoSlice } from "./betting-info-slice";
import { createGameConfigSlice, GameConfigSlice } from "./game-state.slice";
import { createSocketSlice, SocketSlice } from "./socket-slice";

export type GameStore = {
    registerEvent: (message: any) => void;
} & BettingInfoSlice &
    GameConfigSlice &
    SocketSlice;

export const useGameStore = create<GameStore>()((set, ...a) => {
    const bettingInfoSlice = createBettingInfoSlice(set, ...a);
    const gameConfigSlice = createGameConfigSlice(set, ...a);
    return {
        ...bettingInfoSlice,
        ...gameConfigSlice,
        ...createSocketSlice(set, ...a),
        registerEvent: (message) => {
            bettingInfoSlice.registerBettingInfoEvent(message);
            gameConfigSlice.registerGameConfigEvent(message);
        },
    };
});
export default useGameStore;
