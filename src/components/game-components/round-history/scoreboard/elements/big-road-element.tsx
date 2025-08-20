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
            const initialTotal = column * row;



            // Debug grouping details: how many groups will Big Road draw from the given items
            try {
                // eslint-disable-next-line no-console
                const specialKey = (converter as any)["specialKey"]?.call(converter);
                // eslint-disable-next-line no-console
                const positiveKey = (converter as any)["positiveKey"]?.call(converter);
                const groups = (converter as any).group?.(input) ?? [];
                const groupSizes = Array.isArray(groups) ? groups.map((g: any[]) => g?.length ?? 0) : [];
                const polarities = Array.isArray(groups)
                    ? groups.map((g: any[]) => (converter as any).convert?.(g))
                    : [];
                // eslint-disable-next-line no-console
                console.log(
                    "[BigRoad.arrange] groups summary:",
                    {
                        items: rounds?.length ?? 0,
                        inputAfterReverse: input?.length ?? 0,
                        groups: groups?.length ?? 0,
                        firstGroupSizes: groupSizes.slice(0, 20),
                        firstGroupPolarity: polarities.slice(0, 20),
                        positiveKey,
                        specialKey,
                        capacity: initialTotal,
                        row,
                        column,
                    }
                );
            } catch (_) { }

            bigRoad.initialize(input);

            const rows = bigRoad.rows();

            const columns = toFlattenColumns(rows);
            // Width-based capacity to keep all nodes (avoid trimming live content)
            const calculatedTotal = Math.max(Math.round((columns.length ?? 0) / row), column) * row;
            const result = fitContent(columns, calculatedTotal, { data: [] } as BigRoadScoreboardPoint<Round>);



            // Debug capacity fit: whether trimmed or padded
            try {
                const flattened = columns?.length ?? 0;
                const trimmed = flattened > calculatedTotal ? flattened - calculatedTotal : 0;
                const padded = flattened < calculatedTotal ? calculatedTotal - flattened : 0;
                // eslint-disable-next-line no-console
                console.log("[BigRoad.arrange] capacity fit:", { flattened, total: calculatedTotal, initialTotal, trimmed, padded });
            } catch (_) { }

            return result;
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
