import { Dispatch } from "react";
import { getGameSettings } from "../../../_shared/app-settings";
import { GameEventAction, GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { IRoundStateHandler } from "../../round-base/round-state-handler";
import { GameDurations, Round } from "../type";
import { GameMessageHandler, messageEventType } from "./";
import { GameRoundDataHandler } from "./game-round-data-handler";
import useGameStore from "../../../_shared/stores/game-store/game-store";

export type GameFinishHandlerProps = {
    dispatch: Dispatch<GameEventAction>;
    gameMessageHandler: GameMessageHandler;
    durations: GameDurations;
    roundStateHandler: IRoundStateHandler;
    runGame: Function;
    gameId: number;
    gameStateContextModel(): GameStateContextModel;
    gameRoundDataHandler: GameRoundDataHandler;
};

export class GameFinishHandler {
    protected showResultInfoTimeout: NodeJS.Timeout;
    protected showWinningAnimationTimeout: NodeJS.Timeout;

    private _betWin = 0;
    private _roundHistory: Round<object, object>[];
    private _finish: Round<object, object>;

    constructor(private readonly props: GameFinishHandlerProps) {}

    set betWin(betWin: number) {
        this._betWin = betWin;
    }

    registerEvents = () => {
        this.props.gameMessageHandler.register(messageEventType.FINISH, this.handleFinishHandler.bind(this));
        this.props.gameMessageHandler.register(messageEventType.STATUS, this.handleStatus);
        this.props.gameMessageHandler.register(messageEventType.ROUND_HISTORY, this.handleRoundHistoryHandler.bind(this));
    };

    handleFinishHandler(finish) {
        this.handleFinish(finish);
        this.props.runGame?.(this.props.roundStateHandler.getWholeRoundDuration({ durations: this.props.durations }));
    }

    handleRoundHistoryHandler(history) {
        const { roundHistory } = history;
        if (roundHistory) {
            this._roundHistory = roundHistory;
        }
    }

    handleStatus = ({ status }) => {
        const { win, bet } = status;
        win &&
            this.props.dispatch({
                type: GameEventActionType.WIN_STATUS,
                payload: { status },
            });

        this._betWin = win ? bet : 0;
    };

    handleFinish = ({ finish }) => {
        if (!finish) {
            return;
        }

        const { result, settlementResult, roundId } = finish;
        const { dispatch, gameMessageHandler, gameRoundDataHandler, gameStateContextModel } = this.props;
        const durations = this.props.durations;
        this._finish = finish;

        const roundData = gameRoundDataHandler.buildGameRoundDataAfterReceiveFinishEvent(
            gameStateContextModel().roundData,
            result,
            roundId
        );

        dispatch({
            type: GameEventActionType.FINISH,
            payload: {
                playResultAnimation: true,
                result: result,
                settlementResult: settlementResult,
                roundId: roundId,
                roundData,
            },
        });

        const animationDuration = durations.resultAnimation * 1000;
        this.showResultInfoTimeout = setTimeout(() => {
            this.handleRoundHistory();
        }, animationDuration);

        this.showWinningAnimationTimeout = setTimeout(() => {
            dispatch({
                type: GameEventActionType.SHOW_WINNING_ANIMATION,
                payload: {
                    showWinningAnimation: true,
                },
            });

            this._betWin > 0 && gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: true });
        }, durations.showResult * 1000);
    };

    handleRoundHistory = () => {
        const roundHistoryClone = this._roundHistory?.length ? [...this._roundHistory] : [];
        const gameSettings = getGameSettings(this.props.gameId);

        this._finish && roundHistoryClone?.unshift(this._finish);
        if (roundHistoryClone.length > gameSettings.numberOfRoundHistory) {
            roundHistoryClone.pop();
        }

        this._roundHistory = roundHistoryClone;
        useGameStore.getState().showResultInfoTimeOut({ roundHistory: roundHistoryClone, isShowBlink: false, showResultInfo: true });
        this.props.dispatch({
            type: GameEventActionType.SHOW_RESULT_INFO_TIME_OUT,
            payload: {
                showResultInfo: true,
                isShowBlink: false,
                roundHistory: roundHistoryClone,
            },
        });
    };

    clearTimeout = () => {
        this.showResultInfoTimeout && clearTimeout(this.showResultInfoTimeout);
        this.showWinningAnimationTimeout && clearTimeout(this.showWinningAnimationTimeout);
    };
}
