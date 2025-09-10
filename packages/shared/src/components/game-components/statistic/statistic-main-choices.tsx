import { countSettlementResult, getPercentage } from ".";
import BeadBoardIcon from "./beadboard-icon";
import StatisticItem from "./statistic-item";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps } from "./types";

const StatisticMainChoices: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { roundHistory, mainChoices } = props;
    const counted = countSettlementResult(roundHistory);
    const mainChoicesStatistic = getPercentage(mainChoices, counted, roundHistory.length);

    return (
        <div className={Styles["other-wrapper"]}>
            {mainChoices.map((choice) => (
                <StatisticItem key={choice} value={`${mainChoicesStatistic[choice]}%`}>
                    <span className={`${Styles[choice]} ${Styles["statistic-choice-icon"]}  ${props.className}`}>
                        <BeadBoardIcon choice={choice} />
                    </span>
                </StatisticItem>
            ))}
        </div>
    );
};

export default StatisticMainChoices;
