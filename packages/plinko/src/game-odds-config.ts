import { PlinkoConfig } from "./shared/types/types";

/**
 * Plinko Odds Configuration
 *
 * This configuration defines the odds/multipliers for different game modes and row counts.
 * Matches the configuration from the plinko-service.
 */
export const plinkoConfig: PlinkoConfig = {
    odds: {
        0: {
            8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            9: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            11: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            13: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            14: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            15: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            16: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        },
        1: {
            8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            9: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            11: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            13: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            14: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            15: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            16: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        },
        2: {
            8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            9: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            11: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            13: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            14: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            15: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            16: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        },
    },
};

/**
 * Helper function to get odds for a specific game mode and number of rows
 */
export const getOddsForMode = (gameMode: number, rows: number): number[] => {
    const modeOdds = plinkoConfig.odds[gameMode];
    if (!modeOdds) {
        throw new Error(`Invalid game mode: ${gameMode}`);
    }

    const rowOdds = modeOdds[rows];
    if (!rowOdds) {
        throw new Error(`Invalid number of rows: ${rows} for game mode: ${gameMode}`);
    }

    return rowOdds;
};

/**
 * Helper function to validate game configuration
 */
export const validateGameConfig = (gameMode: number, rows: number): boolean => {
    try {
        getOddsForMode(gameMode, rows);
        return true;
    } catch {
        return false;
    }
};
