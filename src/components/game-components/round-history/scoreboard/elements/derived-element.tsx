import { BigRoadScoreboard, Converter, DerivedScoreboardPoint, DerivedScoreboards } from "sc-scoreboards";
import type { Scoreboard, ScoreboardItemProps } from "../scoreboard";

import { Component, ReactNode } from "react";
import { fitContent, toFlattenColumns } from "../utilities";

export abstract class DerivedElement extends Component<ScoreboardItemProps<DerivedScoreboardPoint>> {
    static arrange<Round>(converter: Converter<Round>, key: "bigEyeBoy" | "smallRoad" | "cockroachPig") {
        return function (rounds: Round[], scoreboard: Scoreboard<Round>): DerivedScoreboardPoint[] {
            const { row: height, column } = scoreboard.props;

            console.log("[DerivedElement] arrange - input:", {
                key,
                roundsCount: rounds.length,
                height,
                column,
                total: column * height
            });

            const bigRoad = new BigRoadScoreboard({ converter, height });
            const derived = new DerivedScoreboards({ height });
            const input = [...rounds].reverse();
            const total = column * height;

            console.log("[DerivedElement] arrange - processing:", {
                inputLength: input.length,
                total,
                converterType: converter.constructor.name
            });

            bigRoad.initialize(input);

            const bigRoadRows = bigRoad.rows();
            console.log("[DerivedElement] arrange - bigRoad rows:", {
                rowsCount: bigRoadRows.length,
                rows: bigRoadRows.map((row, index) => ({ index, length: row.length }))
            });

            derived.update(bigRoadRows);

            const derivedRows = derived.getScoreboardData(key);
            console.log("[DerivedElement] arrange - derived rows:", {
                key,
                rowsCount: derivedRows.length,
                rows: derivedRows.map((row, index) => ({ index, length: row.length }))
            });

            const columns = toFlattenColumns(derivedRows);
            const result = fitContent(columns, total, {} as DerivedScoreboardPoint);

            console.log("[DerivedElement] arrange - result:", {
                columnsLength: columns.length,
                resultLength: result.length,
                total
            });

            return result;
        };
    }

    abstract renderA(): ReactNode;

    abstract renderB(): ReactNode;

    render(): ReactNode {
        const { round } = this.props;

        console.log("[DerivedElement] render:", {
            roundStatus: round.status,
            hasData: !!round.data,
            dataLength: round.data?.length
        });

        if (round.status !== undefined) {
            return round.status ? this.renderA() : this.renderB();
        }

        return null;
    }
}
