import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameDurations, RoundState } from "../game-base/type";
import { GameMessageHandler, messageEventType } from "../game-base/handlers/game-message-handler";
import { writeDebugLog } from "../../_shared/helpers";

export type RoundIdHandlerProps = {
    dispatch: Function;
    gameStateContextModel(): GameStateContextModel;
    gameMessageHandler: GameMessageHandler;
    durations: GameDurations;
};

export class RoundIdHandler {
    private roundState: RoundState = RoundState.None;
    private shouldRunWhenFirstLoad = false;
    private roundRemainingTime = 0;
    private drawId = 0;
    protected roundId = 0;

    constructor(protected readonly props: RoundIdHandlerProps) {}

    registerEvents() {
        this.shouldRunWhenFirstLoad = true;
        this.roundRemainingTime = 0;
        this.drawId = 0;
        this.roundState = RoundState.None;
        this.props.gameMessageHandler.register(messageEventType.REMAINING_TIME, this.handleRemainingTime.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_ID, this.handleRoundId.bind(this));
        this.props.gameMessageHandler.register(messageEventType.DRAW_ID, this.handleDrawId.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_STATE, this.handleRoundState.bind(this));
    }

    handleRemainingTime = ({ remainingTime }) => {
        if (this.shouldRunWhenFirstLoad) {
            this.roundRemainingTime = remainingTime;
        }
    };

    handleRoundId = ({ roundId }) => {
        this.roundId = roundId;
        if (!this.shouldRunWhenFirstLoad) {
            this.props.dispatch({
                type: GameEventActionType.ROUND_ID,
                payload: { roundId },
            });
        }
    };

    handleDrawId = ({ drawId }) => {
        this.drawId = drawId;

        if (this.shouldRunWhenFirstLoad) {
            this.shouldRunWhenFirstLoad = false;
            this.dispatchClientSeed(this.drawId);
            this.dispatchDrawId(this.drawId);
        } else if (!this.isInDisplayResultState()) {
            this.dispatchClientSeed(this.drawId);
            this.dispatchDrawId(this.drawId);
        }

        writeDebugLog({
            name: "RoundIdHandler - handleDrawId",
            innerRoundState: RoundState[this.roundState],
            drawId,
        });
    };

    handleRoundState = ({ roundState }) => {
        if (roundState === RoundState.InRound && this.isInDisplayResultState()) {
            this.dispatchClientSeed(this.drawId);
            this.dispatchDrawId(this.drawId);
        }

        this.roundState = roundState;
    };

    dispatchDrawId = (drawId) => {
        this.props.dispatch({
            type: GameEventActionType.DRAW_ID,
            payload: { drawId },
        });
    };

    dispatchClientSeed = (drawId) => {
        this.props.gameMessageHandler.broadcastGameEvent({
            [messageEventType.SAVE_PF_SETTING_FROM_TURN_ID_HANLDER]: { drawId },
        });
    };

    private isInDisplayResultState() {
        return this.roundState === RoundState.DisplayResult || this.roundState === RoundState.BeforePlaceBet;
    }
}
