import { TFnType, TranslationKey } from "@tolgee/react";
import { WithRouterProps } from "next/dist/client/with-router";
import { GameEventAction } from '@shared/react-contexts/game-state-context/game-event-action';
import { GameStateContextModel } from '@shared/react-contexts/game-state-context/game-state-context-model';
import { IRoundStateHandler } from "../round-base/round-state-handler";
import { IGameSoundHandler } from "../round-base/round-game-sound-handler";
import {
    GameDisableHandler,
    GameErrorHandler,
    GameFinishHandler,
    GameRoundHistoryHandler,
    PlaceBetHandler,
    PlayerHandler,
} from "./handlers";
import { GameMessageHandler } from "./handlers/game-message-handler";
import { GameRoundDataHandler } from "./handlers/game-round-data-handler";
import { IGameStateHandler } from "./handlers/game-state-handler";

export interface GameConfigs {
    odds: { [key: string]: number };
    minBet: number;
    maxBet: number;
    maxBetPerChoices: any;
    enableFreeBet: boolean;
    margin: any;
    chips: string[];
}

export enum RoundState {
    None,
    Disabled,
    InRound,
    LockingBet,
    DisplayResult,
    BeforePlaceBet,
    ConnectFailed,
    SwitchRound,
}

export interface GameSettings {
    id: number;
    tolgeeNamespace?: string;
    gameName: string;
    socketInfo?: SocketInfo;
    durations?: GameDurations;
    numberOfRoundHistory?: number;
    gamePath?: string;
    isComingSoon?: boolean;
    gameResourceConfigs: {
        path: string;
        optionalPaths?: string[];
        cachePaths?: string[];
    };
}

export type GamePropsContext = {
    id?: number;
    tolgeeNamespace?: string;
    gameName?: string;
    socketInfo?: SocketInfo;
    durations?: GameDurations;
    notifyWinStreak?: Function;
    setApiErrorMessage?: Function;
    userStakeLevel?: UserStakeLevel;
    updateUserStakeLevel?: Function;
    isJoinedGame?: boolean;
    dispatch?: (action: GameEventAction) => {};
    gameStateContextModel?: GameStateContextModel;
    translate?: TFnType<string, TranslationKey>;
    hedgeBetGroups?: [string[]];
    gameMessageHandler?: GameMessageHandler;
    gameSound?: GameSound;
};

export type GameSound = {
    playPlaceBetSound: Function;
    startPlaceBetSound: Function;
    startRoundSound: Function;
    blockBetSound: Function;
};

export type GameBaseProps = GamePropsContext & WithRouterProps;

export type GameBaseState = {
    isLoaded: boolean;
};

export interface NoticeModel {
    gameName?: string;
    roundId?: number;
    message: string;
    duration?: number;
    minBet?: number;
    maxBet?: number;
    errorCode?: string;
    position?: any;
    isWarning?: boolean;
    betChoice1?: string;
    betChoice2?: string;
    onClose?: () => void;
    hedgeBetGroup?: string[];
    adjustBetNoticePosition?: boolean;
}

export interface APIError extends NoticeModel {
    gameName?: string;
    roundId?: number;
}

export interface SocketInfo {
    namespace: string;
    path: string;
    serviceName?: string;
}

export interface GameDurations {
    wholeRound: number;
    placingBets: number;
    lockingBet: number;
    showResult: number;
    resultAnimation: number;
    beforePlaceBet: number;
    switchRoundAnimation?: number;
    startNewRoundAnim?: number;
}

export interface RebetStorageModel {
    [gameId: string]: RebetStorageDetail;
}

export interface RebetStorageDetail {
    roundId: number;
    betInfo: object;
}

export interface UserStakeLevel {
    minBet: number;
    maxBet: number;
}

export type GameGuide = {
    gameConfigs: GameConfigs;
    userStakeLevel: UserStakeLevel;
    gameName: string;
    gameId?: number;
};

export interface BetLogsBase<Result, SettlementResult, Odd> {
    betLogDetails?: [];
    betwin?: number;
    freeBet?: boolean;
    name?: string;
    phien?: number;
    result?: Result;
    settlementResult?: SettlementResult;
    time?: string;
    odds?: Odd;
}

export interface WinStreakCollectorModel {
    [key: string]: {
        streak: number;
        isStopStreak: boolean;
    };
}

export interface Round<R, S> {
    roundId: number;
    result: R;
    settlementResult: S;
    pf?: object;
}

export enum BallColor {
    BLUE = "blue",
    RED = "red",
}

export type SuggestBet = {
    currentBetChoice?: string;
    suggestBetAmount?: number;
    sendOutstandingBet?: Function;
    isInsufficientFunds?: boolean;
};

export type ClientSeed = {
    name: string;
    clientSeed: string;
};

export type ClientSeedInfo = {
    roundId: number;
    clientSeed: string;
    clientSeeds: ClientSeed[];
    mergeClientSeed: string;
};

export interface PFClientSeedSetting {
    roundId: number;
    randomClientSeed: string;
    manualClientSeed: string;
    useManualClientSeed: boolean;
}

export interface PFSeverSeed {
    roundId: number;
    serverSeedHash: string;
}

export interface PFResult {
    roundId: number;
    serverSeedHash: string;
    serverSeed: string;
    clientSeeds: ClientSeed[];
    mergeSeed: string;
    mergeClientSeed: string;
    roundResult: any[];
    finalHash: string;
    clientSeed: string;
    editedMergeClientSeed: string;
}

export interface DrawInfo {
    roundId: number;
    result: any;
    settlementResult: any;
    odds: any;
    pfResult: PFResult;
    clientSeed: string;
}

export interface IUserStakeLevel {
    minBet: number;
    maxBet: number;
}

export type GameBaseHandlers = {
    roundStateHandler: IRoundStateHandler;
    gameMessageHandler: GameMessageHandler;
    gameRoundDataHandler: GameRoundDataHandler;
    gameStateHandler?: IGameStateHandler;
    gameErrorHandler?: GameErrorHandler;
    playerHandler?: PlayerHandler;
    placeBetHandler?: PlaceBetHandler;
    gameFinishHandler?: GameFinishHandler;
    gameDisabledHandler?: GameDisableHandler;
    gameRoundHistoryHandler?: GameRoundHistoryHandler;
    gameSoundHandler?: IGameSoundHandler;
};

export interface PlayerInPlayerResultBoard {
    uid: string;
    name: string;
    betAmount: number;
    winAmount: number | null;
    multiplier: number | null;
}

export interface PlayerResultBoard {
    roundId: number;
    totalPlayers: number;
    isSettled: boolean;
    players: PlayerInPlayerResultBoard[];
}
