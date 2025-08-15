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
    
    setBetLogs: (logs) => set({ betLogs: logs }),
    
    appendBetLogs: (logs) => {
        const currentState = get();
        const existingLogs = currentState.betLogs;
        
        // Filter out duplicates based on roundId/phien
        const newLogs = logs.filter(
            newLog => !existingLogs.some(
                existing => (existing.roundId || existing.phien) === (newLog.roundId || newLog.phien)
            )
        );
        
        set({ betLogs: [...existingLogs, ...newLogs] });
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
                    // First page - replace data
                    state.setBetLogs(history.betLogs);
                } else {
                    // Additional pages - append data
                    state.appendBetLogs(history.betLogs);
                }
                state.setHasMoreData(state.betLogs.length < total);
            } else {
                state.setHasMoreData(false);
            }
        }
    },
});
