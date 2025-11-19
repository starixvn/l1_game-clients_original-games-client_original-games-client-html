import { create } from "zustand";
import { GAME_MODES, NUMBER_OF_ROWS } from "@plinko/constants";
import { subscribeWithSelector } from "zustand/middleware";
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
    reset: () => void;
};

export const usePlinkoGameStore = create<PlinkoGameStore>()(
    subscribeWithSelector((set) => {
        return {
            betAmount: 0,
            gameMode: GAME_MODES.LOW,
            numberOfRows: NUMBER_OF_ROWS.DEFAULT,
            finish: null,
            numberOfDroppingBall: 0,
            finishedBall: null,
            actions: {
                setBetAmount: (betAmount: number, minBet: number, maxBet: number) => {
                    if (betAmount === 0) {
                        set({ betAmount: 0 });
                        return;
                    }
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
            reset: () =>
                set({
                    betAmount: 1,
                    gameMode: GAME_MODES.LOW,
                    numberOfRows: NUMBER_OF_ROWS.DEFAULT,
                    finish: null,
                    numberOfDroppingBall: 0,
                    finishedBall: null,
                }),
        };
    })
);

export default usePlinkoGameStore;
