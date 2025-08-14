import useGameStore from "../../../_shared/stores/game-store/game-store";
import { RoundState } from "../../game-base/type";
import PercentageCircle from "../percentage-circle";
import { BaseProps } from "./types";

export const BetPercentage: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className, percentageColor }) => {
    const betPercentage = useGameStore((state) => state.betPercentage);
    const roundState = useGameStore((state) => state.roundState);

    if ([RoundState.SwitchRound, RoundState.BeforePlaceBet].includes(roundState)) {
        return <></>;
    }

    return (
        <div id={`${tolgeeNamespace}-${choice}-percent`} className={className}>
            <PercentageCircle percentage={betPercentage?.[choice]} color={percentageColor} />
        </div>
    );
};

export default BetPercentage;
