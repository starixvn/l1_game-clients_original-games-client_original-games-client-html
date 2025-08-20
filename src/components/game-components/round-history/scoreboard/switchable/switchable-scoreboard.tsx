import "swiper/css";
import "swiper/css/pagination";

import { Component, HTMLAttributes, ReactNode } from "react";
import Scoreboard, { ScoreboardProps } from "..";

const DEBUG_ENABLED = false;
const debug = DEBUG_ENABLED ? console.log.bind(console) : (..._args: unknown[]) => { };

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

    componentDidMount(): void {
        debug("[SwitchableScoreboard] componentDidMount:", {
            type: this.props.type,
            scoreboardsCount: this.props.scoreboards.length,
            roundsCount: this.props.rounds.length,
            selected: this.state.selected
        });
        this.logDimensions();
    }

    componentDidUpdate(prevProps: SwitchableScoreboardProps<Round>, prevState: SwitchableScoreboardState): void {
        if (prevState.selected !== this.state.selected) {
            debug("[SwitchableScoreboard] componentDidUpdate - selected changed:", {
                from: prevState.selected,
                to: this.state.selected,
                scoreboardName: this.props.scoreboards[this.state.selected]?.name
            });
            this.logDimensions();
        }
    }

    private logDimensions(): void {
        setTimeout(() => {
            const containerElement = document.querySelector('[data-testid="switchable-scoreboard"]') as HTMLElement;
            if (containerElement) {
                const rect = containerElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(containerElement);
                debug("[SwitchableScoreboard] Dimensions:", {
                    width: rect.width,
                    height: rect.height,
                    offsetWidth: containerElement.offsetWidth,
                    offsetHeight: containerElement.offsetHeight,
                    scrollWidth: containerElement.scrollWidth,
                    scrollHeight: containerElement.scrollHeight,
                    clientWidth: containerElement.clientWidth,
                    clientHeight: containerElement.clientHeight,
                    padding: computedStyle.padding,
                    margin: computedStyle.margin,
                    border: computedStyle.border,
                    display: computedStyle.display
                });
            } else {
                debug("[SwitchableScoreboard] Container element not found");
            }
        }, 100);
    }

    selectBoard(index: number) {
        debug("[SwitchableScoreboard] selectBoard:", {
            from: this.state.selected,
            to: index,
            scoreboardName: this.props.scoreboards[index]?.name
        });
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

        debug("[SwitchableScoreboard] renderSwitchBoards:", {
            selected,
            boardName: board?.name,
            nextBoard,
            nextBoardName: scoreboards[nextBoard]?.name,
            propsKeys: Object.keys(props)
        });

        return <Scoreboard {...props} />;
    }

    renderScaleBoards(): ReactNode {
        const { scoreboards, rounds, onSwitch } = this.props;
        const { selected } = this.state;
        const htmlProps = this.getHTMLAttributes();
        const selectBoard = (index: number) => this.selectBoard(index === selected ? 0 : index);

        debug("[SwitchableScoreboard] renderScaleBoards:", {
            selected,
            scoreboardsCount: scoreboards.length,
            htmlPropsKeys: Object.keys(htmlProps)
        });

        return (
            <div {...htmlProps} data-testid="switchable-scoreboard">
                {scoreboards.map((board, index) => {
                    const defaultProps = {
                        key: index,
                        onClick: () => selectBoard(index + 1),
                        rounds: board.rounds ?? rounds,
                        ...board,
                    };
                    const props = onSwitch && index + 1 === selected ? onSwitch(defaultProps) : defaultProps;

                    debug("[SwitchableScoreboard] renderScaleBoards - board:", {
                        index,
                        boardName: board.name,
                        isSelected: index + 1 === selected,
                        propsKeys: Object.keys(props)
                    });

                    return <Scoreboard key={index} {...props} />;
                })}
            </div>
        );
    }

    render(): ReactNode {
        const { type } = this.props;

        debug("[SwitchableScoreboard] render:", { type });

        if (type === "switch") {
            return this.renderSwitchBoards();
        }

        if (type === "scale") {
            return this.renderScaleBoards();
        }

        return null;
    }
}
