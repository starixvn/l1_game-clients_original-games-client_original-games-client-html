import { useEffect, useState } from "react";

import { formatOdds } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { useShallow } from "zustand/react/shallow";

type Props = {
    animationClass?: string;
    animationDuration?: number;
    isFormatOddsAuto?: boolean;
} & BaseProps;

export const Odds: React.FC<Props> = ({ tolgeeNamespace, choice, className, isFormatOddsAuto }) => {
    const [oddsValue, setOddsValue] = useState(0);
    const { gameConfigs, roundState } = useGameStore(
        useShallow((state) => ({ gameConfigs: state.gameConfigs, roundState: state.roundState }))
    );
    const { fractionalOddsFormat } = usePlayerContext();
    const odds = isFormatOddsAuto ? formatOdds(oddsValue, fractionalOddsFormat, 1) : formatOdds(oddsValue, fractionalOddsFormat);
    useEffect(() => {
        const currentOdds = gameConfigs?.odds?.[choice] ?? 0;
        setOddsValue(currentOdds);
    }, [gameConfigs?.odds?.[choice], roundState]);

    if (oddsValue <= 0) {
        return <div className={className}></div>;
    }

    return (
        <div id={`${tolgeeNamespace}-${choice}-odds`} className={`text-center ${Styles["bet-odds"]} ${className}`}>
            {odds}
        </div>
    );
};

export default Odds;
