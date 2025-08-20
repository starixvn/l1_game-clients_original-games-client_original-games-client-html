import { Component, HTMLAttributes, ReactNode } from "react";
import Scoreboard, { ScoreboardProps } from "..";

export type SwitchableScoreboardProps<T> = {
    rounds: T[];
    scoreboards: (Partial<ScoreboardProps<T>> & { name?: string })[];
    onSwitch?: (props: Partial<ScoreboardProps<T>>) => Partial<ScoreboardProps<T>>;
} & HTMLAttributes<unknown>;

export type SwitchableScoreboardState = {
    selected: number;
};

export class SwitchableScoreboard<Round> extends Component<SwitchableScoreboardProps<Round>, SwitchableScoreboardState> {
    state: SwitchableScoreboardState = {
        selected: 0,
    };

    componentDidMount(): void {

        this.logDimensions();
    }

    componentDidUpdate(prevProps: SwitchableScoreboardProps<Round>, prevState: SwitchableScoreboardState): void {
        if (prevState.selected !== this.state.selected) {

            this.logDimensions();
        }
    }

    private logDimensions(): void {
        setTimeout(() => {
            const containerElement = document.querySelector('[data-testid="switchable-scoreboard"]') as HTMLElement;
            if (containerElement) {
                const rect = containerElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(containerElement);

            } else {

            }
        }, 100);
    }

    selectBoard(index: number) {

        this.setState({ selected: index });
    }

    getHTMLAttributes() {
        const { rounds, scoreboards, onSwitch, ...props } = this.props;
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

    // Scale mode removed; only switch mode is supported

    render(): ReactNode {

        return this.renderSwitchBoards();
    }
}
