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
    drawId?: number;
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
    isLoading: boolean;
    isExpanded: boolean;
    hasMoreData: boolean;
    
    // Actions
    setBetLogs: (logs: BetLog[]) => void;
    appendBetLogs: (logs: BetLog[]) => void;
    setCurrentPage: (page: number) => void;
    setTotalPages: (totalPages: number) => void;
    setIsLoading: (loading: boolean) => void;
    setIsExpanded: (expanded: boolean) => void;
    setHasMoreData: (hasMore: boolean) => void;
    resetBetHistory: () => void;
    
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
    isLoading: false,
    isExpanded: false,
    hasMoreData: true,
};

export const createBetHistorySlice: StateCreator<BetHistorySlice> = (set, get) => ({
    ...INITIAL_STATE,
    
    setBetLogs: (logs) => set({ betLogs: sortByRoundDesc(logs) }),
    
    appendBetLogs: (logs) => {
        const currentState = get();
        const existingLogs = currentState.betLogs;
        
        // Build a set of existing round keys (consider roundId, phien, drawId)
        const existingKeys = new Set(existingLogs.map((log) => getRoundKey(log)));
        const newLogs = logs.filter((newLog) => !existingKeys.has(getRoundKey(newLog)));
        
        set({ betLogs: sortByRoundDesc([...existingLogs, ...newLogs]) });
    },
    
    setCurrentPage: (page) => set({ currentPage: page }),
    
    setTotalPages: (totalPages) => set({ totalPages }),
    
    setIsLoading: (loading) => set({ isLoading: loading }),
    
    setIsExpanded: (expanded) => set({ isExpanded: expanded }),
    
    setHasMoreData: (hasMore) => set({ hasMoreData: hasMore }),
    
    resetBetHistory: () => set(INITIAL_STATE),
    
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
            
            // Calculate total pages
            const total = history.total || 0;
            const pageSize = history.pageSize || 10;
            const calculatedTotalPages = Math.ceil(total / pageSize);
            
            state.setTotalPages(calculatedTotalPages);
            state.setIsLoading(false);
            
            if (history.betLogs?.length > 0) {
                if (history.page === 1) {
                    // First page
                    if (state.isExpanded && state.betLogs.length > 0) {
                        // Keep expanded view populated: merge page 1 into the top of existing logs
                        const existingLogs = state.betLogs;
                        const page1Logs = history.betLogs;
                        const page1Ids = new Set(page1Logs.map((log: any) => getRoundKey(log)));
                        const merged = [...page1Logs, ...existingLogs.filter((log: any) => !page1Ids.has(getRoundKey(log)))];
                        state.setBetLogs(sortByRoundDesc(merged));
                    } else {
                        // Collapsed or initial load: replace with page 1
                        state.setBetLogs(sortByRoundDesc(history.betLogs));
                    }
                } else {
                    // Additional pages - append data
                    state.appendBetLogs(sortByRoundDesc(history.betLogs));
                }
                state.setHasMoreData(state.betLogs.length < total);
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
    // Prefer roundId, then phien, then drawId as numeric
    return toNumeric(log?.roundId ?? log?.phien ?? log?.drawId);
}

function sortByRoundDesc(logs: any[]): any[] {
    return [...(logs || [])].sort((a, b) => getRoundKey(b) - getRoundKey(a));
}
