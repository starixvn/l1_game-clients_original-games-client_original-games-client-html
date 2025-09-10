import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameDurations, RoundState } from "../type";

type GameStateHandlerProps = {
    gameStateContextModel: GameStateContextModel;
    nextRoundState: RoundState;
    durations: GameDurations;
    defaultResult: any;
    defaultSettlementResult: any;
    remainingTime: number;
};

export interface IGameStateHandler {
    getNextRoundState({
        gameStateContextModel,
        nextRoundState,
        durations,
        defaultResult,
        defaultSettlementResult,
        remainingTime,
    }: GameStateHandlerProps);
}

export class GameStateHandler implements IGameStateHandler {
    getNextRoundState({
        gameStateContextModel,
        nextRoundState,
        durations,
        defaultResult,
        defaultSettlementResult,
        remainingTime,
    }: GameStateHandlerProps) {
        if (gameStateContextModel) {
            const { result, settlementResult } = gameStateContextModel;

            const newStateDetector = [
                {
                    condition: nextRoundState === RoundState.InRound,
                    state: { betWin: 0 },
                },
                {
                    condition: [RoundState.SwitchRound, RoundState.BeforePlaceBet, RoundState.InRound].includes(nextRoundState),
                    state: {
                        showWinningAnimation: false,
                        isShowBlink: false,
                        playResultAnimation: false,
                        showResultInfo: false,
                    },
                },
                {
                    condition: [RoundState.SwitchRound].includes(nextRoundState),
                    state: { roundData: {} },
                },
                {
                    condition: nextRoundState === RoundState.LockingBet,
                    state: {
                        isShowBlink: true,
                        result: defaultResult ?? result,
                        settlementResult: defaultSettlementResult ?? settlementResult,
                    },
                },
            ];

            return newStateDetector.reduce(
                (newState, stateDetector) => {
                    if (stateDetector.condition) {
                        newState = Object.assign(newState, stateDetector.state);
                    }
                    return newState;
                },
                {
                    remainingTime: this.getTimeCounter({
                        remainingTime,
                        durations: durations,
                        roundState: nextRoundState,
                    }),
                }
            );
        }
        
        // Return default state if gameStateContextModel is not available
        return {
            remainingTime: this.getTimeCounter({
                remainingTime,
                durations: durations,
                roundState: nextRoundState,
            }),
        };
    }

    private getTimeCounter({
        remainingTime,
        durations,
        roundState,
    }: {
        remainingTime: number;
        durations: GameDurations;
        roundState: RoundState;
    }): number {
        switch (roundState) {
            case RoundState.InRound:
            case RoundState.LockingBet:
                return remainingTime;
            case RoundState.BeforePlaceBet:
                return durations.beforePlaceBet;
            default:
                return 0;
        }
    }
}
