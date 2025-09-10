import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameDurations, RoundState } from "../game-base/type";
import { GameMessageHandler, messageEventType } from "../game-base/handlers/game-message-handler";

export type RoundIdHandlerProps = {
    dispatch: Function;
    gameStateContextModel(): GameStateContextModel;
    gameMessageHandler: GameMessageHandler;
    durations: GameDurations;
    pfSeedBy?: "roundId";
};

export class RoundIdHandler {
    private roundState: RoundState = RoundState.None;
    private shouldRunWhenFirstLoad = false;
    private roundRemainingTime = 0;
    protected roundId = 0;
    private readonly pfSeedBy = "roundId" as const;

    constructor(protected readonly props: RoundIdHandlerProps) {
        this.pfSeedBy = "roundId";
    }

    registerEvents() {
        this.shouldRunWhenFirstLoad = true;
        this.roundRemainingTime = 0;
        this.roundState = RoundState.None;
        this.props.gameMessageHandler.register(messageEventType.REMAINING_TIME, this.handleRemainingTime.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_ID, this.handleRoundId.bind(this));
        this.props.gameMessageHandler.register(messageEventType.PF, this.handlePF.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_STATE, this.handleRoundState.bind(this));
    }

    handleRemainingTime = ({ remainingTime }) => {
        if (this.shouldRunWhenFirstLoad) {
            this.roundRemainingTime = remainingTime;
        }
    };

    handleRoundId = ({ roundId }) => {
        this.roundId = roundId;

        // PF seed is triggered by roundId
        if (this.pfSeedBy === "roundId") {
            if (this.shouldRunWhenFirstLoad) {
                this.shouldRunWhenFirstLoad = false;
                this.dispatchClientSeed(this.roundId);
                this.dispatchRoundId(this.roundId);
            } else if (!this.isInDisplayResultState()) {
                this.dispatchRoundId(this.roundId);
                this.dispatchClientSeed(this.roundId);
            }
        }
    };

    handlePF = ({ pf }) => {
        this.roundId = pf?.roundId;

        if (!this.isInDisplayResultState()) {
            this.dispatchRoundId(this.roundId);
            this.dispatchClientSeed(this.roundId);
        }
    };

    // drawId handling removed

    handleRoundState = ({ roundState }) => {
        if (roundState === RoundState.InRound && this.isInDisplayResultState()) {
            this.dispatchClientSeed(this.roundId);
        }

        this.roundState = roundState;
    };

    // dispatchDrawId removed

    dispatchRoundId = (roundId) => {
        this.props.dispatch({
            type: GameEventActionType.ROUND_ID,
            payload: { roundId },
        });
    };

    dispatchClientSeed = (idForSeed: number) => {
        this.props.gameMessageHandler.broadcastGameEvent({
            [messageEventType.SAVE_PF_SETTING_FROM_TURN_ID_HANLDER]: { roundId: idForSeed },
        });
    };

    private isInDisplayResultState() {
        return this.roundState === RoundState.DisplayResult || this.roundState === RoundState.BeforePlaceBet;
    }
}
