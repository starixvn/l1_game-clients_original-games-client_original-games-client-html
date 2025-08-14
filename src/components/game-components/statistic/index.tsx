import React, { memo } from "react";
import { useClickSound } from "../../../_shared/react-hooks";
import { Round } from "../../game-base/type";
import BeadBoardIcon from "./beadboard-icon";
import StatisticItem from "./statistic-item";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps } from "./types";

export const countSettlementResult = (roundHistory: Round<any, any>[]) => {
    return roundHistory.reduce((result, { settlementResult }) => {
        for (const [choice, win] of Object.entries(settlementResult)) {
            if (win) {
                if (result[choice]) {
                    result[choice] = result[choice] + 1;
                } else {
                    result[choice] = 1;
                }
            }
        }
        return result;
    }, {});
};

export const countResult = (roundHistory: Round<any, any>[]) => {
    return roundHistory.reduce((resultCount, { result }) => {
        Object.values(result.balls).forEach((choice: number) => {
            resultCount[choice] = (resultCount[choice] ?? 0) + 1;
        });
        return resultCount;
    }, {});
};

export const getPercentage = (keys: string[], countResult: object, total: number) => {
    const sortedCounter = keys.map((key) => ({ name: key, value: countResult[key] || 0 })).sort((a, b) => a.value - b.value);
    const calculatePercentage = (value: number) => {
        return total > 0 ? Math.round((value * 100) / total) : 0;
    };
    let totalPercentage = 0;
    return sortedCounter.reduce((result, counter, index) => {
        if (index === sortedCounter.length - 1) {
            result[counter.name] = counter.value > 0 ? 100 - totalPercentage : 0;
        } else {
            const percentage = calculatePercentage(counter.value);
            result[counter.name] = percentage;
            totalPercentage += percentage;
        }
        return result;
    }, {});
};

export const PercentageStatistic: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { roundHistory, onSelectGroup, selectedGroup, mainChoices, choicesInGroups, iconRenderer } = props;
    const counted = countSettlementResult(roundHistory);
    const clickSound = useClickSound();

    if (choicesInGroups) {
        const groups = [];

        choicesInGroups.forEach((group) => {
            const statisticResult = getPercentage(group, counted, roundHistory.length);
            groups.push(
                group.map((choice) => (
                    <StatisticItem key={choice} value={`${statisticResult[choice]}%`}>
                        {iconRenderer ? iconRenderer(choice) : <BeadBoardIcon choice={choice} />}
                    </StatisticItem>
                ))
            );
        });

        return (
            <div className={`${Styles["statistic-container"]} flex ${Styles["statistic-tab-container"]}`} id="bar-statistic">
                {groups.map((choices, index) => (
                    <div
                        key={index}
                        className={`${Styles["statistic-choices"]} ${index === selectedGroup ? Styles.selected : ""}`}
                        onClick={() => {
                            clickSound();
                            onSelectGroup && onSelectGroup(index);
                        }}
                    >
                        {choices}
                    </div>
                ))}
            </div>
        );
    } else {
        const statisticResult = getPercentage(mainChoices, counted, roundHistory.length);

        return (
            <div className={`${Styles["statistic-container"]} flex`} id="bar-statistic">
                {mainChoices.map((choice) => (
                    <StatisticItem key={choice} value={`${statisticResult[choice]}%`} className={props.className}>
                        {iconRenderer ? iconRenderer(choice) : <BeadBoardIcon choice={choice} />}
                    </StatisticItem>
                ))}
            </div>
        );
    }
};

export default memo(PercentageStatistic);
