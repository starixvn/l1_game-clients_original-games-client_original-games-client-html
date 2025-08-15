import { useTranslate } from "@tolgee/react";
import { createContext, useContext, useReducer } from "react";

import { RoundState } from "../../../components/game-base/type";
import { LanguageLocaleMapper } from "../../constants";
import { tolgee } from "../../tolgee";
import { GameEventAction, GameEventActionType } from "./game-event-action";
import { GameStateContextModel, initialGameStateContextModel } from "./game-state-context-model";

export const GameStateContext = createContext({ rate: 1 } as GameStateContextModel);
const GameStateDispatchContext = createContext(null);
const GameTranslateContext = createContext(null);

export function GameStateProvider({ children }) {
    const [gameStateContextModel, dispatch] = useReducer(gameStateReducer, initialGameStateContextModel());
    return (
        <GameStateContext.Provider value={gameStateContextModel}>
            <GameStateDispatchContext.Provider value={dispatch}>
                <GameTranslateContext.Provider value={useTranslate}>{children}</GameTranslateContext.Provider>
            </GameStateDispatchContext.Provider>
        </GameStateContext.Provider>
    );
}

export const useGameStateContext = () => {
    return useContext(GameStateContext);
};

export function useGameStatesDispatch() {
    return useContext(GameStateDispatchContext);
}

export function useGameTranslateContext() {
    return useContext(GameTranslateContext);
}

// Helper functions to handle different action types
function handleConnectAction(state: GameStateContextModel): GameStateContextModel {
    return {
        ...state,
        isConnect: true,
        roundData: {},
        drawId: 0,
    };
}

function handleDisconnectAction(state: GameStateContextModel): GameStateContextModel {
    return {
        ...state,
        isConnect: false,
        playResultAnimation: false,
    };
}

function handleSignInAction(state: GameStateContextModel): GameStateContextModel {
    return {
        ...state,
        signedIn: true,
        availableInGameData: false,
    };
}

function handleSignOutAction(state: GameStateContextModel): GameStateContextModel {
    return {
        ...state,
        signedIn: false,
        showResultInfo: false,
    };
}

function handleUMAction(state: GameStateContextModel, umMessage: any): GameStateContextModel {
    return {
        ...state,
        roundState: RoundState.Disabled,
        disabledMessage: umMessage[LanguageLocaleMapper[tolgee.getLanguage() || "en"]], // TO DO: remove hard code
        showResultInfo: false,
    };
}

function handleGameConfigsAction(state: GameStateContextModel, gameConfigs: any): GameStateContextModel {
    return {
        ...state,
        gameConfigs: gameConfigs,
        availableInGameData: true,
    };
}

function handleRoundDataAction(state: GameStateContextModel, roundData: any): GameStateContextModel {
    return {
        ...state,
        roundData: state.roundState === RoundState.SwitchRound ? {} : roundData,
    };
}

function handleRoundHistoryAction(state: GameStateContextModel, payload: any): GameStateContextModel {
    const { roundHistory, roundId, result, settlementResult, isShowBlink } = payload;
    return {
        ...state,
        roundHistory,
        roundId,
        result,
        settlementResult,
        isShowBlink,
        playResultAnimation: false,
        showResultInfo: true,
    };
}

function handleFinishAction(state: GameStateContextModel, payload: any): GameStateContextModel {
    const { playResultAnimation, result, settlementResult, roundId, drawId, roundData } = payload;
    return {
        ...state,
        playResultAnimation,
        result,
        settlementResult,
        roundId,
        drawId,
        roundData,
        showResultInfo: false,
    };
}

function handleWinStatusAction(state: GameStateContextModel, status: any): GameStateContextModel {
    return {
        ...state,
        betWin: status.bet,
    };
}

function handleDisconnectErrorAction(state: GameStateContextModel, disconnectReason: string): GameStateContextModel {
    return {
        ...state,
        roundState: RoundState.ConnectFailed,
        signedIn: false,
        disconnectReason,
    };
}

function handleUserStakeLevelAction(state: GameStateContextModel, userStakeLevel: any): GameStateContextModel {
    return {
        ...state,
        userStakeLevel,
    };
}

function handleOddsAction(state: GameStateContextModel, odds: any): GameStateContextModel {
    return {
        ...state,
        gameConfigs: {
            ...state.gameConfigs,
            odds,
        },
    };
}

function handleDrawIdAction(state: GameStateContextModel, drawId: number): GameStateContextModel {
    return {
        ...state,
        drawId,
    };
}

function handleSetNewGameStateAction(state: GameStateContextModel, newGameState: any): GameStateContextModel {
    return {
        ...state,
        ...newGameState,
    };
}

function handleShowWinningAnimationAction(state: GameStateContextModel, showWinningAnimation: boolean): GameStateContextModel {
    return {
        ...state,
        showWinningAnimation,
    };
}

function handleActiveScoreBoardAction(state: GameStateContextModel, activeScoreboardTab: any): GameStateContextModel {
    return {
        ...state,
        activeScoreboardTab,
    };
}

function handlePlayResultAnimationAction(state: GameStateContextModel, playResultAnimation: boolean): GameStateContextModel {
    return {
        ...state,
        playResultAnimation,
    };
}

function handleShowResultInfoTimeOutAction(state: GameStateContextModel, payload: any): GameStateContextModel {
    const { showResultInfo, isShowBlink, roundHistory, playResultAnimation } = payload;
    const stateUpdate: any = {
        showResultInfo,
        isShowBlink,
        roundHistory,
    };

    if (playResultAnimation) {
        stateUpdate["playResultAnimation"] = playResultAnimation;
    }

    return {
        ...state,
        ...stateUpdate,
    };
}

function handleSetUMFirstLoadingAction(state: GameStateContextModel, isUMInFirstLoad: boolean): GameStateContextModel {
    return {
        ...state,
        isUMInFirstLoad,
    };
}

function handleToggleBetHistoryAction(state: GameStateContextModel, isShowBetHistory: boolean): GameStateContextModel {
    return {
        ...state,
        isShowBetHistory,
    };
}

function handleToggleBetDetailAction(state: GameStateContextModel, isShowBetDetail: boolean): GameStateContextModel {
    return {
        ...state,
        isShowBetDetail,
    };
}

function handleToggleGameGuideAction(state: GameStateContextModel, isShowGameGuide: boolean): GameStateContextModel {
    return {
        ...state,
        isShowGameGuide,
    };
}

function handleUpdateBetDetailAction(state: GameStateContextModel, betDetailModalData: any): GameStateContextModel {
    return {
        ...state,
        betDetailModalData,
    };
}

function handleStartNewRoundAnimAction(state: GameStateContextModel, isPlayStartRoundAnimation: boolean): GameStateContextModel {
    return {
        ...state,
        isPlayStartRoundAnimation,
    };
}

function handleRoundIdAction(state: GameStateContextModel, roundId: number): GameStateContextModel {
    return {
        ...state,
        roundId,
    };
}

function handleActiveScoreBoardTabAction(state: GameStateContextModel, isScoreboardTab: boolean): GameStateContextModel {
    return {
        ...state,
        isScoreboardTab,
    };
}

function gameStateReducer(state: GameStateContextModel, action: GameEventAction) {
    const { type, payload } = action;

    switch (type) {
        case GameEventActionType.CONNECT:
            return handleConnectAction(state);

        case GameEventActionType.DISCONNECT:
            return handleDisconnectAction(state);

        case GameEventActionType.SIGN_IN:
            return handleSignInAction(state);

        case GameEventActionType.SIGN_OUT:
            return handleSignOutAction(state);

        case GameEventActionType.UM:
            return handleUMAction(state, payload.um_message);

        case GameEventActionType.GAME_CONFIGS:
            return handleGameConfigsAction(state, payload.gameConfigs);

        case GameEventActionType.ROUND_DATA:
            return handleRoundDataAction(state, payload.roundData);

        case GameEventActionType.ROUND_HISTORY:
            return handleRoundHistoryAction(state, payload);

        case GameEventActionType.FINISH:
            return handleFinishAction(state, payload);

        case GameEventActionType.WIN_STATUS:
            return handleWinStatusAction(state, payload.status);

        case GameEventActionType.DISCONNECT_ERROR:
            return handleDisconnectErrorAction(state, payload.disconnectReason);

        case GameEventActionType.USER_STAKE_LEVEL:
            return handleUserStakeLevelAction(state, payload.userStakeLevel);

        case GameEventActionType.ODDS:
            return handleOddsAction(state, payload.odds);

        case GameEventActionType.DRAW_ID:
            return handleDrawIdAction(state, payload.drawId);

        case GameEventActionType.SET_NEW_GAME_STATE:
            return handleSetNewGameStateAction(state, payload.newGameState);

        case GameEventActionType.SHOW_WINNING_ANIMATION:
            return handleShowWinningAnimationAction(state, payload.showWinningAnimation);

        case GameEventActionType.ACTIVE_SCORE_BOARD:
            return handleActiveScoreBoardAction(state, payload.activeScoreboardTab);

        case GameEventActionType.PLAY_RESULT_ANIMATION:
            return handlePlayResultAnimationAction(state, payload.playResultAnimation);

        case GameEventActionType.SHOW_RESULT_INFO_TIME_OUT:
            return handleShowResultInfoTimeOutAction(state, payload);

        case GameEventActionType.SET_UM_FIRST_LOADING:
            return handleSetUMFirstLoadingAction(state, payload.isUMInFirstLoad);

        case GameEventActionType.TOGGLE_BET_HISTORY:
            return handleToggleBetHistoryAction(state, payload.isShowBetHistory);

        case GameEventActionType.TOGGLE_BET_DETAIL:
            return handleToggleBetDetailAction(state, payload.isShowBetDetail);

        case GameEventActionType.TOGGLE_GAME_GUIDE:
            return handleToggleGameGuideAction(state, payload.isShowGameGuide);

        case GameEventActionType.UPDATE_BET_DETAIL:
            return handleUpdateBetDetailAction(state, payload.betDetailModalData);

        case GameEventActionType.START_NEW_ROUND_ANIM:
            return handleStartNewRoundAnimAction(state, payload.isPlayStartRoundAnimation);

        case GameEventActionType.ROUND_ID:
            return handleRoundIdAction(state, payload.roundId);

        case GameEventActionType.ACTIVE_SCORE_BOARD_TAB:
            return handleActiveScoreBoardTabAction(state, payload.isScoreboardTab);

        default: {
            console.warn(JSON.stringify(action));
            throw Error("Unknown action: " + action.type);
        }
    }
}
