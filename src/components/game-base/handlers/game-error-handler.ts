
import { isKickOutError, broadcastNotice, createNoticeFromErrorCode } from "../../../_shared/helpers";
import { GameMessageHandler, messageEventType } from "./game-message-handler";

export type GameErrorHandlerProps = {
    dispatch: Function;
    gameMessageHandler: GameMessageHandler;
    gamName: string;
};

export interface ApiError {
    errorCode: string;
    hedgeBetGroup?: string[];
    minBet?: number;
    maxBet?: number;
    gameRoundId?: number;
    gameTypeId?: number;
    isPlaceBetFailed?: boolean;
}

export class GameErrorHandler {
    constructor(private readonly props: GameErrorHandlerProps) { }

    registerEvents = (signOut: Function) => {
        this.props.gameMessageHandler.register(messageEventType.API_ERROR, ({ apiError }) => {
            this.handleApiError(apiError, signOut);
        });
    };

    handleApiError = (apiError: ApiError, signOut: Function) => {
        const errorCode = apiError.errorCode;
        const isKickOut = isKickOutError(errorCode);
        const onClose = isKickOut ? signOut : null;
        const duration = isKickOut ? 10 : 3;

        const notice = createNoticeFromErrorCode(errorCode, {
            gameName: this.props.gamName,
            roundId: apiError?.gameRoundId,
            minBet: apiError?.minBet,
            maxBet: apiError?.maxBet,
            onClose: onClose as (() => void) | undefined,
            duration,
            isWarning: false
        });

        broadcastNotice(notice);
    };
}
