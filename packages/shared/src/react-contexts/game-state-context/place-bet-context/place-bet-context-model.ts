import { SuggestBet } from "../../../../components/game-base/type";

export interface PlaceBetContextModel {
    ownBets: object;
    suggestBet: SuggestBet;
    notConfirmOwnBets: object;
    showConfirmBet: boolean;
    showConfirmDialog: boolean;
}

export const initialPlaceBetContext = () => {
    return {
        ownBets: {},
        notConfirmOwnBets: {},
        showConfirmBet: false,
        showConfirmDialog: false,
        suggestBet: {
            currentBetChoice: "",
            sendOutstandingBet: null,
            suggestBetAmount: 0,
            isInsufficientFunds: null,
        },
    };
};
