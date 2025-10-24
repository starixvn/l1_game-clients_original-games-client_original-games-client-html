/**
 * Game-specific multiplier configurations
 * Defines multiplier values and colors for different difficulty modes
 */

export interface MultiplierConfig {
    colors: string[];
    values: number[];
}

/**
 * Plinko (Game ID 145) multiplier configuration - matches master branch exactly
 */
export const plinkoMultipliers = {
    LOW: {
        colors: ["#B8590B", "#FF7400", "#FF8D00", "#FFA700", "#FFCE00", "#FFDC48"],
        values: [1.1, 1.2, 1.3, 1.5, 2.0, 3.0]
    },
    MEDIUM: {
        colors: ["#3423EB", "#4E3EFF", "#7D71FF", "#948BFF", "#ACA4FF", "#C3BEFF"],
        values: [1.2, 1.5, 2.0, 3.0, 5.0, 10.0]
    },
    HIGH: {
        colors: ["#A3080A", "#DF272A", "#FA3F42", "#FF686C", "#FF9193", "#FFB4B6"],
        values: [1.5, 2.0, 3.0, 5.0, 10.0, 20.0]
    }
};

/**
 * Plinko X (Game ID 159) multiplier configuration - matches master branch exactly
 * Same configuration as Plinko for now, can be customized later
 */
export const plinkoXMultipliers = {
    LOW: {
        colors: ["#B8590B", "#FF7400", "#FF8D00", "#FFA700", "#FFCE00", "#FFDC48"],
        values: [1.1, 1.2, 1.3, 1.5, 2.0, 3.0]
    },
    MEDIUM: {
        colors: ["#3423EB", "#4E3EFF", "#7D71FF", "#948BFF", "#ACA4FF", "#C3BEFF"],
        values: [1.2, 1.5, 2.0, 3.0, 5.0, 10.0]
    },
    HIGH: {
        colors: ["#A3080A", "#DF272A", "#FA3F42", "#FF686C", "#FF9193", "#FFB4B6"],
        values: [1.5, 2.0, 3.0, 5.0, 10.0, 20.0]
    }
};

/**
 * Get multiplier configuration for a specific game ID and mode
 */
export function getGameMultipliers(gameId: number) {
    switch (gameId) {
        case 145:
            return plinkoMultipliers;
        case 159:
            return plinkoXMultipliers;
        default:
            throw new Error(`Unknown game ID: ${gameId}`);
    }
}

/**
 * Get multiplier colors for a specific game ID and mode
 */
export function getMultiplierColors(gameId: number, mode: number): string[] {
    const multipliers = getGameMultipliers(gameId);
    switch (mode) {
        case 0: // LOW
            return multipliers.LOW.colors;
        case 1: // MEDIUM
            return multipliers.MEDIUM.colors;
        case 2: // HIGH
            return multipliers.HIGH.colors;
        default:
            throw new Error(`Unknown mode: ${mode}`);
    }
}
