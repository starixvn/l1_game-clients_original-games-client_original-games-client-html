import { DrawInfo, GameConfigs, IUserStakeLevel, Round, RoundState } from '@shared/components/game-base/type';

export interface GameStateContextModel {
    isConnect: boolean;
    signedIn: boolean;
    prevRoundState: RoundState;
    roundState: RoundState;
    gameConfigs: GameConfigs;
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
    // drawId removed; use roundId everywhere
    userStakeLevel: IUserStakeLevel;
    isShowBetHistory: boolean;
    isShowBetDetail: boolean;
    isShowGameGuide: boolean;
    betDetailModalData?: {
        drawInfo: DrawInfo;
        betLogDetails: any[];
    };
    isPlayStartRoundAnimation?: boolean;
    isScoreboardTab?: boolean;
    availableInGameData?: boolean;
}

export const initialGameStateContextModel = () => {
    return {
        isConnect: false,
        signedIn: false,
        prevRoundState: RoundState.None,
        roundState: RoundState.None,
        gameConfigs: {
            odds: {},
            minBet: 0,
            maxBet: 0,
            maxBetPerChoices: {},
            enableFreeBet: false,
            margin: null,
            chips: [],
        },
        roundData: {},
        roundHistory: [],
        roundId: 0,
        result: {},
        settlementResult: {},
        errorMessage: undefined,
        selectedBetChoice: undefined,
        disabledMessage: undefined,
        showResultInfo: false,
        showWinningAnimation: false,
        playResultAnimation: false,
        isShowBlink: false,
        activeScoreboardTab: 0,
        rate: 0,
        disconnectReason: "",
        isUMInFirstLoad: false,
        betWin: 0,
        kickedOut: null,
        userStakeLevel: {
            minBet: 1,
            maxBet: 200_000,
        },
        isShowBetHistory: false,
        isShowBetDetail: false,
        isShowGameGuide: false,
        betDetailModalData: undefined,
        isPlayStartRoundAnimation: false,
        isScoreboardTab: true,
        availableInGameData: false,
    };
};
