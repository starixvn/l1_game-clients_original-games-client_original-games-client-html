import MessageTransmitter from "@shared/helpers/message-transmitter";
import { MessageTransmitterType } from "@shared/helpers/message-transmitter/type";
import { GameEventActionType } from "@shared/react-contexts/game-state-context/game-event-action";

export const messageEventType = {
    GAME_CONFIG: "gameConfigs",
    ROUND_HISTORY: "roundHistory",
    REMAINING_TIME: "remainingTime",
    CLIENT_REMAINING_TIME: "clientRemainingTime",
    FINISH: "finish",
    STATUS: "status",
    USER: "user",
    OWN_BETS: "ownBets",
    END_BET: "endBet",
    API_ERROR: "apiError",
    ERROR_CODE: "errorCode",
    USER_STAKE_LEVEL: "userStakeLevel",
    TOTAL_BETS: "totalBets",
    ODDS: "odds",
    UNDER_MAINTENANCE: "um",
    ROUND_STATE: "roundState",
    SOCKET_CONNECT_ERROR: "connect_error",
    SOCKET_CONNECTED: "connect",
    SOCKET_DISCONNECTED: "disconnect",
    ROUND_DATA: "roundData",
    SIGNED_IN: "signedIn",
    NOT_PERMITTED_TO_PLAY: "notPermittedToPlay",
    BET_PERCENTAGE: "betPercentage",
    PLAYER_BET_COUNT: "playerBetCount",
    GAME_DESTROY: "gameDestroy",
    SEND_SOCKET_MESSAGE: "sendSocketMessage",
    TOGGLE_BETHISTORY: "toggleBetHistory",
    BET_HISTORY: "history",
    UPDATE_PLAYER_BALANCE: "updatePlayerBalance",
    CLEAR_GAME_TIMEOUT_AND_INTERVAL: "clearGameTimeoutAndInterval",
    SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED: "sendSocketMessageWithClientSeed",
    ROUND_ID: "roundId",
    CLIENT_SEED_DETAIL: "clientSeedDetail",
    SAVE_PF_SETTING: "savePFSetting",
    SAVE_PF_SETTING_FROM_ROUND_ID_HANLDER: "savePFSettingFromRoundIdHandler",
    SYNC_OWN_BETS_TO_PF: "syncOwnBetsToPF",
    START_PLACE_BET: "spb",
    PLAYER_RESULT_BOARD: "playerResultBoard",
    PF: "pf",
    END_PLACE_BET: "epb",
    PLAYER_BET: "playerBet",
    LIGHTNING_CONFIG: "lightningConfig",
};

export class GameMessageHandler {
    constructor(private readonly dispatch: Function, private readonly messageTransmitter?: MessageTransmitterType) {
        this.messageTransmitter = messageTransmitter ?? MessageTransmitter();
    }

    registerSocketEvents = () => {
        this.register(messageEventType.GAME_CONFIG, this.handleGameConfigs);
        this.register(messageEventType.ODDS, this.handleOdds);
        this.register(messageEventType.ROUND_DATA, this.handleRoundData);
        this.register(messageEventType.SIGNED_IN, this.handleSignedIn);
        this.register(messageEventType.CLIENT_SEED_DETAIL, this.handleClientSeedDetail);
    };

    getMessageTransmitter() {
        return this.messageTransmitter;
    }

    register = (eventType: string, handler: Function) => {
        return this.messageTransmitter.register(eventType, handler);
    };

    removeHandler = (handlerId: string) => {
        return this.messageTransmitter.unsubscribe(handlerId);
    };

    broadcastGameMessage = (message) => {
        // Also broadcast through the message transmitter to trigger registered handlers
        if (message[messageEventType.USER_STAKE_LEVEL]) {
            this.messageTransmitter.broadcast({ ...message, hasNotice: false });
        } else {
            this.messageTransmitter.broadcast(message);
        }
    };

    broadcastGameEvent = (message) => {
        this.messageTransmitter.broadcast(message);
    };

    handleGameConfigs = ({ gameConfigs }) => {
        this.dispatch({
            type: GameEventActionType.GAME_CONFIGS,
            payload: {
                gameConfigs,
            },
        });
    };

    handleOdds = ({ odds }) => {
        this.dispatch({
            type: GameEventActionType.ODDS,
            payload: {
                odds,
            },
        });
    };

    handleSignedIn = () => {
        this.dispatch({
            type: GameEventActionType.SIGN_IN,
            payload: {},
        });
    };

    handleRoundData = ({ roundData }) => {
        this.dispatch({
            type: GameEventActionType.ROUND_DATA,
            payload: {
                roundData,
            },
        });
    };

    handleClientSeedDetail = ({ clientSeedDetail }) => {
        this.broadcastGameEvent({
            [messageEventType.SAVE_PF_SETTING]: {
                pfClientSeedSetting: {
                    ...clientSeedDetail,
                },
            },
        });
    };

    clearAllHandlers = () => {
        this.messageTransmitter.clearAllListener();
    };
}
