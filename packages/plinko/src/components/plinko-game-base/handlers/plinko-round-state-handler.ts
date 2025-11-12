import { Dispatch } from "react";
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";
import { GameEventAction, GameEventActionType } from "@shared/react-contexts/game-state-context/game-event-action";
import { RoundState } from "@shared/components/game-base/type";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { GameStateContextModel } from "@shared/react-contexts/game-state-context/game-state-context-model";

export type PlinkoRoundStateHandlerProps = {
    dispatch: Dispatch<GameEventAction>;
    gameMessageHandler: GameMessageHandler;
    gameStateContextModel: GameStateContextModel;
};

export class PlinkoRoundStateHandler {
    constructor(private readonly props: PlinkoRoundStateHandlerProps) {}

    registerEvents() {
        this.props.gameMessageHandler.register(messageEventType.GAME_CONFIG, this.handleGameConfig.bind(this));
        usePlinkoGameStore.subscribe((state) => state.numberOfDroppingBall, this.handleAfterFinishedBall.bind(this));
    }

    handleGameConfig() {
        this.props.dispatch({
            type: GameEventActionType.UPDATE_ROUND_STATE,
            payload: { roundState: RoundState.None },
        });
    }

    handleAfterFinishedBall(numberOfDroppingBall: number) {
        if (numberOfDroppingBall === 0) {
            this.props.dispatch({
                type: GameEventActionType.UPDATE_ROUND_STATE,
                payload: { roundState: RoundState.None },
            });
        } else {
            const { gameStateContextModel } = this.props;
            const roundState = gameStateContextModel.roundState;
            if (roundState !== RoundState.InRound) {
                this.props.dispatch({
                    type: GameEventActionType.UPDATE_ROUND_STATE,
                    payload: { roundState: RoundState.InRound },
                });
            }
        }
    }
}
