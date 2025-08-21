import useGameStore from "../../../_shared/stores/game-store/game-store";
import { GameMessageHandler, messageEventType } from "./game-message-handler";
import { RoundState } from "../type";

export type BetHistoryHandlerProps = {
    gameMessageHandler: GameMessageHandler;
};

export class BetHistoryHandler {
    private readonly GET_HISTORY = "getHistory";
    private readonly HISTORY_EVENT = "history";
    private handlerIds: string[] = [];
    private lastRoundState: RoundState | null = null;

    constructor(private readonly props: BetHistoryHandlerProps) {
        this.registerHistoryEvents();
    }

    private registerHistoryEvents() {
        const historyHandlerId = this.props.gameMessageHandler.register(
            this.HISTORY_EVENT,
            this.handleHistoryResponse.bind(this)
        );
        this.handlerIds.push(historyHandlerId);

        // Listen to round state changes to refresh history at the start of each round
        const roundStateHandlerId = this.props.gameMessageHandler.register(
            messageEventType.ROUND_STATE,
            this.handleRoundState.bind(this)
        );
        this.handlerIds.push(roundStateHandlerId);
    }

    private handleHistoryResponse(data: any) {
        // First, persist incoming history to the store
        useGameStore.getState().registerBetHistoryEvent(data);

        // Then, decide whether to auto-load all remaining pages
        const history = data?.history;
        if (history?.page === 1) {
            const state = useGameStore.getState();
            const isExpanded = state.isExpanded;
            const hasMore = state.hasMoreData && state.currentPage <= 1 && state.currentPage < state.totalPages;

            // If expanded at round start and more data exists, fetch all remaining pages
            if (isExpanded && hasMore) {
                this.loadAllRemainingPages();
            }
        }
    }

    private handleRoundState({ roundState }: { roundState: RoundState }) {
        // Trigger when transitioning into InRound from any other state
        const isEnteringInRound = roundState === RoundState.InRound && this.lastRoundState !== RoundState.InRound;
        if (isEnteringInRound) {
            this.requestHistory(1);
        }

        this.lastRoundState = roundState;
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
        this.handlerIds.forEach((id) => this.props.gameMessageHandler.removeHandler(id));
        this.handlerIds = [];
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
