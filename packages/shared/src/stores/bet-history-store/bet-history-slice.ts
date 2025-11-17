import { BetLog } from "@shared/components/game-base/type";
import { StateCreator } from "zustand";

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
    totalBetLogs: number;

    // Pending bet tracking (persists across refreshes)
    pendingBetDetails: Array<{ time: string; amount: number; choice: string; gameId: string }>;
    pendingBetRoundId: number | null;
    pendingFirstBetTime: string | null;

    // Actions
    setBetLogs: (logs: BetLog[]) => void;
    appendBetLogs: (logs: BetLog[], options?: { updatePagination?: boolean; source?: string }) => void;
    setCurrentPage: (page: number) => void;
    setTotalPages: (totalPages: number) => void;
    setServerTotalPages: (serverTotalPages: number) => void;
    setIsLoading: (loading: boolean) => void;
    resetBetHistory: () => void;

    // Pending bet actions
    addPendingBet: (bet: { time: string; amount: number; choice: string; gameId: string }) => void;
    setPendingBetRoundId: (roundId: number) => void;
    setPendingFirstBetTime: (time: string) => void;
    clearPendingBets: () => void;
    hasPendingBets: () => boolean;

    // Event handlers
    registerBetHistoryEvent: (message: any) => void;
}

const INITIAL_STATE = {
    betLogs: [],
    currentPage: 1,
    totalPages: 1,
    serverTotalPages: 1,
    totalBetLogs: 0,
    isLoading: false,
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
                updateObj.totalPages = newTotalPages;
                updateObj.totalBetLogs = updatedLogs.length;
            }

            set(updateObj);
        }
    },

    setCurrentPage: (page) => set({ currentPage: page }),

    setTotalPages: (totalPages) => set({ totalPages }),

    setServerTotalPages: (serverTotalPages) => set({ serverTotalPages }),

    setIsLoading: (loading) => set({ isLoading: loading }),

    resetBetHistory: () => set(INITIAL_STATE),

    addPendingBet: (bet) => {
        const state = get();
        const newBets = [...state.pendingBetDetails, bet];
        set({ pendingBetDetails: newBets });
    },

    setPendingBetRoundId: (roundId) => set({ pendingBetRoundId: roundId }),

    setPendingFirstBetTime: (time) => set({ pendingFirstBetTime: time }),

    clearPendingBets: () =>
        set({
            pendingBetDetails: [],
            pendingBetRoundId: null,
            pendingFirstBetTime: null,
        }),

    hasPendingBets: () => {
        const state = get();
        return state.pendingBetDetails.length > 0 && state.pendingBetRoundId !== null;
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
                const normalizedBetLogs = history.betLogs.map((log: any) => ({
                    ...log,
                    betwin: log.betWin || log.betwin || 0, // Handle both betWin and betwin
                }));

                if (history.page === 1) {
                    if (state.betLogs.length > 0) {
                        const existingLogs = state.betLogs;
                        const page1Logs = normalizedBetLogs;
                        const page1Ids = new Set(page1Logs.map((log: any) => getRoundKey(log)));
                        const merged = [...page1Logs, ...existingLogs.filter((log: any) => !page1Ids.has(getRoundKey(log)))];
                        state.setBetLogs(sortByRoundDesc(merged));
                    } else {
                        state.setBetLogs(sortByRoundDesc(normalizedBetLogs));
                    }
                } else {
                    state.appendBetLogs(sortByRoundDesc(normalizedBetLogs), {
                        updatePagination: false,
                        source: "server_page",
                    });
                }
            }
            set({ totalBetLogs: total });
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
