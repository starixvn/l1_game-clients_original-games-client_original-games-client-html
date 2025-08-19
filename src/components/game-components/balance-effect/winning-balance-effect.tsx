import { FC, useMemo } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./style.module.scss";

const WinningBalanceEffect: FC = () => {
    const { betWin, showResultInfo } = useGameStateContext();

    return useMemo(() => {
        if (betWin <= 0 || !showResultInfo) {
            return <></>;
        }

        return <div className={Styles["winning-effect"]}>{`+${numberWithCommas(betWin, 2)}`}</div>;
    }, [betWin, showResultInfo]);
};

export default WinningBalanceEffect;
