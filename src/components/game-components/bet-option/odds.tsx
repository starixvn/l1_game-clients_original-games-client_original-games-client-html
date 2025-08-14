import { useEffect, useMemo, useState } from "react";

import { formatOdds } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { RoundState } from "../../game-base/type";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";
import useGameStore from "../../../_shared/stores/game-store/game-store";

type Props = {
    animationClass?: string;
    animationDuration?: number;
    isFormatOddsAuto?: boolean;
} & BaseProps;

export const Odds: React.FC<Props> = ({ tolgeeNamespace, choice, className, animationDuration, isFormatOddsAuto }) => {
    const [showOddsIcon, setShowOddsIcon] = useState("");
    const [classOddsIcon, setClassOddsIcon] = useState("");
    const [oddsValue, setOddsValue] = useState(0);
    const gameConfigs = useGameStore((state) => state.gameConfigs);
    const roundState = useGameStore((state) => state.roundState);
    const { fractionalOddsFormat } = usePlayerContext();
    const odds = isFormatOddsAuto ? formatOdds(oddsValue, fractionalOddsFormat, 1) : formatOdds(oddsValue, fractionalOddsFormat);

    useEffect(() => {
        const currentOdds = gameConfigs?.odds?.[choice] ?? 0;
        oddsValue === 0 && setOddsValue(currentOdds);
        if (roundState === RoundState.InRound) {
            oddsValue > 0 && oddsValue !== +currentOdds && showIcon();
            setClassOddsIcon(currentOdds > oddsValue ? "up" : "down");
            setOddsValue(currentOdds);
        }
    }, [gameConfigs?.odds?.[choice], roundState]);

    const showIcon = () => {
        setShowOddsIcon(Styles["show-odds-icon"]);
        setTimeout(() => {
            setShowOddsIcon("");
        }, animationDuration * 1000);
    };

    return useMemo(() => {
        if (oddsValue <= 0) {
            return <div className={className}></div>;
        }

        return (
            <div
                id={`${tolgeeNamespace}-${choice}-odds`}
                className={`text-center ${Styles["bet-odds"]} ${className} ${Styles[classOddsIcon]} ${showOddsIcon}`}
            >
                {odds}
            </div>
        );
    }, [odds, showOddsIcon]);
};

export default Odds;
