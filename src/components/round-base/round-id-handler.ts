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
    pfSeedBy?: "drawId" | "roundId";
};

export class RoundIdHandler {
    private roundState: RoundState = RoundState.None;
    private shouldRunWhenFirstLoad = false;
    private roundRemainingTime = 0;
    private drawId = 0;
    protected roundId = 0;
    private pfSeedBy: "drawId" | "roundId" = "drawId";

    constructor(protected readonly props: RoundIdHandlerProps) {
        this.pfSeedBy = props.pfSeedBy ?? "drawId";
    }

    registerEvents() {
        this.shouldRunWhenFirstLoad = true;
        this.roundRemainingTime = 0;
        this.drawId = 0;
        this.roundState = RoundState.None;
        this.props.gameMessageHandler.register(messageEventType.REMAINING_TIME, this.handleRemainingTime.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_ID, this.handleRoundId.bind(this));
        this.props.gameMessageHandler.register(messageEventType.PF, this.handleRoundId.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_STATE, this.handleRoundState.bind(this));
    }

    handleRemainingTime = ({ remainingTime }) => {
        if (this.shouldRunWhenFirstLoad) {
            this.roundRemainingTime = remainingTime;
        }
    };

    handleRoundId = ({ pf }) => {
        this.roundId = pf?.roundId;
        if (!this.shouldRunWhenFirstLoad) {
            this.props.dispatch({
                type: GameEventActionType.ROUND_ID,
                payload: { roundId: pf.roundId },
            });
        }

        // For games where PF seed should be triggered by roundId instead of drawId
        console.log("droundid", this.pfSeedBy, pf?.roundId);
        if (this.pfSeedBy === "roundId") {
            if (this.shouldRunWhenFirstLoad) {
                this.shouldRunWhenFirstLoad = false;
                this.dispatchClientSeed(this.roundId);
                this.dispatchDrawId(this.drawId);
            } else if (!this.isInDisplayResultState()) {
               
                this.dispatchClientSeed(this.roundId);
                this.dispatchDrawId(this.drawId);
            }
        }

        this.handleDrawId({ drawId: this.roundId });
    };

    handleDrawId = ({ drawId }) => {
        this.drawId = drawId;

        // Always update game state's drawId
        this.dispatchDrawId(this.drawId);
        console.log("drawid", this.pfSeedBy);
        // Default behavior: trigger PF seed on drawId changes
        if (this.pfSeedBy === "drawId") {
            if (this.shouldRunWhenFirstLoad) {
                this.shouldRunWhenFirstLoad = false;
                this.dispatchClientSeed(this.drawId);
            } else if (!this.isInDisplayResultState()) {
                this.dispatchClientSeed(this.drawId);
            }
        }

        writeDebugLog({
            name: "RoundIdHandler - handleDrawId",
            innerRoundState: RoundState[this.roundState],
            drawId,
        });
    };

    handleRoundState = ({ roundState }) => {
        if (roundState === RoundState.InRound && this.isInDisplayResultState()) {
            const idForSeed = this.pfSeedBy === "roundId" ? this.roundId : this.drawId;
            this.dispatchClientSeed(idForSeed);
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

    dispatchClientSeed = (idForSeed: number) => {
        console.log("dispatchClientSeed", idForSeed);
        this.props.gameMessageHandler.broadcastGameEvent({
            // Reuse 'drawId' payload key for PF wrapper compatibility.
            // In roundId mode we intentionally send roundId value here.
            [messageEventType.SAVE_PF_SETTING_FROM_TURN_ID_HANLDER]: { drawId: idForSeed },
        });
    };

    private isInDisplayResultState() {
        return this.roundState === RoundState.DisplayResult || this.roundState === RoundState.BeforePlaceBet;
    }
}
