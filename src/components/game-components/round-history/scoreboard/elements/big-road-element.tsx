import { BigRoadScoreboard, BigRoadScoreboardPoint, Converter } from "sc-scoreboards";
import type { Scoreboard, ScoreboardItemProps } from "../scoreboard";

import { Component, ReactNode } from "react";
import { fitContent, toFlattenColumns } from "../utilities";

export type BigRoadRound<T> = Partial<BigRoadScoreboardPoint<T>>;

export abstract class BigRoadElement<Round> extends Component<ScoreboardItemProps<BigRoadRound<Round>>> {
    static arrange<Round>(converter: Converter<Round>) {
        return function (rounds: Round[], scoreboard: Scoreboard<Round>): BigRoadRound<Round>[] {
            const { row, column } = scoreboard.props;

            console.log("[BigRoadElement] arrange - input:", {
                roundsCount: rounds.length,
                row,
                column,
                total: column * row,
                converterType: converter.constructor.name
            });

            const bigRoad = new BigRoadScoreboard({ converter, height: row });
            const input = [...rounds].reverse();
            const total = column * row;

            console.log("[BigRoadElement] arrange - processing:", {
                inputLength: input.length,
                total,
                bigRoadHeight: row
            });

            bigRoad.initialize(input);

            const rows = bigRoad.rows();
            console.log("[BigRoadElement] arrange - bigRoad rows:", {
                rowsCount: rows.length,
                rows: rows.map((row, index) => ({ index, length: row.length }))
            });

            const columns = toFlattenColumns(rows);
            const result = fitContent(columns, total, { data: [] } as BigRoadScoreboardPoint<Round>);

            console.log("[BigRoadElement] arrange - result:", {
                columnsLength: columns.length,
                resultLength: result.length,
                total
            });

            return result;
        };
    }

    abstract renderElement(round: BigRoadRound<Round>): ReactNode;

    render(): ReactNode {
        const { round } = this.props;

        console.log("[BigRoadElement] render:", {
            hasData: !!round?.data,
            dataLength: round?.data?.length,
            roundKeys: round ? Object.keys(round) : []
        });

        if (round?.data.length !== 0) {
            return this.renderElement(round);
        }

        return null;
    }
}
