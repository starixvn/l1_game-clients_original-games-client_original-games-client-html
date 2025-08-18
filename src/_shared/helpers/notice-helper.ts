import ErrorCodeDictionary, { CommonErrorCodeList } from "../constants/error-code-dictionary";
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

// Helper function to create notice from error code
export const createNoticeFromErrorCode = (
    errorCode: string,
    gameName?: string,
    roundId?: number,
    minBet?: number,
    maxBet?: number,
    onClose?: () => void,
    duration: number = 3,
    isWarning: boolean = false,
    hedgeBetGroup?: string[],
    adjustBetNoticePosition: boolean = false
): NoticeModel => {
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
