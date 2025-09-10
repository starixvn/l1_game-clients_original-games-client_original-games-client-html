import { StateCreator } from "zustand";
import { GameConfigs, GameDurations, IUserStakeLevel, PlayerResultBoard, Round, RoundState } from '@shared/merged/components/game-base/type';
import { LanguageLocaleMapper } from "../../constants";
import { tolgee } from "../../tolgee";

export interface GameStateSlice {
    gameConfigs: GameConfigs | null;
    roundHistory: Round<object, object>[];
    roundId: number;
    result?: any;
    settlementResult?: any;
    disabledMessage?: string;
    showResultInfo: boolean;
    playResultAnimation: boolean;
    isShowBlink: boolean;
    rate?: number;
    userStakeLevel?: IUserStakeLevel;
    playerResultBoard?: PlayerResultBoard;
    prevRoundState: RoundState;
    roundState: RoundState;
    nextRoundState: RoundState;
    durations?: GameDurations;
    defaultResult: any;
    defaultSettlementResult: any;
    remainingTime: number;
    setRoundHistory: ({ roundHistory, roundId, result, settlementResult, isShowBlink }: any) => void;
    showResultInfoTimeOut: ({ roundHistory, isShowBlink, showResultInfo, playResultAnimation }: any) => void;
    setRate: ({ rate }: { rate: number }) => void;
    registerGameConfigEvent: (message: any) => void;
    setGameState: (message: any) => void;
    setRoundState: (roundState: RoundState) => void;
    setShowResultInfo: (showResultInfo: boolean) => void;
    setUMMessage: (message: string) => void;
}

const GameEvents = {
    GAME_CONFIGS: "gameConfigs",
    PLAYER_RESULT_BOARD: "playerResultBoard",
    USER_STAKE_LEVEL: "userStakeLevel",
};

export const createGameStateSlice: StateCreator<GameStateSlice> = (set) => ({
    gameConfigs: null,
    roundHistory: [],
    roundId: 0,
    result: undefined,
    settlementResult: undefined,
    disabledMessage: undefined,
    showResultInfo: false,
    playResultAnimation: false,
    isShowBlink: false,
    rate: undefined,
    userStakeLevel: undefined,
    prevRoundState: RoundState.None,
    roundState: RoundState.None,
    nextRoundState: RoundState.None,
    durations: undefined,
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
    registerGameConfigEvent: (message) => {
        Object.values(GameEvents).forEach((event) => {
            if (message[event] !== undefined) {
                set({ [event]: message[event] });
            }
        });
    },
});
