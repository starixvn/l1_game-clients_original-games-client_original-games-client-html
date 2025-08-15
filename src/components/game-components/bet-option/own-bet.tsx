import { memo } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";
import useGameStore from "../../../_shared/stores/game-store/game-store";

export const OwnBet: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const ownBet = useGameStore((state) => state.ownBets?.[choice] ?? 0);

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
