import React from "react";
import { BetHistoryTable } from "@shared/components/game-components/bet-history/bet-history-table";
import { BetHistoryHandler } from "@shared/components/game-base/handlers/bet-history-handler";
import BouncingDotsLoader from "@shared/components/game-components/bet-history/bouncing-dots-loader";
import useBetHistoryStore from "@shared/stores/bet-history-store/bet-history-store";

// Plinko-specific display logic (like bet detail pattern)
const getPlinkoDisplayedBetLogs = (handler: BetHistoryHandler | null, betLogs: any[], isExpanded: boolean) => {
    // Use handler's rolling window logic if available, otherwise fallback
    if (handler) {
        return handler.getDisplayedBetLogs();
    }
    return isExpanded ? betLogs : betLogs.slice(0, 10);
};

// Custom render function for Plinko toggle buttons
const renderPlinkoToggleButtons = (
    totalPages: number,
    isExpanded: boolean,
    isLoading: boolean,
    handleToggle: () => void,
    styles: any,
    t: any,
    handler?: any,
    storeState?: { totalRecords: number; serverTotalPages: number; isExpanded: boolean }
) => {
    // Use passed store state or fallback to direct access
    const totalRecords = storeState?.totalRecords || 0;
    const serverTotalPages = storeState?.serverTotalPages || 0;

    // Calculate if all pages are loaded
    const expandedPages = handler?.getExpandedLoadedPages?.()?.size || 0;
    const totalLoadedPages = expandedPages; // expandedLoadedPages already includes page 1

    // Get the highest loaded page to check if we've reached the end
    const expandedLoadedPagesSet = handler?.getExpandedLoadedPages?.();
    const expandedLoadedPagesArray = expandedLoadedPagesSet ? Array.from(expandedLoadedPagesSet) as number[] : [];
    const highestLoadedPage = expandedLoadedPagesArray.length > 0 ? Math.max(...expandedLoadedPagesArray) : 0;

    // Consider all pages loaded if either:
    // 1. We have tracked all pages as loaded during expansion, OR
    // 2. We have all the expected records (for existing users with pre-loaded data), OR
    // 3. We've reached or exceeded the last page number
    const expectedTotalRecords = serverTotalPages * 10;
    const hasLoadedAllPages = totalLoadedPages >= serverTotalPages ||
                             (serverTotalPages > 0 && totalRecords >= expectedTotalRecords) ||
                             (serverTotalPages > 0 && highestLoadedPage >= serverTotalPages);

    const effectiveTotalPages = Math.max(serverTotalPages, totalRecords > 0 ? 1 : 0);
    const effectiveTotalRecords = serverTotalPages > 0 ? (serverTotalPages * 10) : totalRecords;

    if (effectiveTotalRecords <= 10 && serverTotalPages <= 1) {
        return null;
    }

    const handleExpand = () => {
        const scrollWrapper = document.querySelector('.bet-history-scroll-wrapper') as HTMLElement;
        const currentScrollTop = scrollWrapper?.scrollTop || 0;

        if (handler && handler.expand) {
            handler.expand();
        } else {
            handleToggle();
        }

        setTimeout(() => {
            const newScrollWrapper = document.querySelector('.bet-history-scroll-wrapper') as HTMLElement;
            if (newScrollWrapper && currentScrollTop > 0) {
                newScrollWrapper.scrollTop = currentScrollTop;
            }
        }, 0);
    };

    const handleCollapse = () => {
        if (handler && handler.collapse) {
            handler.collapse();
        } else {
            const betHistoryStore = useBetHistoryStore.getState();
            betHistoryStore.setIsExpanded(false);
            if (handler && handler.resetLoadedPages) {
                handler.resetLoadedPages();
            }
        }

        setTimeout(() => {
            const scrollWrapper = document.querySelector('.bet-history-scroll-wrapper') as HTMLElement;
            if (scrollWrapper) {
                scrollWrapper.scrollTop = 0;
            }
        }, 0);
    };

    const showMoreButton = (!isExpanded && effectiveTotalRecords > 10) ||
                          (isExpanded && !hasLoadedAllPages && serverTotalPages > 1);
    const showLessButton = isExpanded;

    return (
        <div className={`${styles["toggle-button-container"]}`}>
            {isLoading ? (
                <BouncingDotsLoader />
            ) : (
                <div className="flex gap-2">
                    {showMoreButton && (
                        <button
                            className={`${styles["toggle-button"]} rounded-lg text-sm md:text-base`}
                            onClick={handleExpand}
                            disabled={isLoading}
                        >
                            {t("show_more")}
                        </button>
                    )}
                    {showLessButton && (
                        <button
                            className={`${styles["toggle-button"]} rounded-lg text-sm md:text-base`}
                            onClick={handleCollapse}
                            disabled={isLoading}
                        >
                            {t("show_less")}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const PlinkoBetHistoryTable = ({ gameId }: { gameId?: string } = {}) => {
    // Access store state at component level so it updates reactively
    const totalRecords = useBetHistoryStore((state) => state.betLogs.length);
    const serverTotalPages = useBetHistoryStore((state) => state.serverTotalPages);
    const isExpanded = useBetHistoryStore((state) => state.isExpanded);

    // Create wrapper that passes store state to render function
    const renderPlinkoToggleButtonsWithState = (
        totalPages: number,
        isExpandedFromProps: boolean,
        isLoading: boolean,
        handleToggle: () => void,
        styles: any,
        t: any,
        handler?: any
    ) => {
        return renderPlinkoToggleButtons(
            totalPages,
            isExpandedFromProps,
            isLoading,
            handleToggle,
            styles,
            t,
            handler,
            { totalRecords, serverTotalPages, isExpanded } // Pass store state
        );
    };

    return (
        <BetHistoryTable
            gameId={gameId}
            getDisplayedBetLogs={getPlinkoDisplayedBetLogs}
            renderToggleButton={renderPlinkoToggleButtonsWithState}
        />
    );
};

export default PlinkoBetHistoryTable;
