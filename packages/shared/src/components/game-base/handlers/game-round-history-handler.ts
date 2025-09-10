import { GameEventActionType } from '@shared/react-contexts/game-state-context/game-event-action';
import { GameStateContextModel } from '@shared/react-contexts/game-state-context/game-state-context-model';
import useGameStore from '@shared/stores/game-store/game-store';
import { RoundState } from "../type";

export type GameRoundHistorydHandlerProps = {
    dispatch: Function;
    gameStateContextModel(): GameStateContextModel;
};

export class GameRoundHistoryHandler {
    constructor(private readonly props: GameRoundHistorydHandlerProps) {}

    handleRoundHistory({ roundHistory, roundId, newRoundState }) {
        const { roundState, isUMInFirstLoad } = this.props.gameStateContextModel();
        let verifiedRoundState = roundState;

        if (verifiedRoundState === RoundState.None) {
            verifiedRoundState = newRoundState;
        }

        useGameStore.getState().setRoundHistory({
            roundHistory: roundHistory,
            roundId: [RoundState.DisplayResult].includes(newRoundState) || isUMInFirstLoad ? roundId - 1 : roundId,
            settlementResult: roundHistory[0]?.settlementResult,
            isShowBlink: [RoundState.LockingBet].includes(verifiedRoundState),
        });

        this.props.dispatch({
            type: GameEventActionType.ROUND_HISTORY,
            payload: {
                roundHistory: roundHistory,
                roundId: [RoundState.DisplayResult].includes(newRoundState) || isUMInFirstLoad ? roundId - 1 : roundId,
                settlementResult: roundHistory[0]?.settlementResult,
                isShowBlink: [RoundState.LockingBet].includes(verifiedRoundState),
            },
        });
    }
}
