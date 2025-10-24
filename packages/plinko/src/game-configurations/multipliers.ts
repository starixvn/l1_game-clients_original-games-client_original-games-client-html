/**
 * Game-specific multiplier configurations
 * Defines multiplier values and colors for different difficulty modes
 */

export interface MultiplierConfig {
    colors: string[];
    values: number[];
}

/**
 * Plinko (Game ID 145) multiplier configuration
 */
export const plinkoMultipliers = {
    LOW: {
        colors: ["#B8590B", "#FF7400", "#FF8D00", "#FFA700", "#FFCE00", "#FFDC48"],
        values: [1.1, 1.2, 1.3, 1.5, 2.0, 3.0] // Example values
    },
    MEDIUM: {
        colors: ["#3423EB", "#4E3EFF", "#7D71FF", "#948BFF", "#ACA4FF", "#C3BEFF"],
        values: [1.2, 1.5, 2.0, 3.0, 5.0, 10.0] // Example values
    },
    HIGH: {
        colors: ["#A3080A", "#DF272A", "#FA3F42", "#FF686C", "#FF9193", "#FFB4B6"],
        values: [1.5, 2.0, 3.0, 5.0, 10.0, 20.0] // Example values
    }
};

/**
 * Plinko X (Game ID 159) multiplier configuration
 * Uses different colors and potentially different multiplier values
 */
export const plinkoXMultipliers = {
    LOW: {
        colors: ["#0B59B8", "#0074FF", "#008DFF", "#00A7FF", "#00CEFF", "#48DCFF"], // Blue theme
        values: [1.1, 1.2, 1.3, 1.5, 2.0, 3.0] // Same values as Plinko for now
    },
    MEDIUM: {
        colors: ["#23EB34", "#3EFF4E", "#71FF7D", "#8BFF94", "#A4FFAC", "#BEFFC3"], // Green theme
        values: [1.2, 1.5, 2.0, 3.0, 5.0, 10.0] // Same values as Plinko for now
    },
    HIGH: {
        colors: ["#B80B59", "#FF0074", "#FF008D", "#FF00A7", "#FF00CE", "#FF48DC"], // Pink/Purple theme
        values: [1.5, 2.0, 3.0, 5.0, 10.0, 20.0] // Same values as Plinko for now
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
