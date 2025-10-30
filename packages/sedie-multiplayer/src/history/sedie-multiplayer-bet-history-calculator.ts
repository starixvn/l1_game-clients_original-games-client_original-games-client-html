import { BetWinCalculator, BetWinCalculatorRegistry } from '@shared/helpers/bet-history/bet-history-calculator';
import { BetLog } from '@shared/stores/bet-history-store/bet-history-slice';

/**
 * Se Die-specific bet log interface
 */
export interface SeDieBetLog extends BetLog {
    even: number;
    odd: number;
    red2: number;
    red3: number;
    red4: number;
    white3: number;
    white4: number;
}


/**
 * Se Die-specific bet win calculator (for real-time calculations)
 * Se Die doesn't have special rules like baccarat's tie return, so use standard calculation
 */
export class SeDieBetWinCalculator implements BetWinCalculator {
    getGameId(): string {
        return "148";
    }

    calculateBetWin(pendingDetails: any[], resultData: {result: any, settlementResult: any, odds: Record<string, number>}): number {
        let betwin = 0;
        for (const detail of pendingDetails) {
            const didWin = !!resultData.settlementResult[detail.choice];
            const betOdds = Number(resultData.odds?.[detail.choice] ?? 0);
            if (didWin && betOdds > 0) {
                betwin += detail.amount * betOdds;
            }
        }
        return betwin;
    }
}

// Register the se die calculator
BetWinCalculatorRegistry.registerCalculator(new SeDieBetWinCalculator());
