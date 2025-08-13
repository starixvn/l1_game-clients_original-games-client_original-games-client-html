import { memo, useEffect, useState } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";
import { usePlaceBetContext } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";
import { useGameBettingZoneContext, usePlayerContext } from "../../../_shared/react-contexts";

export const OwnBet: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const { enableQuickBet } = usePlayerContext();
    const { notConfirmOwnBets, ownBets } = usePlaceBetContext();
    const { acceptedBets } = useGameBettingZoneContext();
    const [isShowBetAnim, setIsShowBetAnim] = useState(false);
    const [ownBet, setOwnBet] = useState(0);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;
        if (ownBets?.[choice] > 0) {
            if (!isShowBetAnim) {
                setIsShowBetAnim(true);
                timeOut = setTimeout(() => {
                    setIsShowBetAnim(false);
                }, 500);
            } else {
                setIsShowBetAnim(false);
            }
        }
        setOwnBet(ownBets[choice] ?? 0);

        return () => {
            clearTimeout(timeOut);
        };
    }, [ownBets?.[choice]]);

    const ownBetUI = (value: string, animClass = "") => {
        return (
            <div className={`${Styles["own-bet"]} text-center ${className} ${animClass}`}>
                <span id={`${tolgeeNamespace}-${choice}-own-bet`}>{value}</span>
            </div>
        );
    };

    const ownBetValue = ownBet + (enableQuickBet ? 0 : notConfirmOwnBets?.[choice] ?? 0);
    return (
        <>
            {ownBetValue > 0 && ownBetUI(numberWithCommas(ownBetValue, 1))}
            {isShowBetAnim && acceptedBets > 0 && ownBetUI(numberWithCommas(acceptedBets, 1), Styles["own-bet-anim"])}
        </>
    );
};

export default memo(OwnBet);
