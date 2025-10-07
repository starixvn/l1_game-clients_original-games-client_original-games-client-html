import { Dispatch } from "react";
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";
import { GameEventAction, GameEventActionType } from "@shared/react-contexts/game-state-context/game-event-action";
import { RoundState } from "@shared/components/game-base/type";

export type PlinkoInGameHandlerProps = {
    dispatch: Dispatch<GameEventAction>;
    gameMessageHandler: GameMessageHandler;
};

export class PlinkoInGameHandler {
    constructor(private readonly props: PlinkoInGameHandlerProps) {}

    registerEvents() {
        this.props.gameMessageHandler.register(messageEventType.GAME_CONFIG, () => this.handleGameConfig());
    }

    handleGameConfig() {
        this.props.dispatch({
            type: GameEventActionType.UPDATE_ROUND_STATE,
            payload: {
                roundState: RoundState.InRound,
            },
        });
    }
}
