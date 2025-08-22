import { useEffect, useRef, useState } from 'react';
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
import useGameStore from '../../../_shared/stores/game-store/game-store';
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
            <TableRow key={rowIndex} className="text-center border-b border-primary-border">
                {rowData.map((cell, cellIndex) => (
                    <TableCell 
                        key={cellIndex}
                        className={cn(cell.className, "text-secondary-text text-center h-[60px] py-[7px] sm:p-4")}
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
                        "text-primary-text text-center p-2",
                        index === 0 && "rounded-tl-lg rounded-bl-lg",
                        index === headerColumns.length - 1 && "rounded-tr-lg rounded-br-lg"
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
    const {
        getDisplayedBetLogs,
        isLoading,
        isExpanded,
        totalPages,
    } = useGameStore();

    const toggleBetDetail = usePopupStore(state => state.toggleBetDetail);
    const updateBetDetail = useBetDetailStore(state => state.updateBetDetail);

    // Local state
    const [betHistoryHandler, setBetHistoryHandler] = useState<BetHistoryHandler | null>(null);
    const isInitialized = useRef(false);

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
        return undefined;
    }, [gameMessageHandler]);

    // Handle cell click for round column
    const handleCellClick = (columnKey: string, row: BetHistoryDisplayData, index: number) => {
        if (columnKey === 'round') {
            clickSound();
            // Update bet detail data in store
            const drawId = row.originalBetLog?.drawId ?? row.originalBetLog?.roundId ?? row.originalBetLog?.phien;
            const betDetailData = {
                drawInfo: {
                    drawId: drawId,
                    result: row.originalBetLog?.result,
                    odds: row.originalBetLog?.odds,
                    settlementResult: row.originalBetLog?.settlementResult,
                    pfResult: {
                        drawId: drawId,
                        roundId: row.originalBetLog?.roundId ?? row.originalBetLog?.phien,
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
    const displayedBetLogs = getDisplayedBetLogs();
    const tableData = transformBetLogsToDisplayData(displayedBetLogs);

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
        { key: "total_stake", label: translateCommon("total_stake") },
        { key: "win", label: translateCommon("win") }
    ];

    // Show loading spinner for initial load
    if (isLoading && displayedBetLogs.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className={`${styles['bet-history-container']} rounded-xl bg-white dark:bg-primary-bg p-2`}>
            <div
                key={isExpanded ? 'expanded' : 'collapsed'}
                className={`bet-history-scroll-wrapper h-[650px] ${styles['table-scroll-wrapper']} ${isExpanded ? styles.expanded : ''}`}
            >
                <Table className="bet-history-table">
                    <TableHeader>
                        {renderBetHistoryHeader(headerColumns)}
                    </TableHeader>
                    <TableBody>
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

            {renderToggleButton(totalPages, isExpanded, isLoading, handleToggleExpand, styles)}
        </div>
    );
};

// Extracted function for rendering toggle button
function renderToggleButton(
    totalPages: number,
    isExpanded: boolean,
    isLoading: boolean,
    handleToggleExpand: () => void,
    styles: any
) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={styles['toggle-button-container']}>
            <button
                className={`${styles['toggle-button']} rounded-lg`}
                onClick={handleToggleExpand}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <LoadingSpinner />
                        Loading...
                    </span>
                ) : (
                    isExpanded ? "Show Less" : "Show More"
                )}
            </button>
        </div>
    );
}
