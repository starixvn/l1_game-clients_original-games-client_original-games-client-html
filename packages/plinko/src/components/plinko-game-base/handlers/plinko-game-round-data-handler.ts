import { GameRoundDataHandler } from "@shared/components/game-base/handlers/game-round-data-handler";
import { logger } from "../../../services/logger";

export class PlinkoGameRoundDataHandler extends GameRoundDataHandler {
    constructor() {
        super();
    }

    buildGameRoundDataAfterReceiveFinishEvent(previousRoundData: any, result: any, roundId: number): any {
        logger.info('Building game round data for plinko', {
            roundId,
            multiplier: result.multiplier,
            betAmount: result.betAmount,
            payout: result.payout
        });

        // For Plinko, each "round" is a single ball drop
        const resultRoundData = {
            multiplier: result.multiplier,
            betAmount: result.betAmount,
            payout: result.payout,
            timestamp: new Date().toISOString(),
            roundId: roundId,
            gameType: 'plinko',
            ballPosition: result.ballPosition, // Final position of the ball
            path: result.path // Optional: path the ball took through pegs
        };

        // Plinko doesn't accumulate round data like dice games
        // Each drop is independent, but we can still track statistics
        const finalRoundData = {
            ...resultRoundData,
            statistics: this.calculateStatistics(result),
            totalDrops: (previousRoundData?.totalDrops || 0) + 1
        };

        logger.info('Plinko round data built successfully', {
            roundId,
            multiplier: finalRoundData.multiplier,
            payout: finalRoundData.payout,
            totalDrops: finalRoundData.totalDrops
        });

        return finalRoundData;
    }

    private calculateStatistics(result: any) {
        // Calculate basic statistics for Plinko
        return {
            multiplier: result.multiplier,
            payout: result.payout,
            profit: result.payout - result.betAmount,
            isWin: result.payout > result.betAmount,
            timestamp: new Date().toISOString()
        };
    }

    // Plinko doesn't use traditional round data in the same way
    // This can be extended if needed for plinko-specific data handling
    handleRoundData(data: any) {
        // Handle plinko-specific round data if needed
        logger.debug('Plinko round data received:', data);
    }
}
