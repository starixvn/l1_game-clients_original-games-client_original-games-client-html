import { Component, ReactNode } from "react";
import { TranslatorProps } from "../../../../page-components/translator";
import { Scoreboard, ScoreboardItemProps } from "../scoreboard";

type BeadRoadScoreboardItemProps<Round> = ScoreboardItemProps<Round> & TranslatorProps;

export abstract class BeadRoadElement<Round> extends Component<BeadRoadScoreboardItemProps<Round>> {
    static arrange<Round>(rounds: Round[], scoreboard: Scoreboard<Round>) {
        const clonedRounds = [...rounds];
        const total = scoreboard.props.column * scoreboard.props.row;

        while (clonedRounds.length > total) {
            clonedRounds.pop();
        }

        while (clonedRounds.length < total) {
            clonedRounds.unshift(null);
        }

        return clonedRounds.reverse();
    }

    abstract renderElement(round: Round): ReactNode;

    render(): ReactNode {
        const { round } = this.props;

        if (round) {
            return this.renderElement(round);
        }
        
        return null;
    }
}
