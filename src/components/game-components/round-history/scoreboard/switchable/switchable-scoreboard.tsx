import "swiper/css";
import "swiper/css/pagination";

import { Component, HTMLAttributes, ReactNode } from "react";
import Scoreboard, { ScoreboardProps } from "..";

export type SwitchableScoreboardProps<T> = {
    rounds: T[];
    scoreboards: (Partial<ScoreboardProps<T>> & { name?: string })[];
    type: "switch" | "scale";
    onSwitch?: (props: Partial<ScoreboardProps<T>>) => Partial<ScoreboardProps<T>>;
} & HTMLAttributes<unknown>;

export type SwitchableScoreboardState = {
    selected: number;
};

export class SwitchableScoreboard<Round> extends Component<SwitchableScoreboardProps<Round>, SwitchableScoreboardState> {
    state: SwitchableScoreboardState = {
        selected: 0,
    };

    selectBoard(index: number) {
        this.setState({ selected: index });
    }

    getHTMLAttributes() {
        const { rounds, scoreboards, type, onSwitch, ...props } = this.props;

        return props;
    }

    renderSwitchBoards(): ReactNode {
        const { scoreboards, rounds, onSwitch } = this.props;
        const { selected } = this.state;
        const board = scoreboards.at(selected);
        const nextBoard = (selected + 1) % scoreboards.length;
        const html = this.getHTMLAttributes();
        const defaultProps = {
            onClick: () => this.selectBoard(nextBoard),
            rounds: board.rounds ?? rounds,
            ...html,
            ...board,
        };
        const props = onSwitch ? onSwitch(defaultProps) : defaultProps;

        return <Scoreboard {...props} />;
    }

    renderScaleBoards(): ReactNode {
        const { scoreboards, rounds, onSwitch } = this.props;
        const { selected } = this.state;
        const htmlProps = this.getHTMLAttributes();
        const selectBoard = (index: number) => this.selectBoard(index === selected ? 0 : index);

        return (
            <div {...htmlProps}>
                {scoreboards.map((board, index) => {
                    const defaultProps = {
                        key: index,
                        onClick: () => selectBoard(index + 1),
                        rounds: board.rounds ?? rounds,
                        ...board,
                    };
                    const props = onSwitch && index + 1 === selected ? onSwitch(defaultProps) : defaultProps;

                    return <Scoreboard key={index} {...props} />;
                })}
            </div>
        );
    }

    render(): ReactNode {
        const { type } = this.props;

        if (type === "switch") {
            return this.renderSwitchBoards();
        }

        if (type === "scale") {
            return this.renderScaleBoards();
        }
        
        return null;
    }
}
