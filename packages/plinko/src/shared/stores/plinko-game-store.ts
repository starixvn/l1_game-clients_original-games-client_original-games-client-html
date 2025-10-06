import { create } from "zustand";
import { GAME_MODES, NUMBER_OF_ROWS } from "@/constants";
import { PlinkoFinish } from "@/shared/types/types";

export type PlinkoGameStore = {
    betAmount: number;
    gameMode: number;
    numberOfRows: number;
    finish: PlinkoFinish;
    actions: {
        setBetAmount: (betAmount: number, minBet: number, maxBet: number) => void;
        setGameMode: (gameMode: number) => void;
        setNumberOfRows: (numberOfRows: number) => void;
        setFinish: (finish: PlinkoFinish) => void;
    };
};

export const usePlinkoGameStore = create<PlinkoGameStore>()((set) => {
    return {
        betAmount: 1,
        gameMode: GAME_MODES.MEDIUM,
        numberOfRows: NUMBER_OF_ROWS.MIN,
        finish: null,
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
            setFinish: (finish: PlinkoFinish) => set({ finish }),
        },
    };
});

export default usePlinkoGameStore;
