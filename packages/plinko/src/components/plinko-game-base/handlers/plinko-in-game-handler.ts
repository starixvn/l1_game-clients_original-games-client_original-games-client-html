import { Dispatch } from "react";
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";
import { GameEventAction, GameEventActionType } from "@shared/react-contexts/game-state-context/game-event-action";
import { RoundState } from "@shared/components/game-base/type";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";

export type PlinkoInGameHandlerProps = {
    dispatch: Dispatch<GameEventAction>;
    gameMessageHandler: GameMessageHandler;
};

export class PlinkoInGameHandler {
    constructor(private readonly props: PlinkoInGameHandlerProps) {}

    registerEvents() {
        this.props.gameMessageHandler.register(messageEventType.GAME_CONFIG, () => this.handleGameConfig());
        usePlinkoGameStore.subscribe((state) => state.numberOfDroppingBall, this.handleAfterFinishedBall.bind(this));
    }

    handleGameConfig() {
        this.props.dispatch({
            type: GameEventActionType.UPDATE_ROUND_STATE,
            payload: {
                roundState: RoundState.InRound,
            },
        });
    }

    handleAfterFinishedBall(numberOfDroppingBall: number) {
        if (numberOfDroppingBall === 0) {
            this.props.dispatch({
                type: GameEventActionType.UPDATE_ROUND_STATE,
                payload: { roundState: RoundState.None },
            });
        }
    }
}
