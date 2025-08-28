import ErrorCodeDictionary, { NoticeErrorCode } from "../constants/error-code-dictionary";
import { NoticeModel } from "../../components/game-base/type";
import { useNoticeStore } from "../stores/notice-store/notice-store";

export interface INotice {
    errorCode: string;
    hedgeBetGroup?: string[];
    minBet?: number;
    maxBet?: number;
    gameRoundId?: number;
    gameTypeId?: number;
    isPlaceBetFailed?: boolean;
}

export const GetLocalizedErrorMessage = (errorCode: string, isPlaceBet = false) => {
    const errorMessage = ErrorCodeDictionary[errorCode];
    if (errorMessage) {
        return errorMessage;
    }
    return isPlaceBet ? "Common.message_placebet_failed" : "Common.message_error_occurred";
};

// Helper function to broadcast notices using Zustand store
export const broadcastNotice = (notice: NoticeModel | null) => {
    if (notice) {
        useNoticeStore.getState().showNotice(notice);
    } else {
        useNoticeStore.getState().clearNotice();
    }
};

// Options interface for createNoticeFromErrorCode
export interface CreateNoticeOptions {
    gameName?: string;
    roundId?: number;
    minBet?: number;
    maxBet?: number;
    onClose?: () => void;
    duration?: number;
    isWarning?: boolean;
    hedgeBetGroup?: string[];
    adjustBetNoticePosition?: boolean;
}

// Helper function to create notice from error code
export const createNoticeFromErrorCode = (
    errorCode: string,
    options: CreateNoticeOptions = {}
): NoticeModel => {
    const {
        gameName,
        roundId,
        minBet,
        maxBet,
        onClose,
        duration = 3,
        isWarning = false,
        hedgeBetGroup,
        adjustBetNoticePosition = false
    } = options;

    const message = GetLocalizedErrorMessage(errorCode);

    return {
        gameName,
        roundId,
        message,
        duration,
        minBet,
        maxBet,
        errorCode,
        isWarning,
        onClose,
        hedgeBetGroup,
        adjustBetNoticePosition,
    };
};

export const createOptionForHedgeBetGroup = (hedgeBetGroup: string[], tolgeeNamespace) => {
    const option = {};
    hedgeBetGroup?.forEach((choice, index) => {
        option[`betChoice${index + 1}`] = getGlossaryTranslate(tolgeeNamespace, choice);
    });
    return option;
};

export const getGlossaryTranslate = (ns: string, key: string) => `${ns}.glossary_${key}`;

export const isKickOutError = (errorCode: string) => ["1001", "1002", "7000", "7001"].includes(String(errorCode));

export const getExtendMessageByErrorCode = (errorCode: string): string => {
    let extendMessage = "";
    if (isKickOutError(errorCode)) {
        extendMessage = ` (${errorCode})`;
    }
    return extendMessage;
};

export const getNotice = (errorCode: string, adjustBetNoticePosition = false, gameName?: string, betChoice1?: string, betChoice2?: string, args?: object): NoticeModel => {
    return {
        gameName,
        message: GetLocalizedErrorMessage(errorCode),
        duration: 2,
        errorCode: errorCode,
        betChoice1,
        betChoice2,
        adjustBetNoticePosition,
        ...args,
    };
};

