import { StateCreator } from "zustand";
import { GameConfigs, IUserStakeLevel, PlayerResultBoard, Round, RoundState } from "../../../components/game-base/type";
import { LanguageLocaleMapper } from "../../constants";
import { tolgee } from "../../tolgee";

export interface GameConfigSlice {
    isConnect: boolean;
    signedIn: boolean;
    prevRoundState: RoundState;
    roundState: RoundState;
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
        betLogDetails: any[];
    };
    isPlayStartRoundAnimation?: boolean;
    isScoreboardTab?: boolean;
    availableInGameData?: boolean;
    playerResultBoard?: PlayerResultBoard;
    setRate: ({ rate }: { rate: number }) => void;
    registerGameConfigEvent: (message: any) => void;
}

const GameEvents = {
    GAME_CONFIGS: "gameConfigs",
    PLAYER_RESULT_BOARD: "playerResultBoard",
};

export const createGameConfigSlice: StateCreator<GameConfigSlice> = (set) => ({
    isConnect: false,
    signedIn: false,
    prevRoundState: RoundState.None,
    roundState: RoundState.None,
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
    handleConnectGame: () => set({ isConnect: true, roundData: {} }),
    handleDisconnectGame: () => set({ isConnect: false, playResultAnimation: false }),
    handleSignInGame: () => set({ signedIn: true, availableInGameData: false }),
    handleSignOutGame: () => set({ signedIn: false, showResultInfo: false }),
    handleUMGame: ({ um_message }) =>
        set({
            roundState: RoundState.Disabled,
            disabledMessage: um_message[LanguageLocaleMapper[tolgee.getLanguage() || "en"]],
            showResultInfo: false,
        }),
    setGameConfigs: ({ gameConfigs }) => set({ gameConfigs, availableInGameData: true }),
    handleRoundState: ({ roundData }) => set((state) => ({ roundData: state.roundState === RoundState.SwitchRound ? {} : roundData })),
    handleRoundHistory: ({ roundHistory, roundId, result, settlementResult, isShowBlink }) =>
        set({ roundHistory, roundId, result, settlementResult, isShowBlink, playResultAnimation: false, showResultInfo: true }),
    handleFinish: ({ playResultAnimation, result, settlementResult, roundId, roundData }) =>
        set({ playResultAnimation, result, settlementResult, roundId, roundData, showResultInfo: false }),
    handleWinStatus: ({ status }) => set({ betWin: status.bet }),
    setRate: ({ rate }) => set({ rate }),
    handleDisconnectError: ({ disconnectReason }) => set({ roundState: RoundState.ConnectFailed, signedIn: false, disconnectReason }),
    handleUserStakeLevel: ({ userStakeLevel }) => set({ userStakeLevel }),
    handleOdds: ({ odds }) => set((state) => ({ gameConfigs: { ...state.gameConfigs, odds } })),
    handleSetNewGameState: ({ newGameState }) => set({ ...newGameState }),
    handleShowWinningAnimation: ({ showWinningAnimation }) => set({ showWinningAnimation }),
    handleActiveScoreboardTab: ({ activeScoreboardTab }) => set({ activeScoreboardTab }),
    handlePlayResultAnimation: ({ playResultAnimation }) => set({ playResultAnimation }),
    handleShowResultInfoTimeout: ({ playResultAnimation, showResultInfo, isShowBlink, roundHistory }) => {
        const stateUpdate = {
            showResultInfo,
            isShowBlink,
            roundHistory,
        };

        if (playResultAnimation) {
            stateUpdate["playResultAnimation"] = playResultAnimation;
        }
        return set({ ...stateUpdate });
    },
    handleStartNewRoundAnim: ({ isPlayStartRoundAnimation }) => set({ isPlayStartRoundAnimation }),
    handleRoundId: ({ roundId }) => set({ roundId }),
    registerGameConfigEvent: (message) => {
        Object.values(GameEvents).forEach((event) => {
            if (message[event] !== undefined) {
                set({ [event]: message[event] });
            }
        });
    },
});
