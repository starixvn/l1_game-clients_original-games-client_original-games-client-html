import { BigRoadScoreboard, BigRoadScoreboardPoint, Converter } from "sc-scoreboards";
import type { Scoreboard, ScoreboardItemProps } from "../scoreboard";

import { Component, ReactNode } from "react";
import { fitContent, toFlattenColumns } from "../utilities";

export type BigRoadRound<T> = Partial<BigRoadScoreboardPoint<T>>;

export abstract class BigRoadElement<Round> extends Component<ScoreboardItemProps<BigRoadRound<Round>>> {
    static arrange<Round>(converter: Converter<Round>) {
        return function (rounds: Round[], scoreboard: Scoreboard<Round>): BigRoadRound<Round>[] {
            const { row, column } = scoreboard.props;



            const bigRoad = new BigRoadScoreboard({ converter, height: row });
            const input = [...rounds].reverse();



            bigRoad.initialize(input);

            const rows = bigRoad.rows();

            const columns = toFlattenColumns(rows);
            // Width-based capacity to keep all nodes (avoid trimming live content)
            const calculatedTotal = Math.max(Math.round((columns.length ?? 0) / row), column) * row;
            return fitContent(columns, calculatedTotal, { data: [] } as BigRoadScoreboardPoint<Round>);
        };
    }

    abstract renderElement(round: BigRoadRound<Round>): ReactNode;

    render(): ReactNode {
        const { round } = this.props;



        if (round?.data.length !== 0) {
            return this.renderElement(round);
        }

        return null;
    }
}
