import { memo, useEffect, useState } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";
import useGameStore from "../../../_shared/stores/game-store/game-store";

export const OwnBet: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const ownBets = useGameStore((state) => state.ownBets);
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

    return <>{ownBet > 0 && ownBetUI(numberWithCommas(ownBet, 1))}</>;
};

export default memo(OwnBet);
