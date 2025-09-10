import { SuggestBet } from "../../../../components/game-base/type";

export enum PlaceBetEventActionType {
    OWN_BETS = "OWN_BETS",
    DISPLAY_POPUP = "DISPLAY_POPUP",
    SHOW_CONFIRM_BET = "SHOW_CONFIRM_BET",
    NOT_CONFIRM_OWN_BETS = "NOT_CONFIRM_OWN_BETS",
    SUGGEST_BET = "SUGGEST_BET",
    RESET_OWN_BETS_AND_SUGGEST_BET = "RESET_OWN_BETS_AND_SUGGEST_BET",
    SHOW_CONFIRM_DIALOG = "SHOW_CONFIRM_DIALOG",
    CLOSE_ALL_DIALOGS = "CLOSE_ALL_DIALOGS"
}

export interface PlaceBetEventPayload {
    ownBets?: any;
    endBetData?: {
        endBet?: number;
        betChoice?: any;
        notice?: string;
        kickedOut?: boolean;
        apiError?: boolean;
    };
    suggestBet?: SuggestBet;
    notConfirmOwnBets?: object;
    showConfirmBet?: boolean;
    showConfirmDialog?: boolean;
}

export interface PlaceBetEventAction {
    type: PlaceBetEventActionType;
    payload?: PlaceBetEventPayload;
}
