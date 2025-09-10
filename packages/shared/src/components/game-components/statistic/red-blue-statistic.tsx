import { countSettlementResult, getPercentage } from ".";
import BeadBoardIcon from "./beadboard-icon";
import StatisticItem from "./statistic-item";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps } from "./types";

// Import the constant from the main statistic file
const BAR_STATISTIC_ID = "bar-statistic";

export const RedAndBlueStatistic: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { roundHistory, subChoicesClass, mainChoices, subChoices } = props;
    const counted = countSettlementResult(roundHistory);
    const mainChoicesStatistic = getPercentage(mainChoices, counted, roundHistory.length);
    const subChoicesStatistic = getPercentage(subChoices, counted, roundHistory.length);

    return (
        <div className={`flex ${Styles["statistic-container"]} ${Styles["other"]}`} id={BAR_STATISTIC_ID}>
            <div className={Styles["other-wrapper"]}>
                {mainChoices.map((choice) => (
                    <StatisticItem key={choice} value={`${mainChoicesStatistic[choice]}%`}>
                        <BeadBoardIcon choice={choice} />
                    </StatisticItem>
                ))}
            </div>

            <div className={Styles["other-wrapper"]}>
                {subChoices.map((choice) => (
                    <StatisticItem key={choice} value={`${subChoicesStatistic[choice]}%`}>
                        <span className={subChoicesClass[choice]}></span>
                    </StatisticItem>
                ))}
            </div>
        </div>
    );
};
export default RedAndBlueStatistic;
