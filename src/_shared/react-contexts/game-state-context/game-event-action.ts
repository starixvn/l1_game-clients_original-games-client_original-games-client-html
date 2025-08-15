import { DrawInfo, GameConfigs, GameDurations, PlayerResultBoard, RoundState } from "../../../components/game-base/type";

export enum GameEventActionType {
    CONNECT = "CONNECT",
    DISCONNECT = "DISCONNECT",
    SIGN_IN = "SIGN_IN",
    SIGN_OUT = "SIGN_OUT",
    UM = "UM",
    GAME_CONFIGS = "GAME_CONFIGS",
    ROUND_DATA = "ROUND_DATA",
    ROUND_HISTORY = "ROUND_HISTORY",
    FINISH = "FINISH",
    WIN_STATUS = "WIN_STATUS",
    DISCONNECT_ERROR = "DISCONNECT_ERROR",
    USER_STAKE_LEVEL = "USER_STAKE_LEVEL",
    ODDS = "ODDS",
    DRAW_ID = "DRAW_ID",
    ROUND_REMAINING_TIME = "ROUND_REMAINING_TIME",
    SET_NEW_GAME_STATE = "SET_NEW_GAME_STATE",
    SHOW_WINNING_ANIMATION = "SHOW_WINNING_ANIMATION",
    ACTIVE_SCORE_BOARD = "ACTIVE_SCORE_BOARD",
    PLAY_RESULT_ANIMATION = "PLAY_RESULT_ANIMATION",
    SHOW_RESULT_INFO_TIME_OUT = "SHOW_RESULT_INFO_TIME_OUT",
    SET_UM_FIRST_LOADING = "SET_UM_FIRST_LOADING",
    TOGGLE_BET_HISTORY = "TOGGLE_BET_HISTORY",
    TOGGLE_BET_DETAIL = "TOGGLE_BET_DETAIL",
    UPDATE_BET_DETAIL = "UPDATE_BET_DETAIL",
    TOGGLE_GAME_GUIDE = "TOGGLE_GAME_GUIDE",
    START_NEW_ROUND_ANIM = "START_NEW_ROUND_ANIM",
    ROUND_ID = "ROUND_ID",
    ACTIVE_SCORE_BOARD_TAB = "ACTIVE_SCORE_BOARD_TAB",
    PLAYER_RESULT_BOARD_UPDATE = "PLAYER_RESULT_BOARD_UPDATE",
}

export interface GameEventPayload {
    signedIn?: boolean;
    isConnect?: boolean;
    um?: boolean;
    um_message?: string[];
    gameConfigs?: GameConfigs;
    roundData?: any;
    roundHistory?: any;
    roundId?: number;
    result?: any;
    defaultResult?: any;
    settlementResult?: any;
    defaultSettlementResult?: any;
    durations?: GameDurations;
    status?: {
        win?: boolean;
        bet?: number;
    };
    rate?: number;
    errorCode?: string;
    userStakeLevel?: {
        minBet: number;
        maxBet: number;
    };
    odds?: any;
    drawId?: number;
    kickedOut?: any;
    disconnectReason?: string;
    showWinningAnimation?: boolean;
    selectedBetChoice?: string;
    activeScoreboardTab?: number;
    playResultAnimation?: boolean;
    newGameState?: any;
    showResultInfo?: boolean;
    isShowBlink?: boolean;
    prevRoundState?: RoundState;
    roundState?: RoundState;
    isUMInFirstLoad?: boolean;
    isShowBetHistory?: boolean;
    isShowGameGuide?: boolean;
    isShowBetDetail?: boolean;
    betDetailModalData?: {
        drawInfo: DrawInfo;
        betLogDetails: any[];
    };
    isPlayStartRoundAnimation?: boolean;
    isScoreboardTab?: boolean;
    playerResultBoard?: PlayerResultBoard;
}

export interface GameEventAction {
    type: GameEventActionType;
    payload?: GameEventPayload;
}
