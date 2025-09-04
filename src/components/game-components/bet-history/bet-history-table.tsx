import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../table';
import { useGameContext } from '../../../_shared/react-contexts';
import { LoadingSpinner } from '../game-loading/loading-spinner';
import { useCommonTranslate, useClickSound } from '../../../_shared/react-hooks';
import useBetHistoryStore from '../../../_shared/stores/bet-history-store/bet-history-store';
import usePopupStore from '../../../_shared/stores/popup-store/popup-store';
import { BetHistoryHandler } from '../../game-base/handlers/bet-history-handler';
import {
    transformBetLogsToDisplayData,
    getWinValueColorClass,
    scrollBetHistoryToTop,
    BetHistoryDisplayData
} from './bet-history-utils';
import styles from './bet-history.module.scss';
import useBetDetailStore from '../../../_shared/stores/bet-detail-store';
import { cn } from '../../../_shared/utils/merge-tailwind-util';
import BouncingDotsLoader from './loader';


// Function to create row data for bet history table
const createBetHistoryRowData = (
    row: BetHistoryDisplayData,
    rowIndex: number,
    handleCellClick: (columnKey: string, row: BetHistoryDisplayData, index: number) => void,
    getWinValueColorClass: (win: string) => string
) => {
    return [
        {
            content: <div style={{ whiteSpace: 'pre-line' }}>{row.time}</div>,
        },
        {
            content: (
                <span className="text-table-text-clickable cursor-pointer">
                    {row.round}
                </span>
            ),
            className: "text-table-text-clickable cursor-pointer",
            onClick: () => handleCellClick('round', row, rowIndex)
        },
        {
            content: row.betAmount,
        },
        {
            content: (
                <div className={getWinValueColorClass(row.win)}>
                    {row.win}
                </div>
            ),
            className: "text-right",
        }
    ];
};

// Function to render bet history table rows
const renderBetHistoryRows = (
    tableData: any[],
    handleCellClick: (columnKey: string, row: BetHistoryDisplayData, index: number) => void,
    getWinValueColorClass: (win: string) => string
) => {
    return tableData.map((row, rowIndex) => {
        const rowData = createBetHistoryRowData(
            row,
            rowIndex,
            handleCellClick,
            getWinValueColorClass
        );

        return (
            <TableRow key={rowIndex} className={cn("border-none text-center", rowIndex % 2 === 0 ? "bg-bet-history-row-1" : "bg-bet-history-row-2")}>
                {rowData.map((cell, cellIndex) => (
                    <TableCell
                        key={cellIndex}
                        className={cn("text-secondary-text h-[60px] py-[7px] sm:p-4 px-1", cell.className)}
                        onClick={cell.onClick}
                    >
                        {cell.content}
                    </TableCell>
                ))}
            </TableRow>
        );
    });
};

// Function to render bet history table header
const renderBetHistoryHeader = (headerColumns: any[]) => {
    return (
        <TableRow className="bg-table-header sticky top-0 z-10 border-none h-[36px]">
            {headerColumns.map((column, index) => (
                <TableHead
                    key={column.key}
                    className={cn(
                        "text-primary-text p-2 lg:p-3 h-full font-semibold text-sm",
                        column.align === "right" ? "text-right" : "text-center",
                        index === 0 && "lg:rounded-tl-lg lg:rounded-bl-lg",
                        index === headerColumns.length - 1 && "lg:rounded-tr-lg lg:rounded-br-lg"
                    )}
                >
                    {column.label}
                </TableHead>
            ))}
        </TableRow>
    );
};

export const BetHistoryTable = () => {
    const { gameMessageHandler } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();

    // Store state
    const betLogs = useBetHistoryStore((state) => state.betLogs);
    const isLoading = useBetHistoryStore((state) => state.isLoading);
    const isExpanded = useBetHistoryStore((state) => state.isExpanded);
    const totalPages = useBetHistoryStore((state) => state.totalPages);

    const toggleBetDetail = usePopupStore(state => state.toggleBetDetail);
    const updateBetDetail = useBetDetailStore(state => state.updateBetDetail);

    // Local state
    const [betHistoryHandler, setBetHistoryHandler] = useState<BetHistoryHandler | null>(null);
    const [dynamicMaxHeight, setDynamicMaxHeight] = useState<string>('640px');
    const isInitialized = useRef(false);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    // Calculate dynamic max height based on 10 rows
    const calculateDynamicMaxHeight = useCallback(() => {
        if (!tableBodyRef.current) {
            return '640px';
        }

        const tableBody = tableBodyRef.current;
        const allRows = Array.from(tableBody.querySelectorAll('tr'));

        // Sum the heights of the first 10 rows (or fewer if less data)
        const rowsHeight = allRows.slice(0, 10).reduce((sum, row) => sum + row.getBoundingClientRect().height, 0);

        // Measure the header height dynamically instead of hard-coding
        const headerRow = tableBody.parentElement?.querySelector('thead tr') as HTMLTableRowElement | null;
        const headerHeight = headerRow ? headerRow.getBoundingClientRect().height : 36;

        const buffer = 1;

        const totalHeight = rowsHeight + headerHeight + buffer;

        const minHeight = 300;

        return `${Math.max(totalHeight, minHeight)}px`;
    }, []);

    // Initialize bet history handler
    useEffect(() => {
        if (!isInitialized.current && gameMessageHandler) {
            const handler = new BetHistoryHandler({ gameMessageHandler });
            setBetHistoryHandler(handler);

            // Load initial data
            handler.requestHistory(1);
            isInitialized.current = true;

            return () => {
                handler.cleanup();
            };
        }

        return () => {};
    }, [gameMessageHandler]);

    // Handle cell click for round column
    const handleCellClick = (columnKey: string, row: BetHistoryDisplayData, index: number) => {
        if (columnKey === 'round') {
            clickSound();
            // Update bet detail data in store
            const roundId = row.originalBetLog?.roundId;
            const betDetailData = {
                drawInfo: {
                    roundId: roundId,
                    result: row.originalBetLog?.result,
                    odds: row.originalBetLog?.odds,
                    settlementResult: row.originalBetLog?.settlementResult,
                    pfResult: {
                        roundId: row.originalBetLog?.roundId,
                        serverSeedHash: "",
                        serverSeed: "",
                        clientSeeds: [],
                        mergeSeed: "",
                        mergeClientSeed: "",
                        roundResult: [],
                        finalHash: "",
                        clientSeed: row.originalBetLog?.clientSeed || "",
                        editedMergeClientSeed: ""
                    },
                    clientSeed: row.originalBetLog?.clientSeed,
                },
                betLogDetails: row.originalBetLog?.betLogDetails || [],
            };

            updateBetDetail(betDetailData);
            toggleBetDetail(true);
        }
    };

    // Get displayed data from store
    const displayedBetLogs = isExpanded ? betLogs : betLogs.slice(0, 10);
    const tableData = transformBetLogsToDisplayData(displayedBetLogs);

    // Update dynamic max height when data changes or window resizes
    useLayoutEffect(() => {
        if (displayedBetLogs.length === 0) {
            return () => {};
        }

        const newHeight = calculateDynamicMaxHeight();
        setDynamicMaxHeight(newHeight);

        // Re-calculate on window resize
        const handleResize = () => {
            setDynamicMaxHeight(calculateDynamicMaxHeight());
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [displayedBetLogs, calculateDynamicMaxHeight]);

    // Handle toggle expand/collapse
    const handleToggleExpand = () => {
        if (!betHistoryHandler) {
            return;
        }

        const wasExpanded = isExpanded;
        betHistoryHandler.toggleExpanded();

        // Scroll to top when collapsing
        if (wasExpanded) {
            setTimeout(scrollBetHistoryToTop, 100);
        }
    };

    // Define header columns configuration
    const headerColumns = [
        { key: "time", label: translateCommon("time") },
        { key: "round", label: translateCommon("round").capitalizeFirstLetter() },
        { key: "total_stake", label: translateCommon("bet_amount") },
        { key: "win", label: translateCommon("win"), align: "right" }
    ];

    // Show loading spinner for initial load
    if (isLoading && displayedBetLogs.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className={`${styles['bet-history-container']} rounded-xl bg-primary-bg p-2 h-full border border-primary-border`}>
            <div
                key={isExpanded ? 'expanded' : 'collapsed'}
                className={`bet-history-scroll-wrapper min-h-[300px] ${styles['table-scroll-wrapper']} ${isExpanded ? styles.expanded : ''}`}
                style={{ maxHeight: dynamicMaxHeight, overflowY: 'auto' }}
            >
                <Table className="bet-history-table">
                    <TableHeader>
                        {renderBetHistoryHeader(headerColumns)}
                    </TableHeader>
                    <TableBody ref={tableBodyRef}>
                        {tableData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-secondary-text">
                                    {translateCommon("no_data")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            renderBetHistoryRows(tableData, handleCellClick, getWinValueColorClass)
                        )}
                    </TableBody>
                </Table>
            </div>

            {renderToggleButton(totalPages, isExpanded, isLoading, handleToggleExpand, styles, translateCommon)}
        </div>
    );
};

// Extracted function for rendering toggle button
function renderToggleButton(
    totalPages: number,
    isExpanded: boolean,
    isLoading: boolean,
    handleToggleExpand: () => void,
    styles: any,
    t: any
) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={`${styles['toggle-button-container']} py-5`}>
            {isLoading ? (
                <BouncingDotsLoader />
            ) : (
            <button
                className={`${styles['toggle-button']} rounded-lg`}
                onClick={handleToggleExpand}
                disabled={isLoading}
            >
                {isExpanded ? t("show_less") : t("show_more")}
            </button>
            
        )}
        </div>
    );
}
