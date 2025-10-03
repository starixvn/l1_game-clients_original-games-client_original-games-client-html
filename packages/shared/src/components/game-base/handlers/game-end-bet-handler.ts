import { Dispatch } from "react";
import { getGameSettings } from '@shared/app-settings';
import { GameEventAction, GameEventActionType } from '@shared/react-contexts/game-state-context/game-event-action';
import { GameStateContextModel } from '@shared/react-contexts/game-state-context/game-state-context-model';
import { IRoundStateHandler } from "../../round-base/round-state-handler";
import { Round } from "../type";
import { GameMessageHandler, messageEventType } from "./";
import { GameRoundDataHandler } from "./game-round-data-handler";
import useGameStore from '@shared/stores/game-store/game-store';

export type GameEndBetHandlerProps = {
    dispatch: Dispatch<GameEventAction>;
    gameMessageHandler: GameMessageHandler;
    roundStateHandler: IRoundStateHandler;
    runGame: Function;
    gameId: number;
    gameStateContextModel(): GameStateContextModel;
    gameRoundDataHandler: GameRoundDataHandler;
};

export class GameEndBetHandler {
    protected showResultInfoTimeout: NodeJS.Timeout;
    protected showWinningAnimationTimeout: NodeJS.Timeout;

    private _betWin = 0;
    private _roundHistory: Round<object, object>[];
    private _finish: Round<object, object>;

    constructor(private readonly props: GameEndBetHandlerProps) {}

    set betWin(betWin: number) {
        this._betWin = betWin;
    }

    registerEvents = () => {
        this.props.gameMessageHandler.register(messageEventType.END_BET, this.handleEndBetEvent.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_HISTORY, this.handleRoundHistoryHandler.bind(this));
    };

    handleEndBetEvent(message) {
        const { endBet, finish } = message;

        console.log("ZEPHYR LOG - GAME END BET HANDLER - handleEndBetEvent - message::: ", message);
        

        if (endBet === -1) {
            return;
        }

        if (finish) {
            this.handleFinishResult(finish);
        }
    }

    handleRoundHistoryHandler(history) {
        const { roundHistory } = history;
        if (roundHistory) {
            this._roundHistory = roundHistory;
        }
    }

    handleFinishResult = (finish) => {
        if (!finish) {
            return;
        }

        const { result, settlementResult, roundId, winAmount } = finish;
        console.log("ZEPHYR LOG - GAME END BET HANDLER - result:: ", result, "\n settlementResult:: ", settlementResult, "\n roundId:: ", roundId, "\n winAmount:: ", winAmount);
        

        const { dispatch, gameMessageHandler, gameRoundDataHandler, gameStateContextModel } = this.props;
        console.log("ZEPHYR LOG - GAME END BET HANDLER - gameStateContextModel:: ", gameStateContextModel().roundData);
        this._finish = finish;
        this._betWin = winAmount || 0;

        const roundData = gameRoundDataHandler.buildGameRoundDataAfterReceiveFinishEvent(
            gameStateContextModel().roundData,
            result,
            roundId
        );

        console.log("ZEPHYR LOG - GAME END BET HANDLER - handleFinishResult - roundData::: ", roundData);

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

        this.showResultInfoTimeout = setTimeout(() => {
            this.handleRoundHistory();
        }, 0);

        this.showWinningAnimationTimeout = setTimeout(() => {
            dispatch({
                type: GameEventActionType.SHOW_WINNING_ANIMATION,
                payload: {
                    showWinningAnimation: true,
                },
            });

            this._betWin > 0 && gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: true });
        }, 0);
    };

    handleRoundHistory = () => {
        const roundHistoryClone = this._roundHistory?.length ? [...this._roundHistory] : [];
        const gameSettings = getGameSettings(this.props.gameId);

        this._finish && roundHistoryClone?.unshift(this._finish);
        if (roundHistoryClone.length > gameSettings.numberOfRoundHistory) {
            roundHistoryClone.pop();
        }

        this._roundHistory = roundHistoryClone;

        useGameStore.getState().showResultInfoTimeOut({ 
            roundHistory: roundHistoryClone, 
            isShowBlink: false, 
            showResultInfo: true 
        });

        console.log("ZEPHYR LOG - GAME END BET HANDLER - handleRoundHistory - roundHistoryClone::: ", roundHistoryClone);

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
