import { useEffect, useRef, useState } from 'react';
import { useGameContext } from '../react-contexts';
import useBetHistoryStore from '../stores/bet-history-store/bet-history-store';
import { BetHistoryHandler } from '@shared/components/game-base/handlers/bet-history-handler';
import { useShallow } from 'zustand/react/shallow';

/**
 * Custom hook for managing bet history functionality
 * Provides a clean interface for components to interact with bet history
 */
export function useBetHistory() {
    const { gameMessageHandler } = useGameContext();
    const [betHistoryHandler, setBetHistoryHandler] = useState<BetHistoryHandler | null>(null);
    const isInitialized = useRef(false);

    // Store state selectors
    const {
        betLogs,
        currentPage,
        totalPages,
        isLoading,
        isExpanded,
        hasMoreData,
        getDisplayedBetLogs,
        getWinValue,
    } = useBetHistoryStore(useShallow((state) => ({
        betLogs: state.betLogs,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        isLoading: state.isLoading,
        isExpanded: state.isExpanded,
        hasMoreData: state.hasMoreData,
        getDisplayedBetLogs: state.getDisplayedBetLogs,
        getWinValue: state.getWinValue,
    })));

    // Initialize bet history handler
    useEffect(() => {
        if (!isInitialized.current && gameMessageHandler) {
            const handler = new BetHistoryHandler({ gameMessageHandler });
            setBetHistoryHandler(handler);
            isInitialized.current = true;

            return () => {
                handler.cleanup();
            };
        }
        return undefined;
    }, [gameMessageHandler]);

    // Action functions
    const requestHistory = (page = 1) => {
        betHistoryHandler?.requestHistory(page);
    };

    const loadNextPage = () => {
        betHistoryHandler?.loadNextPage();
    };

    const toggleExpanded = () => {
        betHistoryHandler?.toggleExpanded();
    };

    const resetHistory = () => {
        betHistoryHandler?.resetHistory();
    };

    const scrollToTop = () => {
        betHistoryHandler?.scrollToTop();
    };

    // Computed values
    const displayedBetLogs = getDisplayedBetLogs();
    const hasMultiplePages = totalPages > 1;
    const canLoadMore = hasMoreData && currentPage < totalPages;

    return {
        // State
        betLogs,
        displayedBetLogs,
        currentPage,
        totalPages,
        isLoading,
        isExpanded,
        hasMoreData,
        hasMultiplePages,
        canLoadMore,

        // Actions
        requestHistory,
        loadNextPage,
        toggleExpanded,
        resetHistory,
        scrollToTop,

        // Utilities
        getWinValue,

        // Handler reference (for advanced usage)
        betHistoryHandler,
    };
}

/**
 * Hook for bet history state only (no actions)
 * Useful for components that only need to display data
 */
export function useBetHistoryState() {
    const {
        betLogs,
        currentPage,
        totalPages,
        isLoading,
        isExpanded,
        hasMoreData,
        getDisplayedBetLogs,
        getWinValue,
    } = useBetHistoryStore(useShallow((state) => ({
        betLogs: state.betLogs,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        isLoading: state.isLoading,
        isExpanded: state.isExpanded,
        hasMoreData: state.hasMoreData,
        getDisplayedBetLogs: state.getDisplayedBetLogs,
        getWinValue: state.getWinValue,
    })));

    const displayedBetLogs = getDisplayedBetLogs();
    const hasMultiplePages = totalPages > 1;
    const canLoadMore = hasMoreData && currentPage < totalPages;

    return {
        betLogs,
        displayedBetLogs,
        currentPage,
        totalPages,
        isLoading,
        isExpanded,
        hasMoreData,
        hasMultiplePages,
        canLoadMore,
        getWinValue,
    };
}
