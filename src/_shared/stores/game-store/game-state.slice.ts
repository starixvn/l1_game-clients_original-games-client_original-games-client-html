import { StateCreator } from "zustand";
import { GameConfigs, GameDurations, IUserStakeLevel, PlayerResultBoard, Round, RoundState } from "../../../components/game-base/type";
import { LanguageLocaleMapper } from "../../constants";
import { tolgee } from "../../tolgee";

export interface GameConfigSlice {
    isConnect: boolean;
    signedIn: boolean;
    gameConfigs: GameConfigs | null;
    roundData: any;
    roundHistory: Round<object, object>[];
    roundId: number;
    result?: any;
    settlementResult?: any;
    errorMessage?: string | string[];
    selectedBetChoice?: string;
    disabledMessage?: string;
    showResultInfo: boolean;
    showWinningAnimation: boolean;
    playResultAnimation: boolean;
    isShowBlink: boolean;
    activeScoreboardTab?: number;
    rate?: number;
    disconnectReason?: string;
    isUMInFirstLoad: boolean;
    betWin: number;
    kickedOut: any;
    userStakeLevel: IUserStakeLevel;
    isShowBetHistory: boolean;
    isShowBetDetail: boolean;
    isShowGameGuide: boolean;
    betDetailModalData?: {
        drawInfo: any;
        betLogDetails: any[];
    };
    isPlayStartRoundAnimation?: boolean;
    isScoreboardTab?: boolean;
    availableInGameData?: boolean;
    playerResultBoard?: PlayerResultBoard;
    prevRoundState: RoundState;
    roundState: RoundState;
    nextRoundState: RoundState;
    durations: GameDurations;
    defaultResult: any;
    defaultSettlementResult: any;
    remainingTime: number;
    setRoundHistory: ({ roundHistory, roundId, result, settlementResult, isShowBlink }: any) => void;
    showResultInfoTimeOut: ({ roundHistory, isShowBlink, showResultInfo, playResultAnimation }: any) => void;
    setRate: ({ rate }: { rate: number }) => void;
    setDisconnect: (reason: string) => void;
    registerGameConfigEvent: (message: any) => void;
    setGameState: (message: any) => void;
    setRoundState: (roundState: RoundState) => void;
    setShowResultInfo: (showResultInfo: boolean) => void;
    setUMMessage: (message: string) => void;
    setIsUMInFirstLoad: (isUMInFirstLoad: boolean) => void;
    toggleBetDetail: (isShow: boolean) => void;
    updateBetDetail: (betDetailData: any) => void;
}

const GameEvents = {
    GAME_CONFIGS: "gameConfigs",
    PLAYER_RESULT_BOARD: "playerResultBoard",
    USER_STAKE_LEVEL: "userStakeLevel",
};

export const createGameConfigSlice: StateCreator<GameConfigSlice> = (set) => ({
    isConnect: false,
    signedIn: false,
    gameConfigs: null,
    roundData: {},
    roundHistory: [],
    roundId: 0,
    result: undefined,
    settlementResult: undefined,
    errorMessage: undefined,
    selectedBetChoice: undefined,
    disabledMessage: undefined,
    showResultInfo: false,
    showWinningAnimation: false,
    playResultAnimation: false,
    isShowBlink: false,
    activeScoreboardTab: undefined,
    rate: undefined,
    disconnectReason: undefined,
    isUMInFirstLoad: false,
    betWin: 0,
    kickedOut: undefined,
    userStakeLevel: undefined,
    isShowBetHistory: false,
    isShowBetDetail: false,
    isShowGameGuide: false,
    betDetailModalData: undefined,
    isPlayStartRoundAnimation: false,
    isScoreboardTab: false,
    availableInGameData: false,
    prevRoundState: RoundState.None,
    roundState: RoundState.None,
    nextRoundState: RoundState.None,
    durations: null,
    defaultResult: null,
    defaultSettlementResult: null,
    remainingTime: 0,
    setRoundHistory: ({ roundHistory, roundId, result, settlementResult, isShowBlink }) =>
        set({ roundHistory, roundId, result, settlementResult, isShowBlink, playResultAnimation: false, showResultInfo: true }),
    showResultInfoTimeOut: ({ roundHistory, isShowBlink, showResultInfo, playResultAnimation }) => {
        const stateUpdate = {
            showResultInfo,
            isShowBlink,
            roundHistory,
        };
        if (playResultAnimation) {
            stateUpdate["playResultAnimation"] = playResultAnimation;
        }
        set({ ...stateUpdate });
    },
    setRate: ({ rate }) => set({ rate }),
    setDisconnect: (reason: string) => set({ disconnectReason: reason, signedIn: false }),
    setGameState: (newGameState) => {
        set({
            ...newGameState,
        });
    },
    setRoundState: (roundState) => set({ roundState }),
    setShowResultInfo: (showResultInfo) => set({ showResultInfo }),
    setUMMessage: (message) =>
        set({
            disabledMessage: message[LanguageLocaleMapper[tolgee.getLanguage() || "en"]], // TO DO: remove hard code
        }),
    setIsUMInFirstLoad: (isUMInFirstLoad) => set({ isUMInFirstLoad }),
    registerGameConfigEvent: (message) => {
        Object.values(GameEvents).forEach((event) => {
            if (message[event] !== undefined) {
                set({ [event]: message[event] });
            }
        });
    },
    toggleBetDetail: (isShow) => set({ isShowBetDetail: isShow }),
    updateBetDetail: (betDetailData) => set({ betDetailModalData: betDetailData }),
});
