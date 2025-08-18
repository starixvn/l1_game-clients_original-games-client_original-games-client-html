import React, { useEffect } from "react";
import { confirmBet } from "../../../_shared/constants";
import { useGameActionContext, usePlayerContext } from "../../../_shared/react-contexts";
import { useClickSound, useSNTranslate } from "../../../_shared/react-hooks";
import Styles from "./confirm-bet.module.scss";
import { usePlaceBetContext, usePlaceBetDispatch } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";
import { PlaceBetEventActionType } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-action";

const ConfirmBet: React.FC = () => {
    const dispatch = usePlaceBetDispatch();
    const gameActionContext = useGameActionContext();
    const placeBetContext = usePlaceBetContext();
    const { authorizeInfo, enableQuickBet } = usePlayerContext();
    const enabledQuickBet = authorizeInfo?.user?.settings.quickBet || enableQuickBet;
    const clickSound = useClickSound();
    const { t } = useSNTranslate();

    useEffect(() => {
        return () => { };
    }, []);

    const onCancel = () => {
        clickSound();
        dispatch({
            type: PlaceBetEventActionType.SHOW_CONFIRM_BET,
            payload: { showConfirmBet: false }
        });

        dispatch({
            type: PlaceBetEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets: {} },
        });

        removeSuggestBet();
    };

    const removeSuggestBet = () => {
        dispatch({
            type: PlaceBetEventActionType.SUGGEST_BET,
            payload: {
                suggestBet: {
                    currentBetChoice: "",
                    sendOutstandingBet: null,
                },
            },
        });
    };

    const onConfirm = () => {
        if (enabledQuickBet) {
            placeBetContext.suggestBet.sendOutstandingBet();
            removeSuggestBet();

            return;
        }
        gameActionContext.placeBet(confirmBet, 0);
    };

    if (!placeBetContext.showConfirmBet) {
        return <></>;
    }

    return (
        <div className={Styles["confirm-bet-container"]}>
            <div className={Styles["back-ground"]}>
                <button
                    className={`btn-grey ${Styles["btn-cancel-bet"]}`}
                    onClick={() => onCancel()}
                    type="button"
                    data-testid="btn-cancel-bet"
                >
                    {t({ key: "button_cancel" })}
                </button>
                <button
                    className={`btn-green pulse ${Styles["btn-confirm-bet"]}`}
                    onClick={() => onConfirm()}
                    type="button"
                    data-testid="btn-confirm-bet"
                >
                    {t({ key: "button_confirm" })}
                </button>
            </div>
        </div>
    );
};

export default ConfirmBet;
