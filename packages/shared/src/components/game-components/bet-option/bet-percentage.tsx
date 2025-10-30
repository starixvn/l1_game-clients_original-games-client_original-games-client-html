import { useShallow } from "zustand/react/shallow";
import useGameStore from '@shared/stores/game-store/game-store';
import { RoundState } from "../../game-base/type";
import PercentageCircle from "../percentage-circle";
import { BaseProps } from "./types";

export const BetPercentage: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className, percentageColor }) => {
    const { betPercentage, roundState } = useGameStore(
        useShallow((state) => ({ betPercentage: state.betPercentage?.[choice] ?? 0, roundState: state.roundState }))
    );

    if ([RoundState.SwitchRound, RoundState.BeforePlaceBet].includes(roundState)) {
        return <></>;
    }

    return (
        <div id={`${tolgeeNamespace}-${choice}-percent`} className={className}>
            <PercentageCircle percentage={betPercentage} color={percentageColor} />
        </div>
    );
};

export default BetPercentage;
