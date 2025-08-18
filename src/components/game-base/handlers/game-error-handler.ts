import { GetLocalizedErrorMessage, isKickOutError, broadcastNotice, createNoticeFromErrorCode } from "../../../_shared/helpers";
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
        const isPlaceBet = apiError.isPlaceBetFailed ? apiError.isPlaceBetFailed : false;
        const errorCode = apiError.errorCode;
        const isKickOut = isKickOutError(errorCode);
        const onClose = isKickOut ? signOut : null;
        const duration = isKickOut ? 10 : 3;

        const notice = createNoticeFromErrorCode(
            errorCode,
            this.props.gamName,
            apiError?.gameRoundId,
            apiError?.minBet,
            apiError?.maxBet,
            onClose as (() => void) | undefined,
            duration,
            false
        );

        broadcastNotice(notice);
    };
}
