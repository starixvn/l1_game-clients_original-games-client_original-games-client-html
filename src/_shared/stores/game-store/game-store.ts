import { create } from "zustand";
import { BettingInfoSlice, createBettingInfoSlice } from "./betting-info-slice";
import { BetHistorySlice, createBetHistorySlice } from "./bet-history-slice";
import { createGameConfigSlice, GameConfigSlice } from "./game-state.slice";
import { createSocketSlice, SocketSlice } from "./socket-slice";

export type GameStore = {
    registerEvent: (message: any) => void;
} & BettingInfoSlice &
    GameConfigSlice &
    BetHistorySlice &
    SocketSlice;

export const useGameStore = create<GameStore>()((set, ...a) => {
    const bettingInfoSlice = createBettingInfoSlice(set, ...a);
    const gameConfigSlice = createGameConfigSlice(set, ...a);
    const betHistorySlice = createBetHistorySlice(set, ...a);
    return {
        ...bettingInfoSlice,
        ...gameConfigSlice,
        ...betHistorySlice,
        ...createSocketSlice(set, ...a),
        registerEvent: (message) => {
            bettingInfoSlice.registerBettingInfoEvent(message);
            gameConfigSlice.registerGameConfigEvent(message);
            betHistorySlice.registerBetHistoryEvent(message);
        },
    };
});
export default useGameStore;
