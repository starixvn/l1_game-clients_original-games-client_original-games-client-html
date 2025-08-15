import { BigRoadScoreboard, Converter, DerivedScoreboardPoint, DerivedScoreboards } from "sc-scoreboards";
import type { Scoreboard, ScoreboardItemProps } from "../scoreboard";

import { Component, ReactNode } from "react";
import { fitContent, toFlattenColumns } from "../utilities";

export abstract class DerivedElement extends Component<ScoreboardItemProps<DerivedScoreboardPoint>> {
    static arrange<Round>(converter: Converter<Round>, key: "bigEyeBoy" | "smallRoad" | "cockroachPig") {
        return function (rounds: Round[], scoreboard: Scoreboard<Round>): DerivedScoreboardPoint[] {
            const { row: height, column } = scoreboard.props;
            const bigRoad = new BigRoadScoreboard({ converter, height });
            const derived = new DerivedScoreboards({ height });
            const input = [...rounds].reverse();
            const total = column * height;

            bigRoad.initialize(input);

            const bigRoadRows = bigRoad.rows();

            derived.update(bigRoadRows);

            const derivedRows = derived.getScoreboardData(key);
            const columns = toFlattenColumns(derivedRows);

            return fitContent(columns, total, {} as DerivedScoreboardPoint);
        };
    }

    abstract renderA(): ReactNode;

    abstract renderB(): ReactNode;

    render(): ReactNode {
        const { round } = this.props;

        if (round.status !== undefined) {
            return round.status ? this.renderA() : this.renderB();
        }
        
        return null;
    }
}
