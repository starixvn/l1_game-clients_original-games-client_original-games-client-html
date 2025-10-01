import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { useGameContext } from "@shared/react-contexts";
import { LoadingSpinner } from "../game-loading/loading-spinner";
import { useCommonTranslate, useClickSound } from "@shared/react-hooks";
import useBetHistoryStore from "@shared/stores/bet-history-store/bet-history-store";
import usePopupStore from "@shared/stores/popup-store/popup-store";
import { BetHistoryHandler } from "../../game-base/handlers/bet-history-handler";
import { transformBetLogsToDisplayData, getWinValueColorClass, scrollBetHistoryToTop, BetHistoryDisplayData } from "./bet-history-utils";
import styles from "./bet-history.module.scss";
import useBetDetailStore from "@shared/stores/bet-detail-store";
import { cn } from "@shared/utils/merge-tailwind-util";
import BouncingDotsLoader from "./bouncing-dots-loader";

// Function to create row data for bet history table
const createBetHistoryRowData = (
    row: BetHistoryDisplayData,
    rowIndex: number,
    handleCellClick: (columnKey: string, row: BetHistoryDisplayData, index: number) => void,
    getWinValueColorClass: (win: string) => string
) => {
    return [
        {
            content: <div style={{ whiteSpace: "pre-line" }}>{row.time}</div>,
        },
        {
            content: <span className="text-table-text-clickable cursor-pointer">{row.round}</span>,
            className: "text-table-text-clickable cursor-pointer",
            onClick: () => handleCellClick("round", row, rowIndex),
        },
        {
            content: row.betAmount,
        },
        {
            content: <div className={getWinValueColorClass(row.win)}>{row.win}</div>,
            className: "text-right",
        },
    ];
};

// Function to render bet history table rows
const renderBetHistoryRows = (
    tableData: any[],
    handleCellClick: (columnKey: string, row: BetHistoryDisplayData, index: number) => void,
    getWinValueColorClass: (win: string) => string
) => {
    return tableData.map((row, rowIndex) => {
        const rowData = createBetHistoryRowData(row, rowIndex, handleCellClick, getWinValueColorClass);

        return (
            <TableRow
                key={rowIndex}
                className={cn("border-none text-center", rowIndex % 2 === 0 ? "bg-bet-history-row-1" : "bg-bet-history-row-2")}
            >
                {rowData.map((cell, cellIndex) => (
                    <TableCell
                        key={cellIndex}
                        className={cn("text-secondary-text h-[60px] py-2 px-2 md:text-base", cell.className)}
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
        <TableRow className="bg-table-header border-none h-[36px]">
            {headerColumns.map((column, index) => (
                <TableHead
                    key={column.key}
                    className={cn(
                        "text-primary-text p-2 lg:p-3 h-full font-semibold text-sm md:text-base",
                        column.align === "right" ? "text-right" : "text-center",
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

export const BetHistoryTable = ({ gameId }: { gameId?: string } = {}) => {
    const { gameMessageHandler } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();

    // Store state
    const betLogs = useBetHistoryStore((state) => state.betLogs);
    const isLoading = useBetHistoryStore((state) => state.isLoading);
    const isExpanded = useBetHistoryStore((state) => state.isExpanded);
    const totalPages = useBetHistoryStore((state) => state.totalPages);

    const toggleBetDetail = usePopupStore((state) => state.toggleBetDetail);
    const updateBetDetail = useBetDetailStore((state) => state.updateBetDetail);

    // Local state
    const [betHistoryHandler, setBetHistoryHandler] = useState<BetHistoryHandler | null>(null);
    const [dynamicMaxHeight, setDynamicMaxHeight] = useState<string>("640px");
    const isInitialized = useRef(false);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    useEffect(() => {
        if (!isInitialized.current && gameMessageHandler) {
            const handler = new BetHistoryHandler({ gameMessageHandler, gameId });
            setBetHistoryHandler(handler);
            handler.requestHistory(1);
            isInitialized.current = true;

            return () => {
                handler.cleanup();
            };
        }
        return () => {};
    }, [gameMessageHandler, gameId]);

    // Handle cell click for round column
    const handleCellClick = (columnKey: string, row: BetHistoryDisplayData, index: number) => {
        if (columnKey === "round") {
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
                        editedMergeClientSeed: "",
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

    // Calculate dynamic max height based on CSS breakpoints and row count
    const calculateDynamicMaxHeight = useCallback(() => {
        const minHeight = 300;
        const rowCount = Math.min(displayedBetLogs.length, 10);

        if (rowCount === 0) {
            return `${minHeight}px`;
        }

        // This matches the h-[60px] class used in table cells
        const baseRowHeight = 60;
        const buffer = 1;
        const calculatedHeight = baseRowHeight * rowCount + buffer;

        return `${Math.max(calculatedHeight, minHeight)}px`;
    }, [displayedBetLogs.length]);

    // Update dynamic max height when data changes
    useLayoutEffect(() => {
        const newHeight = calculateDynamicMaxHeight();
        setDynamicMaxHeight(newHeight);
    }, [displayedBetLogs, calculateDynamicMaxHeight]);

    // Handle toggle expand/collapse
    const handleToggleExpand = () => {
        if (!betHistoryHandler) {
            return;
        }

        const wasExpanded = isExpanded;
        betHistoryHandler.toggleExpanded();
        clickSound();

        // Scroll to top when collapsing
        if (wasExpanded) {
            setTimeout(scrollBetHistoryToTop, 100);
        }
    };

    // Define header columns configuration
    const headerColumns = [
        { key: "time", label: translateCommon("time").capitalizeFirstLetter() },
        { key: "round", label: translateCommon("round").capitalizeFirstLetter() },
        { key: "total_stake", label: translateCommon("bet_amount").capitalizeFirstLetter() },
        { key: "win", label: translateCommon("win").capitalizeFirstLetter(), align: "right" },
    ];

    return (
            <>
                {/* Sticky Header Table */}
            <Table className="bet-history-table sticky top-[50px] lg:static lg:top-0">
                <TableHeader>{renderBetHistoryHeader(headerColumns)}</TableHeader>
            </Table>

            {/* Scrollable Body */}
            <div
                key={isExpanded ? "expanded" : "collapsed"}
                className={`bet-history-scroll-wrapper min-h-[300px] ${styles["table-scroll-wrapper"]} ${
                    isExpanded ? styles.expanded : ""
                }`}
                style={{ maxHeight: dynamicMaxHeight }}
            >
                <Table className="bet-history-table">
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
        </>
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
        <div className={`${styles["toggle-button-container"]}`}>
            {isLoading ? (
                <BouncingDotsLoader />
            ) : (
                <button
                    className={`${styles["toggle-button"]} rounded-lg text-sm md:text-base`}
                    onClick={handleToggleExpand}
                    disabled={isLoading}
                >
                    {isExpanded ? t("show_less") : t("show_more")}
                </button>
            )}
        </div>
    );
}
