import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameDurations, RoundState } from "../game-base/type";
import { GameMessageHandler, messageEventType } from "../game-base/handlers/game-message-handler";
import { writeDebugLog } from "../../_shared/helpers";
import { Turn, TurnTimelineCounter } from "./turn-time-counter-handler";

export type TurnIdHandlerProps = {
    dispatch: Function;
    gameStateContextModel(): GameStateContextModel;
    gameMessageHandler: GameMessageHandler;
    totalTurns?: number;
    durations: GameDurations;
};

export class TurnIdHandler {
    private turnCounter = 0;
    private roundState: RoundState = RoundState.None;
    private shouldRunWhenFirstLoad = false;
    private roundRemainingTime = 0;
    private drawId = 0;
    protected roundId = 0;
    private readonly turnTimelineCounter: TurnTimelineCounter;

    constructor(protected readonly props: TurnIdHandlerProps, turnTimelineCounter?: TurnTimelineCounter) {
        this.turnTimelineCounter = turnTimelineCounter ?? new TurnTimelineCounter(props.durations);
    }

    registerEvents() {
        this.shouldRunWhenFirstLoad = true;
        this.roundRemainingTime = 0;
        this.turnCounter = 0;
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
    };

    handleDrawId = ({ drawId }) => {
        const turnIndex = drawId % this.props.totalTurns;
        this.turnCounter = turnIndex === 0 ? this.props.totalTurns : turnIndex;
        this.drawId = drawId;

        let turn: Turn = {
            id: this.drawId,
            index: this.turnCounter,
        };

        if (this.shouldRunWhenFirstLoad) {
            this.shouldRunWhenFirstLoad = false;
            turn = this.turnTimelineCounter.calculateTurn(this.roundRemainingTime, this.roundId, this.drawId);

            this.dispatchClientSeed(turn.id);
            this.dispatchTurnCounter(true, turn.index);
            this.dispatchDrawId(turn.id);
        } else if (!this.isInDisplayResultState()) {
            this.dispatchClientSeed(this.drawId);
            this.dispatchTurnCounter(true, this.turnCounter);
            this.dispatchDrawId(this.drawId);
        }

        writeDebugLog({
            name: "TurnIdHandler - handleDrawId",
            innerRoundState: RoundState[this.roundState],
            drawId,
            turnCounter: this.turnCounter,
            turn,
        });
    };

    handleRoundState = ({ roundState }) => {
        if (roundState === RoundState.InRound && this.isInDisplayResultState()) {
            this.dispatchClientSeed(this.drawId);
            this.dispatchTurnCounter(false, this.turnCounter);
            this.dispatchDrawId(this.drawId);
        }

        this.roundState = roundState;
    };

    dispatchTurnCounter = (fromDrawId, turnCounter) => {
        this.props.dispatch({
            type: GameEventActionType.TURN_COUNTER,
            payload: { turnCounter },
        });

        writeDebugLog({
            name: "TurnIdHandler dispatch turnCounter",
            turnCounter,
            fromDrawId,
            roundState: RoundState[this.roundState],
        });
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
