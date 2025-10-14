import { create } from "zustand";
import { GAME_MODES, NUMBER_OF_ROWS } from "@plinko/constants";
import { subscribeWithSelector } from "zustand/middleware";
import { PlinkoFinish } from "@plinko/shared/types/types";
import { logger } from "@plinko/services/logger";

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
        logger.startWorkflow('plinko-game-store-init', 'state', 'Initialize Plinko game store');

        return {
            betAmount: 1,
            gameMode: GAME_MODES.MEDIUM,
            numberOfRows: 10,
            finish: null,
            numberOfDroppingBall: 0,
            finishedBall: null,
            actions: {
                setBetAmount: (betAmount: number, minBet: number, maxBet: number) => {
                    const currentState = usePlinkoGameStore.getState();
                    const newAmount = betAmount < minBet ? minBet : betAmount > maxBet ? maxBet : Number(betAmount.toFixed(2));

                    logger.logStateChange('bet-amount', currentState.betAmount, newAmount, {
                        category: 'state',
                        minBet,
                        maxBet,
                        wasClamped: betAmount < minBet || betAmount > maxBet
                    });

                    set({ betAmount: newAmount });
                },
                setGameMode: (gameMode: number) => {
                    const currentState = usePlinkoGameStore.getState();
                    logger.logStateChange('game-mode', currentState.gameMode, gameMode, {
                        category: 'state'
                    });
                    set({ gameMode });
                },
                setNumberOfRows: (numberOfRows: number) => {
                    const currentState = usePlinkoGameStore.getState();
                    logger.logStateChange('number-of-rows', currentState.numberOfRows, numberOfRows, {
                        category: 'state'
                    });
                    set({ numberOfRows });
                },
                setFinish: (finish: PlinkoFinish) => {
                    const currentState = usePlinkoGameStore.getState();
                    logger.logStateChange('finish', currentState.finish, finish, {
                        category: 'state',
                        ballsDroppingChange: 1
                    });
                    set((state) => ({ finish, numberOfDroppingBall: state.numberOfDroppingBall + 1 }));
                },
                setFinishedBall: (finishedBall: PlinkoFinish) => {
                    const currentState = usePlinkoGameStore.getState();
                    logger.logStateChange('finished-ball', currentState.finishedBall, finishedBall, {
                        category: 'state',
                        ballsDroppingChange: -1,
                        roundId: finishedBall?.roundId
                    });
                    set((state) => ({ finishedBall, numberOfDroppingBall: state.numberOfDroppingBall - 1 }));
                },
            },
            reset: () => {
                logger.logGameEvent('store-reset', {
                    action: 'reset-to-defaults',
                    defaultBetAmount: 1,
                    defaultGameMode: GAME_MODES.MEDIUM,
                    defaultNumberOfRows: NUMBER_OF_ROWS.MAX
                });
                set({
                    betAmount: 1,
                    gameMode: GAME_MODES.MEDIUM,
                    numberOfRows: NUMBER_OF_ROWS.MAX,
                    finish: null,
                    numberOfDroppingBall: 0,
                    finishedBall: null,
                });
            },
        };
    })
);

logger.endWorkflow('plinko-game-store-init');

export default usePlinkoGameStore;
