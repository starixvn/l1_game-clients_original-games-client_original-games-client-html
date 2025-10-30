import { BetWinCalculator, BetWinCalculatorRegistry } from '@shared/helpers/bet-history/bet-history-calculator';
import { BetLog } from '@shared/stores/bet-history-store/bet-history-slice';

/**
 * Baccarat-specific bet log interface
 */
export interface BaccaratBetLog extends BetLog {
    player: number;
    banker: number;
    tie: number;
    anyPair: number;
}


/**
 * Baccarat-specific bet win calculator (for real-time calculations)
 */
export class BaccaratBetWinCalculator implements BetWinCalculator {
    getGameId(): string {
        return "150";
    }

    calculateBetWin(pendingDetails: any[], resultData: {result: any, settlementResult: any, odds: Record<string, number>}): number {
        let betwin = 0;

        // Special handling for baccarat tie wins
        const isTieWin = resultData.settlementResult?.tie === true;

        for (const detail of pendingDetails) {
            const didWin = !!resultData.settlementResult[detail.choice];
            const betOdds = Number(resultData.odds?.[detail.choice] ?? 0);

            if (didWin && betOdds > 0) {
                // Winning bets get their payout
                betwin += detail.amount * betOdds;
            } else if (isTieWin && (detail.choice === 'player' || detail.choice === 'banker')) {
                // In baccarat tie wins, losing player/banker bets are returned
                betwin += detail.amount;
            }
            // Other losing bets get nothing (as expected)
        }

        return betwin;
    }
}

// Register the baccarat calculator
BetWinCalculatorRegistry.registerCalculator(new BaccaratBetWinCalculator());
