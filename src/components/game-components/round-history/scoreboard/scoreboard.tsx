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
        console.log("[Scoreboard] constructor - props:", {
            column: props.column,
            row: props.row,
            block: props.block,
            roundsCount: props.rounds?.length,
            className: props.className,
            scrollToRight: props.scrollToRight
        });

        // Log the structure of the first and last round to understand the data format
        if (props.rounds && props.rounds.length > 0) {
            const firstRound = props.rounds[0];
            const lastRound = props.rounds[props.rounds.length - 1];
            console.log("[Scoreboard] constructor - round data structure:", {
                firstRoundKeys: firstRound ? Object.keys(firstRound) : [],
                lastRoundKeys: lastRound ? Object.keys(lastRound) : [],
                firstRoundSample: firstRound ? {
                    roundId: firstRound["roundId"],
                    drawId: firstRound["drawId"],
                    id: firstRound["id"],
                    data: firstRound["data"]?.length
                } : null,
                lastRoundSample: lastRound ? {
                    roundId: lastRound["roundId"],
                    drawId: lastRound["drawId"],
                    id: lastRound["id"],
                    data: lastRound["data"]?.length
                } : null
            });
        }
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

        console.log("[Scoreboard] createGroup - calculations:", {
            block,
            row,
            rowByGroup,
            roundsCount: rounds.length
        });

        const horizontalGroups = chunk(rounds, block);
        const columns = chunk(horizontalGroups, rowByGroup);
        const verticalGroups = chunk(columns, block);

        console.log("[Scoreboard] createGroup - intermediate results:", {
            horizontalGroupsCount: horizontalGroups.length,
            columnsCount: columns.length,
            verticalGroupsCount: verticalGroups.length
        });

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

        console.log("[Scoreboard] createGroup - final groups count:", groups.length);
        return groups;
    }

    focusOnFirstRoundAndCalculateColumns(): void {
        const { updateScoreboardColumns } = this.props;
        console.log("[Scoreboard] focusOnFirstRoundAndCalculateColumns - actualColumns:", this.actualColumns);
        updateScoreboardColumns?.(this.actualColumns);
    }

    componentDidMount(): void {
        console.log("[Scoreboard] componentDidMount");
        this.focusOnFirstRoundAndCalculateColumns();
        this.logDimensions();
        this.updateGridTemplateColumns();
    }

    componentDidUpdate(prevProps): void {
        // Check for multiple possible ID fields in the round data
        const prevRound = prevProps.rounds.at(-1);
        const currentRound = this.props.rounds.at(-1);

        const prevRoundId = prevRound?.["roundId"] || prevRound?.["drawId"] || prevRound?.["id"];
        const currentRoundId = currentRound?.["roundId"] || currentRound?.["drawId"] || currentRound?.["id"];
        const prevRoundsCount = prevProps.rounds?.length || 0;
        const currentRoundsCount = this.props.rounds?.length || 0;

        console.log("[Scoreboard] componentDidUpdate - comparison:", {
            prevRoundId,
            currentRoundId,
            prevRoundsCount,
            currentRoundsCount,
            roundIdChanged: prevRoundId !== currentRoundId,
            roundsCountChanged: prevRoundsCount !== currentRoundsCount,
            lastRoundData: currentRound ? Object.keys(currentRound) : [],
            lastRoundSample: currentRound ? {
                roundId: currentRound["roundId"],
                drawId: currentRound["drawId"],
                id: currentRound["id"],
                data: currentRound["data"]?.length
            } : null
        });

        // Update if roundId changed or rounds count changed
        if (prevRoundId !== currentRoundId || prevRoundsCount !== currentRoundsCount) {
            console.log("[Scoreboard] componentDidUpdate - triggering updates");
            this.focusOnFirstRoundAndCalculateColumns();
            this.logDimensions();
            this.updateGridTemplateColumns();
        }
    }

    private updateGridTemplateColumns(): void {
        setTimeout(() => {
            const scoreboardElement = document.querySelector('[data-testid="scoreboard"]') as HTMLElement;
            if (scoreboardElement && this.actualColumns) {
                // Calculate the total width needed
                const columnWidth = 18; // 18px per column from CSS
                const totalWidth = this.actualColumns * columnWidth;

                console.log("[Scoreboard] updateGridTemplateColumns:", {
                    actualColumns: this.actualColumns,
                    columnWidth,
                    totalWidth,
                    currentStyle: scoreboardElement.style.gridTemplateColumns
                });

                // Set explicit grid template columns
                scoreboardElement.style.gridTemplateColumns = `repeat(${this.actualColumns}, ${columnWidth}px)`;
                scoreboardElement.style.width = `${totalWidth}px`;

                console.log("[Scoreboard] Grid template updated:", {
                    newGridTemplateColumns: scoreboardElement.style.gridTemplateColumns,
                    newWidth: scoreboardElement.style.width
                });
            }
        }, 50);
    }

    private logDimensions(): void {
        setTimeout(() => {
            const scoreboardElement = document.querySelector('[data-testid="scoreboard"]') as HTMLElement;
            if (scoreboardElement) {
                const rect = scoreboardElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(scoreboardElement);

                // Get all grid items to calculate actual content width
                const gridItems = scoreboardElement.querySelectorAll('.scoreboard-block');
                const gridItemRects = Array.from(gridItems).map(item => {
                    const itemRect = item.getBoundingClientRect();
                    return {
                        left: itemRect.left,
                        right: itemRect.right,
                        width: itemRect.width
                    };
                });

                const maxRight = Math.max(...gridItemRects.map(item => item.right));
                const minLeft = Math.min(...gridItemRects.map(item => item.left));
                const actualContentWidth = maxRight - minLeft;

                console.log("[Scoreboard] Dimensions:", {
                    width: rect.width,
                    height: rect.height,
                    offsetWidth: scoreboardElement.offsetWidth,
                    offsetHeight: scoreboardElement.offsetHeight,
                    scrollWidth: scoreboardElement.scrollWidth,
                    scrollHeight: scoreboardElement.scrollHeight,
                    clientWidth: scoreboardElement.clientWidth,
                    clientHeight: scoreboardElement.clientHeight,
                    padding: computedStyle.padding,
                    margin: computedStyle.margin,
                    border: computedStyle.border,
                    display: computedStyle.display,
                    position: computedStyle.position,
                    gridTemplateColumns: computedStyle.gridTemplateColumns,
                    gridTemplateRows: computedStyle.gridTemplateRows,
                    gridAutoColumns: computedStyle.gridAutoColumns,
                    gridAutoRows: computedStyle.gridAutoRows,
                    minWidth: computedStyle.minWidth,
                    maxWidth: computedStyle.maxWidth,
                    overflow: computedStyle.overflow,
                    overflowX: computedStyle.overflowX,
                    overflowY: computedStyle.overflowY
                });

                console.log("[Scoreboard] Grid Analysis:", {
                    gridItemsCount: gridItems.length,
                    actualContentWidth,
                    containerWidth: rect.width,
                    widthDifference: actualContentWidth - rect.width,
                    gridItemRects: gridItemRects.slice(0, 5), // First 5 items
                    lastGridItem: gridItemRects[gridItemRects.length - 1]
                });

                // Check parent container
                const parentElement = scoreboardElement.parentElement;
                if (parentElement) {
                    const parentRect = parentElement.getBoundingClientRect();
                    const parentComputedStyle = window.getComputedStyle(parentElement);
                    console.log("[Scoreboard] Parent Container:", {
                        width: parentRect.width,
                        height: parentRect.height,
                        display: parentComputedStyle.display,
                        position: parentComputedStyle.position,
                        overflow: parentComputedStyle.overflow,
                        padding: parentComputedStyle.padding,
                        margin: parentComputedStyle.margin
                    });
                }
            } else {
                console.log("[Scoreboard] Scoreboard element not found");
            }
        }, 100);
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

        console.log("[Scoreboard] render - layout info:", {
            roundsCount: rounds.length,
            arrangedCount: arranged.length,
            groupItemsCount: groupItems.length,
            originalRow,
            block,
            className,
            scrollToRight
        });

        // Calculate expected grid columns based on CSS
        const expectedColumns = this.props.column || 17;
        const expectedGridWidth = expectedColumns * 18; // 18px per column from CSS
        console.log("[Scoreboard] render - grid calculations:", {
            expectedColumns,
            expectedGridWidth,
            actualColumns: this.actualColumns,
            groupItemsCount: groupItems.length,
            rowByGroup: (originalRow / block) >> 0,
            calculatedColumns: Math.ceil(groupItems.length / ((originalRow / block) >> 0))
        });

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

                        console.log("[Scoreboard] render - block layout:", {
                            index,
                            itemsCount: items.length,
                            rowByGroup,
                            parentColumn,
                            row,
                            style
                        });

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
                                        console.log("[Scoreboard] render - actualColumns updated:", {
                                            parentColumn,
                                            itemIndex,
                                            roundDataLength: round["data"]?.length
                                        });
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
