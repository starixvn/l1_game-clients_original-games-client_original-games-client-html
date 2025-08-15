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
        console.log("[GameDisableHandler] constructor called");
    }

    handleUM({ um, um_message, remainingTime }, timeCounter: number) {
        console.log("[GameDisableHandler] handleUM called with:", { um, um_message, remainingTime, timeCounter });
        const { durations, gameStateContextModel } = this.props;
        const wholeRound = this.props.roundStateHandler.getWholeRoundDuration({ durations });

        console.log("[GameDisableHandler] wholeRound duration:", wholeRound);

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
            console.log("[GameDisableHandler] game disabled condition met, broadcasting clear timeout");
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

            console.log("[GameDisableHandler] updating URL context to gameId 0");
            updateURLContext({ gameId: 0 });
        }
    }
}
