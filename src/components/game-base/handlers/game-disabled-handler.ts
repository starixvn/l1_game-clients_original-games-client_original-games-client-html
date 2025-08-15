import { updateURLContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { IRoundStateHandler } from "../../round-base/round-state-handler";
import { GameDurations, RoundState } from "../type";
import { GameMessageHandler, messageEventType } from "./game-message-handler";
import useGameStore from "../../../_shared/stores/game-store/game-store";

export type GameDisabledHandlerProps = {
    dispatch: Function;
    gameMessageHandler: GameMessageHandler;
    roundStateHandler: IRoundStateHandler;
    gameStateContextModel(): GameStateContextModel;
    durations: GameDurations;
};

export class GameDisableHandler {
    constructor(private readonly props: GameDisabledHandlerProps) {
    }

    handleUM({ um, um_message, remainingTime }, timeCounter: number) {
        const { durations, gameStateContextModel } = this.props;
        const wholeRound = this.props.roundStateHandler.getWholeRoundDuration({ durations });

        this.props.dispatch({
            type: GameEventActionType.SET_UM_FIRST_LOADING,
            payload: { isUMInFirstLoad: um && remainingTime && remainingTime + 1 === wholeRound },
        });

        if (
            um &&
            (timeCounter <= durations.placingBets + durations.beforePlaceBet + 1 ||
                remainingTime + 1 === wholeRound ||
                gameStateContextModel().roundState === RoundState.None ||
                gameStateContextModel().roundState === RoundState.ConnectFailed)
        ) {
            this.props.gameMessageHandler.broadcastGameEvent({
                [messageEventType.CLEAR_GAME_TIMEOUT_AND_INTERVAL]: true,
            });

            this.props.dispatch({
                type: GameEventActionType.UM,
                payload: {
                    um_message,
                },
            });
            useGameStore.getState().setRoundState(RoundState.Disabled);
            useGameStore.getState().setUMMessage(um_message);
            useGameStore.getState().setShowResultInfo(false);

            updateURLContext({ gameId: 0 });
        }
    }
}
