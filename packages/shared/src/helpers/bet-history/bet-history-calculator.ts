/**
 * Interface for game-specific bet win calculations (for real-time bet logs)
 */
export interface BetWinCalculator {
    /**
     * Calculate total winnings for a round based on bet details and results
     * @param pendingDetails - Array of bet details {time, amount, choice, clientSeed}
     * @param resultData - Round result data {result, settlementResult, odds}
     * @returns Total winnings amount
     */
    calculateBetWin(pendingDetails: any[], resultData: { result: any; settlementResult: any; odds: Record<string, number> }): number;

    /**
     * Get the game-specific identifier
     */
    getGameId(): string;
}

/**
 * Registry for game-specific bet win calculators
 */
export class BetWinCalculatorRegistry {
    private static readonly calculators: Map<string, BetWinCalculator> = new Map();

    /**
     * Register a calculator for a specific game
     */
    static registerCalculator(calculator: BetWinCalculator) {
        this.calculators.set(calculator.getGameId(), calculator);
    }

    /**
     * Get the calculator for a specific game
     */
    static getCalculator(gameId: string): BetWinCalculator | null {
        return this.calculators.get(gameId) || null;
    }
}

/**
 * Generic fallback calculator for games without specific implementation
 */
export class GenericBetWinCalculator implements BetWinCalculator {
    getGameId(): string {
        return "generic";
    }

    calculateBetWin(pendingDetails: any[], resultData: { result: any; settlementResult: any; odds: Record<string, number> }): number {
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

// Register the generic fallbacks
BetWinCalculatorRegistry.registerCalculator(new GenericBetWinCalculator());
