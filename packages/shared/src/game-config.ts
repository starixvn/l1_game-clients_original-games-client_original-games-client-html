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
 * Validate game configuration
 */
const validateGameConfig = (config: GameConfig): void => {
    if (!config.gameId || config.gameId <= 0) {
        throw new Error(`Invalid gameId: ${config.gameId}. Must be a positive number.`);
    }
    if (!config.gameName?.trim()) {
        throw new Error(`Invalid gameName: ${config.gameName}. Must be a non-empty string.`);
    }
    if (!config.gameVersion?.trim()) {
        throw new Error(`Invalid gameVersion: ${config.gameVersion}. Must be a non-empty string.`);
    }
    if (!config.gameDescription?.trim()) {
        throw new Error(`Invalid gameDescription: ${config.gameDescription}. Must be a non-empty string.`);
    }
    if (!config.assetPath?.startsWith('/')) {
        throw new Error(`Invalid assetPath: ${config.assetPath}. Must start with '/'.`);
    }
    if (!config.serviceName?.trim()) {
        throw new Error(`Invalid serviceName: ${config.serviceName}. Must be a non-empty string.`);
    }
};

/**
 * Current game configuration - this should be set by each game package
 */
let currentGameConfig: GameConfig | null = null;

/**
 * Set the current game configuration with validation
 * This should be called early in the game package initialization
 */
export const setGameConfig = (config: GameConfig): void => {
    validateGameConfig(config);
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
