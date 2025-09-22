/**
 * Game-specific configuration system
 * This allows each game to define its unique properties while sharing common code
 */

export interface GameConfig {
    /** Game ID used throughout the system */
    gameId: number;
    /** Game name for display */
    gameName: string;
    /** Game version */
    gameVersion: string;
    /** Game description */
    gameDescription: string;
    /** Path prefix for favicons and assets */
    assetPath: string;
    /** Service name for health checks */
    serviceName: string;
}

/**
 * Current game configuration - this should be set by each game package
 */
let currentGameConfig: GameConfig | null = null;

/**
 * Set the current game configuration
 * This should be called early in the game package initialization
 */
export const setGameConfig = (config: GameConfig) => {
    currentGameConfig = config;
};

/**
 * Get the current game configuration
 * Throws an error if no configuration has been set
 */
export const getGameConfig = (): GameConfig => {
    if (!currentGameConfig) {
        throw new Error('Game configuration not set. Call setGameConfig() first.');
    }
    return currentGameConfig;
};

/**
 * Helper to get game ID
 */
export const getGameId = (): number => getGameConfig().gameId;

/**
 * Helper to get asset path
 */
export const getAssetPath = (): string => getGameConfig().assetPath;

/**
 * Helper to get service name
 */
export const getServiceName = (): string => getGameConfig().serviceName;
