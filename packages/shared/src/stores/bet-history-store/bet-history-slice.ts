import { StateCreator } from "zustand";

export interface BetLog {
    freeBet: boolean;
    roundId: number;
    appType: number;
    betwin: number;
    clientSeed: string;
    even: number;
    name: string;
    odd: number;
    odds: Record<string, number>;
    rate: number;
    red2: number;
    red3: number;
    red4: number;
    time: string;
    totalAmount: number;
    white3: number;
    white4: number;
    phien: number;
    result: any;
    settlementResult: any;
    betLogDetails: Array<{
        freeBet: boolean;
        amount: number;
        appType: number;
        time: string;
        choice: string;
    }>;
}

export interface BetHistoryData {
    betLogs: BetLog[];
    page: number;
    pageSize: number;
    total: number;
}

export interface BetHistorySlice {
    // State
    betLogs: BetLog[];
    currentPage: number;
    totalPages: number;
    serverTotalPages: number; // Server-provided total pages (independent of local pagination)
    isLoading: boolean;
    isExpanded: boolean;
    hasMoreData: boolean;

    // Pending bet tracking (persists across refreshes)
    pendingBetDetails: Array<{ time: string; amount: number; choice: string; clientSeed: string }>;
    pendingBetRoundId: number | null;
    pendingFirstBetTime: string | null;

    // Actions
    setBetLogs: (logs: BetLog[]) => void;
    appendBetLogs: (logs: BetLog[], options?: { updatePagination?: boolean; source?: string }) => void;
    setCurrentPage: (page: number) => void;
    setTotalPages: (totalPages: number) => void;
    setServerTotalPages: (serverTotalPages: number) => void;
    setIsLoading: (loading: boolean) => void;
    setIsExpanded: (expanded: boolean) => void;
    setHasMoreData: (hasMore: boolean) => void;
    resetBetHistory: () => void;

    // Pending bet actions
    addPendingBet: (bet: { time: string; amount: number; choice: string; clientSeed: string }) => void;
    setPendingBetRoundId: (roundId: number) => void;
    setPendingFirstBetTime: (time: string) => void;
    clearPendingBets: () => void;
    hasPendingBets: () => boolean;

    // Computed getters
    getDisplayedBetLogs: () => BetLog[];
    getWinValue: (betLog: BetLog) => number;

    // Event handlers
    registerBetHistoryEvent: (message: any) => void;
}

const INITIAL_STATE = {
    betLogs: [],
    currentPage: 1,
    totalPages: 1,
    serverTotalPages: 1,
    isLoading: false,
    isExpanded: false,
    hasMoreData: true,
    pendingBetDetails: [],
    pendingBetRoundId: null,
    pendingFirstBetTime: null,
};

export const createBetHistorySlice: StateCreator<BetHistorySlice> = (set, get) => ({
    ...INITIAL_STATE,

    setBetLogs: (logs) => set({ betLogs: sortByRoundDesc(logs) }),

    appendBetLogs: (logs, options = {}) => {
        const currentState = get();
        const existingLogs = currentState.betLogs;
        const { updatePagination = true } = options;

        const existingKeys = new Set(existingLogs.map((log) => getRoundKey(log)));
        const newLogs = logs.filter((newLog) => !existingKeys.has(getRoundKey(newLog)));

        if (newLogs.length > 0) {
            const updatedLogs = sortByRoundDesc([...existingLogs, ...newLogs]);
            const updateObj: any = { betLogs: updatedLogs };

            if (updatePagination) {
                const newTotalPages = Math.ceil(updatedLogs.length / 10);
                const hasMoreData = updatedLogs.length > 10 && currentState.currentPage < newTotalPages;
                updateObj.totalPages = newTotalPages;
                updateObj.hasMoreData = hasMoreData;
            }

            set(updateObj);
        }
    },

    setCurrentPage: (page) => set({ currentPage: page }),

    setTotalPages: (totalPages) => set({ totalPages }),

    setServerTotalPages: (serverTotalPages) => set({ serverTotalPages }),

    setIsLoading: (loading) => set({ isLoading: loading }),

    setIsExpanded: (expanded) => set({ isExpanded: expanded }),

    setHasMoreData: (hasMore) => set({ hasMoreData: hasMore }),

    resetBetHistory: () => set(INITIAL_STATE),

    addPendingBet: (bet) => {
        const state = get();
        const newBets = [...state.pendingBetDetails, bet];
        set({ pendingBetDetails: newBets });
    },

    setPendingBetRoundId: (roundId) => set({ pendingBetRoundId: roundId }),

    setPendingFirstBetTime: (time) => set({ pendingFirstBetTime: time }),

    clearPendingBets: () => set({
        pendingBetDetails: [],
        pendingBetRoundId: null,
        pendingFirstBetTime: null
    }),

    hasPendingBets: () => {
        const state = get();
        return state.pendingBetDetails.length > 0 && state.pendingBetRoundId !== null;
    },

    getDisplayedBetLogs: () => {
        const state = get();
        const { betLogs, isExpanded } = state;

        if (isExpanded) {
            return betLogs;
        } else {
            // Show only first 10 records when collapsed
            return betLogs.slice(0, 10);
        }
    },

    getWinValue: (betLog: BetLog) => {
        // Win value = betWin - total bet amount (net profit/loss)
        return betLog.betwin - betLog.totalAmount;
    },

    registerBetHistoryEvent: (message) => {
        if (message.history) {
            const { history } = message;
            const state = get();

            const total = history.total || 0;
            const pageSize = history.pageSize || 10;
            const calculatedTotalPages = Math.ceil(total / pageSize);

            state.setTotalPages(calculatedTotalPages);
            state.setServerTotalPages(calculatedTotalPages);
            state.setIsLoading(false);

            if (history.betLogs?.length > 0) {
                if (history.page === 1) {
                    if (state.isExpanded && state.betLogs.length > 0) {
                        const existingLogs = state.betLogs;
                        const page1Logs = history.betLogs;
                        const page1Ids = new Set(page1Logs.map((log: any) => getRoundKey(log)));
                        const merged = [...page1Logs, ...existingLogs.filter((log: any) => !page1Ids.has(getRoundKey(log)))];
                        state.setBetLogs(sortByRoundDesc(merged));
                    } else {
                        state.setBetLogs(sortByRoundDesc(history.betLogs));
                    }
                } else {
                    state.appendBetLogs(sortByRoundDesc(history.betLogs), {
                        updatePagination: false,
                        source: "server_page"
                    });
                }

                const serverExpectedCount = (history.page * pageSize);
                const hasMoreData = serverExpectedCount < total;
                state.setHasMoreData(hasMoreData);
            } else {
                state.setHasMoreData(false);
            }
        }
    },
});

// Helpers
function toNumeric(value: any): number {
    if (value == null) {
        return 0;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
}

function getRoundKey(log: any): number {
    // Prefer roundId, then phien as numeric
    return toNumeric(log?.roundId ?? log?.phien);
}

function sortByRoundDesc(logs: any[]): any[] {
    return [...(logs || [])].sort((a, b) => getRoundKey(b) - getRoundKey(a));
}
