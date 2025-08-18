
import { numberRoundDownWithCommas } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { PlaceBetEventActionType } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-action";
import { usePlaceBetContext, usePlaceBetDispatch } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";
import { useTranslator } from "../../../_shared/react-hooks";
import ConfirmDialog from "../confirm-dialog";

const BetConfirmDialog = () => {
    const dispatch = usePlaceBetDispatch();
    const placeBetContext = usePlaceBetContext();
    const { authorizeInfo, enableQuickBet } = usePlayerContext();
    const enabledQuickBet = authorizeInfo?.user?.settings.quickBet || enableQuickBet;
    const suggestBet = placeBetContext.suggestBet;
    const currentBetChoice = suggestBet.currentBetChoice;
    const outstandingBalance = suggestBet.suggestBetAmount;
    const isInsufficientFunds = suggestBet.isInsufficientFunds;

    const { t } = useTranslator();

    if (!placeBetContext.showConfirmDialog) {
        return <></>;
    }

    const removeSuggestBet = () => {
        dispatch({
            type: PlaceBetEventActionType.SUGGEST_BET,
            payload: {
                suggestBet: {
                    currentBetChoice: "",
                    suggestBetAmount: null,
                    sendOutstandingBet: null,
                    isInsufficientFunds: false,
                },
            },
        });
    };

    const handleCloseModal = () => {
        dispatch({
            type: PlaceBetEventActionType.SHOW_CONFIRM_DIALOG,
            payload: { showConfirmDialog: false }
        });

        enabledQuickBet && removeSuggestBet();
    };

    const handleSubmitBet = () => {
        dispatch({
            type: PlaceBetEventActionType.SHOW_CONFIRM_DIALOG,
            payload: { showConfirmDialog: false }
        });

        if (enabledQuickBet) {
            placeBetContext.suggestBet.sendOutstandingBet();
            removeSuggestBet();

            return;
        }

        dispatch({
            type: PlaceBetEventActionType.SHOW_CONFIRM_BET,
            payload: { showConfirmBet: true }
        });

        const notConfirmOwnBets = placeBetContext.notConfirmOwnBets;
        notConfirmOwnBets[currentBetChoice] = (notConfirmOwnBets[currentBetChoice] ?? 0) + outstandingBalance;

        dispatch({
            type: PlaceBetEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets }
        });
    };

    const getContent = () => {
        const formatValue = () => {
            return `<strong class="amount-color">${numberRoundDownWithCommas(outstandingBalance)}</strong>`;
        };

        return t("message_bet_available", { amount: formatValue() });
    };

    const getTitle = () => {
        return isInsufficientFunds ? t("message_insufficient_fund") : t("message_reach_maxbet");
    };

    return (
        <ConfirmDialog
            title={getTitle()}
            content={getContent()}
            subContent={t("message_confirm_bet")}
            onCloseModal={handleCloseModal}
            onSubmit={handleSubmitBet}
        />
    );
};

export default BetConfirmDialog;
