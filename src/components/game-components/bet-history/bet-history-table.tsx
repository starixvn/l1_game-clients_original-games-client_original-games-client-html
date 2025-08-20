import { useEffect, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table/s-table';
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

const commonStyles = {
  headerRow: "border-primary-border bg-primary-bg",
  headerCell: "text-primary-text text-center p-2 border-b border-primary-border sticky top-0 z-10",
  dataRow: "text-center border-b border-primary-border",
  dataCell: "py-3 text-secondary-text",
  roundCell: "text-table-text-clickable cursor-pointer py-3",
  roundSpan: "text-blue-500 hover:text-blue-700",
  emptyCell: "text-center text-secondary-text py-8"
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

    const { toggleBetDetail } = usePopupStore();
    const { updateBetDetail } = useBetDetailStore();

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

    // Show loading spinner for initial load
    if (isLoading && displayedBetLogs.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className={`${styles['bet-history-container']} rounded bg-white dark:bg-primary-bg p-2`}>
            <div
                className={`bet-history-scroll-wrapper ${styles['table-scroll-wrapper']} ${isExpanded ? styles.expanded : ''}`}
            >
                <Table className="bet-history-table">
                    <TableHeader>
                        <TableRow className={commonStyles.headerRow}>
                            <TableHead className={commonStyles.headerCell}>
                                {translateCommon("time")}
                            </TableHead>
                            <TableHead className={commonStyles.headerCell}>
                                {translateCommon("round").capitalizeFirstLetter()}
                            </TableHead>
                            <TableHead className={commonStyles.headerCell}>
                                {translateCommon("total_stake")}
                            </TableHead>
                            <TableHead className={commonStyles.headerCell}>
                                {translateCommon("win")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className={commonStyles.emptyCell}>
                                    {translateCommon("no_data")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            tableData.map((row, rowIndex) => (
                                <TableRow key={rowIndex} className={commonStyles.dataRow}>
                                    <TableCell className={commonStyles.dataCell}>
                                        <div style={{ whiteSpace: 'pre-line' }}>
                                            {row.time}
                                        </div>
                                    </TableCell>
                                    <TableCell 
                                        className={commonStyles.roundCell}
                                        onClick={() => handleCellClick('round', row, rowIndex)}
                                    >
                                        <span className={commonStyles.roundSpan}>
                                            {row.round}
                                        </span>
                                    </TableCell>
                                    <TableCell className={commonStyles.dataCell}>
                                        {row.betAmount}
                                    </TableCell>
                                    <TableCell className={commonStyles.dataCell}>
                                        <div className={getWinValueColorClass(row.win)}>
                                            {row.win}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
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
                className={styles['toggle-button']}
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
