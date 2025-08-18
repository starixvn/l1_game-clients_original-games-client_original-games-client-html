import useGameStore from "../../../_shared/stores/game-store/game-store";
import { GameMessageHandler, messageEventType } from "./game-message-handler";

export type BetHistoryHandlerProps = {
    gameMessageHandler: GameMessageHandler;
};

export class BetHistoryHandler {
    private readonly GET_HISTORY = "getHistory";
    private readonly HISTORY_EVENT = "history";
    private handlerId: string | null = null;

    constructor(private readonly props: BetHistoryHandlerProps) {
        this.registerHistoryEvents();
    }

    private registerHistoryEvents() {
        this.handlerId = this.props.gameMessageHandler.register(
            this.HISTORY_EVENT,
            this.handleHistoryResponse.bind(this)
        );
    }

    private handleHistoryResponse(data: any) {
        const store = useGameStore.getState();
        store.registerBetHistoryEvent(data);
    }

    requestHistory(page = 1) {
        const store = useGameStore.getState();

        // Set loading state
        store.setIsLoading(true);
        store.setCurrentPage(page);

        // Send socket message to request history
        this.props.gameMessageHandler.broadcastGameEvent({
            [messageEventType.SEND_SOCKET_MESSAGE]: {
                event: this.GET_HISTORY,
                data: { page }
            }
        });
    }

    loadNextPage() {
        const store = useGameStore.getState();
        const nextPage = store.currentPage + 1;

        if (nextPage <= store.totalPages && store.hasMoreData) {
            this.requestHistory(nextPage);
        }
    }

    loadAllRemainingPages() {
        const store = useGameStore.getState();
        const { currentPage, totalPages } = store;

        // Load all remaining pages efficiently
        for (let page = currentPage + 1; page <= totalPages; page++) {
            this.requestHistory(page);
        }
    }

    toggleExpanded() {
        const store = useGameStore.getState();
        const newExpandedState = !store.isExpanded;

        store.setIsExpanded(newExpandedState);

        // If expanding and we don't have all data, load remaining pages
        if (newExpandedState && store.hasMoreData && store.currentPage < store.totalPages) {
            this.loadAllRemainingPages();
        }
    }

    scrollToTop() {
        // Utility function to scroll table to top when collapsing
        const scrollWrapper = document.querySelector('.bet-history-scroll-wrapper');
        if (scrollWrapper) {
            scrollWrapper.scrollTop = 0;
        }
    }

    resetHistory() {
        const store = useGameStore.getState();
        store.resetBetHistory();
    }

    cleanup() {
        if (this.handlerId) {
            this.props.gameMessageHandler.removeHandler(this.handlerId);
            this.handlerId = null;
        }
    }

    // Utility methods for getting computed values
    getDisplayedBetLogs() {
        const store = useGameStore.getState();
        return store.getDisplayedBetLogs();
    }

    getWinValue(betLog: any) {
        const store = useGameStore.getState();
        return store.getWinValue(betLog);
    }

    isLoading() {
        const store = useGameStore.getState();
        return store.isLoading;
    }

    isExpanded() {
        const store = useGameStore.getState();
        return store.isExpanded;
    }

    hasMultiplePages() {
        const store = useGameStore.getState();
        return store.totalPages > 1;
    }
}
