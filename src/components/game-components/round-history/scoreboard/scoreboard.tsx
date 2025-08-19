import { Attributes, CSSProperties, Component, ComponentType, HTMLAttributes, ReactNode, createElement } from "react";
import styles from "./scoreboard.module.scss";
import { chunk } from "./utilities";
import SwipeScrollGrid from "../../swipe-scroll-grid";

export type ScoreboardProps<Round> = {
    arrange: (data: unknown[], scoreboard: unknown) => unknown[];
    rounds: Round[];
    column?: number;
    row: number;
    element: ComponentType<any>;
    className?: string;
    elementClassName?: string;
    blockClassName?: string;
    block?: number;
    updateScoreboardColumns?: (actualColumns: number) => void;
    scrollToRight?: boolean;
} & HTMLAttributes<unknown>;

export type ScoreboardItemProps<Round> = {
    round: Round;
    scoreboard?: Scoreboard<Round>;
};

export class Scoreboard<Round> extends Component<ScoreboardProps<Round>> {
    private actualColumns: number;

    constructor(props) {
        super(props);
    }

    static defaultProps: Partial<ScoreboardProps<unknown>> = {
        column: 17,
        row: 6,
        className: "",
        elementClassName: "",
        block: 1,
        blockClassName: "",
        scrollToRight: true
    };

    private renderElement(round: Round, props: Attributes | HTMLAttributes<unknown>): ReactNode {
        const { element } = this.props;

        return <div {...props}>{createElement(element, { round, scoreboard: this })}</div>;
    }

    private createGroup(rounds: Round[] | unknown[]) {
        const { block, row } = this.props;
        const rowByGroup = (row / block) >> 0;

        const horizontalGroups = chunk(rounds, block);
        const columns = chunk(horizontalGroups, rowByGroup);
        const verticalGroups = chunk(columns, block);

        const groups = verticalGroups.flatMap((vertical) => {
            const blocks = [];

            for (let row = 0; row < rowByGroup; row++) {
                const block = [];

                for (let horizontal of vertical) {
                    block.push(...horizontal[row]);
                }

                blocks.push(block);
            }

            return blocks;
        });

        return groups;
    }

    focusOnFirstRoundAndCalculateColumns(): void {
        const { updateScoreboardColumns } = this.props;
        updateScoreboardColumns?.(this.actualColumns);
    }

    componentDidMount(): void {
        this.focusOnFirstRoundAndCalculateColumns();
    }

    componentDidUpdate(prevProps): void {
        const prevDrawId = prevProps.rounds.at(-1)?.["drawId"];
        const currentDrawId = this.props.rounds.at(-1)?.["drawId"];

        if (prevDrawId !== currentDrawId) {
            this.focusOnFirstRoundAndCalculateColumns();
        }
    }

    getHTMLAttributes() {
        const {
            rounds,
            className,
            elementClassName,
            block,
            row: originalRow,
            element,
            arrange,
            blockClassName,
            updateScoreboardColumns,
            scrollToRight,
            ...htmlProps
        } = this.props;

        return htmlProps;
    }

    render(): ReactNode {
        const { rounds, className, elementClassName, blockClassName, block, row: originalRow, arrange, scrollToRight } = this.props;
        const htmlProps = this.getHTMLAttributes();
        const arranged = arrange(rounds, this) as Round[];
        const groupItems = this.createGroup(arranged);

        return (
            <div className={`${styles.scoreboard} ${className}`} {...htmlProps} data-testid="scoreboard">
                <SwipeScrollGrid scrollRightSignal={scrollToRight}>
                    {groupItems.map((items: Round[], index: number) => {
                        const rowByGroup = (originalRow / block) >> 0;
                        const parentColumn = (index / rowByGroup + 1) >> 0;
                        const row = (index % rowByGroup) + 1;
                        const style: CSSProperties = {
                            gridColumnStart: parentColumn,
                            gridRowStart: row,
                        };

                        return (
                            <div className={`${styles["scoreboard-block"]} ${blockClassName}`} key={index} style={style}>
                                {items.map((round, itemIndex) => {
                                    const column = (itemIndex / block + 1) >> 0;
                                    const itemRow = (itemIndex % block) + 1;
                                    const itemStyle: CSSProperties = {
                                        gridColumnStart: column,
                                        gridRowStart: itemRow,
                                    };

                                    if (round && round["data"]?.length > 0) {
                                        this.actualColumns = parentColumn;
                                    }

                                    return this.renderElement(round, {
                                        className: `${styles["scoreboard-item"]} ${elementClassName}`,
                                        style: itemStyle,
                                        key: itemIndex,
                                    });
                                })}
                            </div>
                        );
                    })}
                </SwipeScrollGrid>
            </div>
        );
    }
}
