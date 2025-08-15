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

function gameStateReducer(state: GameStateContextModel, action: GameEventAction) {
    const { type, payload } = action;
    const {
        um_message,
        gameConfigs,
        roundData,
        roundHistory,
        roundId,
        result,
        settlementResult,
        status,
        userStakeLevel,
        odds,
        drawId,
        disconnectReason,
        showWinningAnimation,
        activeScoreboardTab,
        playResultAnimation,
        newGameState,
        showResultInfo,
        isShowBlink,
        isUMInFirstLoad,
        isShowBetHistory,
        isShowGameGuide,
        isShowBetDetail,
        betDetailModalData,
        isPlayStartRoundAnimation,
        isScoreboardTab,
        playerResultBoard,
    } = payload;

    switch (type) {
        case GameEventActionType.CONNECT: {
            return {
                ...state,
                isConnect: true,
                roundData: {},
                drawId: 0,
            };
        }

        case GameEventActionType.DISCONNECT: {
            return {
                ...state,
                isConnect: false,
                playResultAnimation: false,
            };
        }

        case GameEventActionType.SIGN_IN: {
            return {
                ...state,
                signedIn: true,
                availableInGameData: false,
            };
        }

        case GameEventActionType.SIGN_OUT: {
            return {
                ...state,
                signedIn: false,
                showResultInfo: false,
            };
        }

        case GameEventActionType.UM: {
            return {
                ...state,
                roundState: RoundState.Disabled,
                disabledMessage: um_message[LanguageLocaleMapper[tolgee.getLanguage() || "en"]], // TO DO: remove hard code
                showResultInfo: false,
            };
        }

        case GameEventActionType.GAME_CONFIGS: {
            return {
                ...state,
                gameConfigs: gameConfigs,
                availableInGameData: true,
            };
        }

        case GameEventActionType.ROUND_DATA: {
            return {
                ...state,
                roundData: state.roundState === RoundState.SwitchRound ? {} : roundData,
            };
        }

        case GameEventActionType.ROUND_HISTORY: {
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

        case GameEventActionType.FINISH: {
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

        case GameEventActionType.WIN_STATUS: {
            return {
                ...state,
                betWin: status.bet,
            };
        }

        case GameEventActionType.DISCONNECT_ERROR: {
            return {
                ...state,
                roundState: RoundState.ConnectFailed,
                signedIn: false,
                disconnectReason,
            };
        }

        case GameEventActionType.USER_STAKE_LEVEL: {
            return {
                ...state,
                userStakeLevel,
            };
        }

        case GameEventActionType.ODDS: {
            return {
                ...state,
                gameConfigs: {
                    ...state.gameConfigs,
                    odds,
                },
            };
        }

        case GameEventActionType.DRAW_ID: {
            return {
                ...state,
                drawId,
            };
        }

        case GameEventActionType.SET_NEW_GAME_STATE: {
            return {
                ...state,
                ...newGameState,
            };
        }

        case GameEventActionType.SHOW_WINNING_ANIMATION: {
            return {
                ...state,
                showWinningAnimation,
            };
        }

        case GameEventActionType.ACTIVE_SCORE_BOARD: {
            return {
                ...state,
                activeScoreboardTab,
            };
        }

        case GameEventActionType.PLAY_RESULT_ANIMATION: {
            return {
                ...state,
                playResultAnimation,
            };
        }

        case GameEventActionType.SHOW_RESULT_INFO_TIME_OUT: {
            const stateUpdate = {
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

        case GameEventActionType.SET_UM_FIRST_LOADING: {
            return {
                ...state,
                isUMInFirstLoad,
            };
        }

        case GameEventActionType.TOGGLE_BET_HISTORY: {
            return {
                ...state,
                isShowBetHistory,
            };
        }

        case GameEventActionType.TOGGLE_BET_DETAIL: {
            return {
                ...state,
                isShowBetDetail,
            };
        }

        case GameEventActionType.TOGGLE_GAME_GUIDE: {
            return {
                ...state,
                isShowGameGuide,
            };
        }

        case GameEventActionType.UPDATE_BET_DETAIL: {
            return {
                ...state,
                betDetailModalData,
            };
        }

        case GameEventActionType.START_NEW_ROUND_ANIM: {
            return {
                ...state,
                isPlayStartRoundAnimation,
            };
        }

        case GameEventActionType.ROUND_ID: {
            return {
                ...state,
                roundId,
            };
        }

        case GameEventActionType.ACTIVE_SCORE_BOARD_TAB: {
            return {
                ...state,
                isScoreboardTab,
            };
        }

        case GameEventActionType.PLAYER_RESULT_BOARD_UPDATE: {
            return {
                ...state,
                playerResultBoard,
            };
        }

        default: {
            console.warn(JSON.stringify(action));

            throw Error("Unknown action: " + action.type);
        }
    }
}
