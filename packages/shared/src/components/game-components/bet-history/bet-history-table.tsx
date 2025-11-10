import { useEffect, useRef, useState, useCallback, useLayoutEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableRow } from "../table";
import { useCommonTranslate, useClickSound } from "@shared/react-hooks";
import useBetHistoryStore from "@shared/stores/bet-history-store/bet-history-store";
import styles from "./bet-history.module.scss";
import { cn } from "@shared/utils/merge-tailwind-util";
import { useGameStore } from "@shared/stores";
import BetHistoryHeader from "./bet-history-header";
import BetHistoryBodyItem from "./bet-history-body-item";
import BouncingDotsLoader from "./bouncing-dots-loader";
import { useShallow } from "zustand/react/shallow";

export const BetHistoryTable = ({ Header = BetHistoryHeader, BodyItem = BetHistoryBodyItem, pageSize = 10 }: any) => {
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();

    // Store state
    const { betLogs, totalBetLogs, isLoading, setBetLogs, setIsLoading } = useBetHistoryStore(
        useShallow((state) => ({
            betLogs: state.betLogs,
            totalBetLogs: state.totalBetLogs,
            isLoading: state.isLoading,
            setBetLogs: state.setBetLogs,
            setIsLoading: state.setIsLoading,
        }))
    );
    const socket = useGameStore((state) => state.socket);

    // Local state
    const [dynamicMaxHeight, setDynamicMaxHeight] = useState<string>("640px");
    const [page, setPage] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const isInitialized = useRef(false);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    const getHistory = useCallback(
        (page: number) => {
            socket.emit("getHistory", {
                page,
                pageSize,
            });
            setIsLoading(true);
        },
        [pageSize, socket, setIsLoading]
    );

    useEffect(() => {
        if (!isInitialized.current && socket) {
            isInitialized.current = true;
            getHistory(1);
        }
        return () => {};
    }, [socket, getHistory]);

    const showMore = useCallback(() => {
        clickSound();
        setIsExpanded(true);
        getHistory(page + 1);
    }, [page, getHistory, clickSound]);

    const showLess = useCallback(() => {
        clickSound();
        tableBodyRef.current?.scrollTo({ top: 0 });
        setIsExpanded(false);
        setBetLogs(betLogs.slice(0, pageSize));
    }, [betLogs, pageSize, setBetLogs, clickSound]);

    const displayedBetLogs = useMemo(() => {
        return betLogs.slice(0, isExpanded ? betLogs.length : pageSize);
    }, [betLogs, isExpanded, pageSize]);

    useEffect(() => {
        if (displayedBetLogs?.length) {
            setPage(Math.ceil(displayedBetLogs?.length / pageSize));
        }
    }, [pageSize, displayedBetLogs?.length]);

    // Calculate dynamic max height based on CSS breakpoints and row count
    const calculateDynamicMaxHeight = useCallback(() => {
        const minHeight = 300;
        const rowCount = Math.min(10, displayedBetLogs?.length || 0);

        // This matches the h-[60px] class used in table cells
        const baseRowHeight = 60;
        const buffer = 1;
        const calculatedHeight = baseRowHeight * rowCount + buffer;

        return `${Math.max(calculatedHeight, minHeight)}px`;
    }, [displayedBetLogs?.length]);

    // Update dynamic max height when data changes
    useLayoutEffect(() => {
        const newHeight = calculateDynamicMaxHeight();
        setDynamicMaxHeight(newHeight);
    }, [calculateDynamicMaxHeight]);

    return (
        <>
            {/* Sticky Header Table */}
            <Header />

            {/* Scrollable Body */}
            <div
                className={cn(
                    "bet-history-scroll-wrapper min-h-[300px]",
                    styles["table-scroll-wrapper"],
                    betLogs?.length > 10 && "overflow-y-auto"
                )}
                style={{ maxHeight: dynamicMaxHeight }}
                ref={tableBodyRef}
            >
                <Table className="bet-history-table table-striped table-fixed">
                    <TableBody>
                        {displayedBetLogs?.length > 0 ? (
                            displayedBetLogs.map((item, index) => <BodyItem key={index} data={item} />)
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-secondary-text">
                                    {translateCommon("no_data")}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className={`${styles["toggle-button-container"]} gap-2`}>
                {isLoading ? (
                    <BouncingDotsLoader />
                ) : (
                    <>
                        {totalBetLogs > displayedBetLogs?.length && (
                            <button
                                className={`${styles["toggle-button"]} rounded-lg text-sm md:text-base`}
                                disabled={isLoading}
                                onClick={showMore}
                            >
                                {translateCommon("show_more")}
                            </button>
                        )}
                        {displayedBetLogs?.length > pageSize && (
                            <button
                                className={`${styles["toggle-button"]} rounded-lg text-sm md:text-base`}
                                disabled={isLoading}
                                onClick={showLess}
                            >
                                {translateCommon("show_less")}
                            </button>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default BetHistoryTable;
