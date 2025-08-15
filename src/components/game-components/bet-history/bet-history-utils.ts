import { numberWithCommas, separateDateTime } from "../../../_shared/helpers";
import { BetLog } from "../../../_shared/stores/game-store/bet-history-slice";

export interface BetHistoryDisplayData {
    time: string;
    round: string;
    betAmount: string;
    win: string;
    originalBetLog: BetLog;
}

/**
 * Transforms raw bet log data into display format
 */
export function transformBetLogToDisplayData(betLog: BetLog): BetHistoryDisplayData {
    const { date, time } = separateDateTime(betLog.time);
    const roundId = getRoundId(betLog);
    const betAmount = betLog.totalAmount || 0;
    const winAmount = betLog.betwin || 0;
    const totalWin = calculateNetWin(betAmount, winAmount);
    
    return {
        time: formatDateTime(date, time),
        round: String(roundId),
        betAmount: numberWithCommas(betAmount),
        win: formatWinValue(totalWin),
        originalBetLog: betLog,
    };
}

/**
 * Gets the round ID from various possible fields
 */
export function getRoundId(betLog: BetLog): number {
    return betLog?.drawId ?? betLog?.roundId ?? betLog?.phien ?? 0;
}

/**
 * Calculates net win/loss (betwin - totalAmount)
 */
export function calculateNetWin(betAmount: number, winAmount: number): number {
    return winAmount - betAmount;
}

/**
 * Formats date and time for display
 */
export function formatDateTime(date: string, time: string): string {
    return `${date} ${time}`;
}

/**
 * Formats win value with proper sign and formatting
 */
export function formatWinValue(totalWin: number): string {
    const prefix = totalWin >= 0 ? '+' : '';
    return prefix + numberWithCommas(totalWin);
}

/**
 * Gets the appropriate CSS class for win value coloring
 */
export function getWinValueColorClass(winValue: string): string {
    const numericValue = parseFloat(winValue.replace(/[+,]/g, ''));
    
    if (numericValue > 0) {
        return "text-yellow-300";
    }
    return "";
}

/**
 * Transforms an array of bet logs to display data
 */
export function transformBetLogsToDisplayData(betLogs: BetLog[]): BetHistoryDisplayData[] {
    return betLogs.map(transformBetLogToDisplayData);
}

/**
 * Checks if a bet log entry is valid and should be displayed
 */
export function isValidBetLogEntry(betLog: BetLog): boolean {
    return !!(betLog && (betLog.roundId || betLog.phien || betLog.drawId) && betLog.time);
}

/**
 * Filters out invalid bet log entries
 */
export function filterValidBetLogs(betLogs: BetLog[]): BetLog[] {
    return betLogs.filter(isValidBetLogEntry);
}

/**
 * Scrolls the bet history table to the top
 */
export function scrollBetHistoryToTop(): void {
    const scrollWrapper = document.querySelector('.bet-history-scroll-wrapper');
    if (scrollWrapper) {
        scrollWrapper.scrollTop = 0;
    }
}

/**
 * Gets the scroll position of the bet history table
 */
export function getBetHistoryScrollPosition(): number {
    const scrollWrapper = document.querySelector('.bet-history-scroll-wrapper');
    return scrollWrapper?.scrollTop ?? 0;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}
