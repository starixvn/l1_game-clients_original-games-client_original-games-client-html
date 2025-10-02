import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GAME_MODES, NUMBER_OF_ROWS } from "@/constants";

export type PlinkoGameStore = {
    betAmount: number;
    gameMode: number;
    numberOfRows: number;
    actions: {
        setBetAmount: (betAmount: number, minBet: number, maxBet: number) => void;
        setGameMode: (gameMode: number) => void;
        setNumberOfRows: (numberOfRows: number) => void;
    };
};

export const usePlinkoGameStore = create<PlinkoGameStore>()(
    subscribeWithSelector((set) => {
        return {
            betAmount: 1,
            gameMode: GAME_MODES.MEDIUM,
            numberOfRows: NUMBER_OF_ROWS.MIN,
            actions: {
                setBetAmount: (betAmount: number, minBet: number, maxBet: number) => {
                    if (betAmount < minBet) {
                        set({ betAmount: minBet });
                        return;
                    }
                    if (betAmount > maxBet) {
                        set({ betAmount: maxBet });
                        return;
                    }
                    set({ betAmount: Number(betAmount.toFixed(2)) });
                },
                setGameMode: (gameMode: number) => set({ gameMode }),
                setNumberOfRows: (numberOfRows: number) => set({ numberOfRows }),
            },
        };
    })
);

export default usePlinkoGameStore;
