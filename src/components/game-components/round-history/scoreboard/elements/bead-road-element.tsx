import { Component, ReactNode } from "react";
import { TranslatorProps } from "../../../../page-components/translator";
import { Scoreboard, ScoreboardItemProps } from "../scoreboard";

type BeadRoadScoreboardItemProps<Round> = ScoreboardItemProps<Round> & TranslatorProps;

export abstract class BeadRoadElement<Round> extends Component<BeadRoadScoreboardItemProps<Round>> {
    static arrange<Round>(rounds: Round[], scoreboard: Scoreboard<Round>) {
        const clonedRounds = [...rounds];
        const total = scoreboard.props.column * scoreboard.props.row;

        console.log("[BeadRoadElement] arrange - input:", {
            roundsCount: rounds.length,
            clonedRoundsCount: clonedRounds.length,
            column: scoreboard.props.column,
            row: scoreboard.props.row,
            total
        });

        while (clonedRounds.length > total) {
            clonedRounds.pop();
        }

        while (clonedRounds.length < total) {
            clonedRounds.unshift(null);
        }

        const result = clonedRounds.reverse();

        console.log("[BeadRoadElement] arrange - result:", {
            originalLength: rounds.length,
            resultLength: result.length,
            total,
            nullCount: result.filter(item => item === null).length
        });

        return result;
    }

    abstract renderElement(round: Round): ReactNode;

    render(): ReactNode {
        const { round } = this.props;

        console.log("[BeadRoadElement] render:", {
            hasRound: !!round,
            roundType: round ? typeof round : 'null',
            roundKeys: round ? Object.keys(round) : []
        });

        if (round) {
            return this.renderElement(round);
        }

        return null;
    }
}
