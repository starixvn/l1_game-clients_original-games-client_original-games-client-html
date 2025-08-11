import { GameRoundDataHandler } from "../../components/game-base/handlers/game-round-data-handler";

export class SeDieGameRoundDataHandler extends GameRoundDataHandler {
    buildGameRoundDataAfterReceiveFinishEvent(previousRoundData: any, result: any, drawId: number) {
        const resultRoundData = {
            dice: [result.dice],
            winningChoice: result.winningChoice,
            timestamp: new Date().toISOString(),
            roundId: drawId,
        };

        return {
            dice: previousRoundData?.dice?.concat(resultRoundData.dice) || resultRoundData.dice,
            winningChoice: result.winningChoice,
            drawId,
            timestamp: resultRoundData.timestamp,
            roundId: resultRoundData.roundId,
            // Add additional SeDie-specific data
            gameType: 'sedie-multiplayer',
            totalDice: result.dice?.length || 0,
            // Calculate statistics
            statistics: this.calculateStatistics(previousRoundData, result),
        };
    }

    private calculateStatistics(previousRoundData: any, result: any) {
        const allDice = previousRoundData?.dice?.concat([result.dice]) || [result.dice];

        // Calculate frequency of each dice value
        const diceFrequency: { [key: number]: number } = {};
        allDice.flat().forEach((value: number) => {
            diceFrequency[value] = (diceFrequency[value] || 0) + 1;
        });

        // Calculate winning patterns
        const winningPatterns = {
            odd: 0,
            even: 0,
            red2: 0,
            red3: 0,
            red4: 0,
            white3: 0,
            white4: 0,
        };

        // Count winning patterns from history
        if (previousRoundData?.statistics?.winningPatterns) {
            Object.keys(winningPatterns).forEach(pattern => {
                winningPatterns[pattern] = previousRoundData.statistics.winningPatterns[pattern] || 0;
            });
        }

        // Add current result
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
        if (values.length === 0) return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return Math.round((sum / values.length) * 100) / 100;
    }

    // Override to add SeDie-specific validation
    validateGameRoundData(roundData: any): boolean {
        if (!roundData) return false;

        // Validate required fields
        const requiredFields = ['dice', 'winningChoice', 'drawId'];
        for (const field of requiredFields) {
            if (!roundData[field]) return false;
        }

        // Validate dice values (should be 1-6)
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


