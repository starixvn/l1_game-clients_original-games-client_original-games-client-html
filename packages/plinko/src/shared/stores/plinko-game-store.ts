import { create } from "zustand";
import { GAME_MODES, NUMBER_OF_ROWS } from "@plinko/constants";
import { PlinkoFinish } from "@plinko/shared/types/types";

export type PlinkoGameStore = {
    betAmount: number;
    gameMode: number;
    numberOfRows: number;
    finish: PlinkoFinish;
    numberOfDroppingBall: number;
    finishedBall: PlinkoFinish;
    actions: {
        setBetAmount: (betAmount: number, minBet: number, maxBet: number) => void;
        setGameMode: (gameMode: number) => void;
        setNumberOfRows: (numberOfRows: number) => void;
        setFinish: (finish: PlinkoFinish) => void;
        setFinishedBall: (finishedBall: PlinkoFinish) => void;
    };
};

export const usePlinkoGameStore = create<PlinkoGameStore>()((set) => {
    return {
        betAmount: 1,
        gameMode: GAME_MODES.MEDIUM,
        numberOfRows: 10,
        finish: null,
        numberOfDroppingBall: 0,
        finishedBall: null,
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
            setFinish: (finish: PlinkoFinish) => set((state) => ({ finish, numberOfDroppingBall: state.numberOfDroppingBall + 1 })),
            setFinishedBall: (finishedBall: PlinkoFinish) =>
                set((state) => ({ finishedBall, numberOfDroppingBall: state.numberOfDroppingBall - 1 })),
        },
    };
});

export default usePlinkoGameStore;
