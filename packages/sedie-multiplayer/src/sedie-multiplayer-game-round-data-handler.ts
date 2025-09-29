import { GameRoundDataHandler } from '@shared/components/game-base/handlers/game-round-data-handler';
import { logger } from '@shared/services/logger';

export class SeDieGameRoundDataHandler extends GameRoundDataHandler {
    buildGameRoundDataAfterReceiveFinishEvent(previousRoundData: any, result: any, roundId: number) {
        logger.info('Building game round data for sedie-multiplayer', {
            roundId,
            winningChoice: result.winningChoice,
            dice: result.dice,
            previousRoundDiceCount: previousRoundData?.dice?.length || 0
        });

        const resultRoundData = {
            dice: [result.dice],
            winningChoice: result.winningChoice,
            timestamp: new Date().toISOString(),
            roundId: roundId,
        };

        const finalRoundData = {
            dice: previousRoundData?.dice?.concat(resultRoundData.dice) || resultRoundData.dice,
            winningChoice: result.winningChoice,
            timestamp: resultRoundData.timestamp,
            roundId: resultRoundData.roundId,
            gameType: 'sedie-multiplayer',
            totalDice: result.dice?.length || 0,
            statistics: this.calculateStatistics(previousRoundData, result),
        };

        logger.info('Game round data built successfully', {
            roundId,
            totalDice: finalRoundData.totalDice,
            winningChoice: finalRoundData.winningChoice,
            statisticsCalculated: !!finalRoundData.statistics
        });

        return finalRoundData;
    }

    private calculateStatistics(previousRoundData: any, result: any) {
        const allDice = previousRoundData?.dice?.concat([result.dice]) || [result.dice];

        const diceFrequency: { [key: number]: number } = {};
        allDice.flat().forEach((value: number) => {
            diceFrequency[value] = (diceFrequency[value] || 0) + 1;
        });

        const winningPatterns = {
            odd: 0,
            even: 0,
            red2: 0,
            red3: 0,
            red4: 0,
            white3: 0,
            white4: 0,
        };

        if (previousRoundData?.statistics?.winningPatterns) {
            Object.keys(winningPatterns).forEach(pattern => {
                winningPatterns[pattern] = previousRoundData.statistics.winningPatterns[pattern] || 0;
            });
        }

        if (result.winningChoice) {
            winningPatterns[result.winningChoice] = (winningPatterns[result.winningChoice] || 0) + 1;
        }

        return {
            diceFrequency,
            winningPatterns,
            totalRounds: allDice.length,
            averageDiceValue: this.calculateAverage(allDice.flat()),
        };
    }

    private calculateAverage(values: number[]): number {
        if (values.length === 0) {
            return 0;
        }
        const sum = values.reduce((acc, val) => acc + val, 0);
        return Math.round((sum / values.length) * 100) / 100;
    }

    validateGameRoundData(roundData: any): boolean {
        if (!roundData) {
            return false;
        }
        const requiredFields = ['dice', 'winningChoice', 'roundId'];
        for (const field of requiredFields) {
            if (!roundData[field]) {
                return false;
            }
        }
        if (roundData.dice) {
            const diceArray = Array.isArray(roundData.dice) ? roundData.dice.flat() : [roundData.dice];
            for (const value of diceArray) {
                if (typeof value !== 'number' || value < 1 || value > 6) {
                    return false;
                }
            }
        }
        return true;
    }
}


