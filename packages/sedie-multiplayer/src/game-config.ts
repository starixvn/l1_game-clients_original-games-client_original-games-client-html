import { setGameConfig, type GameConfig } from "@shared/game-config";

/**
 * SeDie Multiplayer Game Configuration
 *
 * This configuration defines all game-specific settings and metadata.
 * Configuration is validated at runtime to ensure data integrity.
 */
const gameConfig: GameConfig = {
    gameId: 148,
    gameName: "SeDie Multiplayer",
    gameVersion: "1.0.0",
    gameDescription: "Multiplayer SeDie Game",
    assetPath: "/site-148",
    serviceName: "sedie-multiplayer",
};

// Set the game configuration with validation
setGameConfig(gameConfig);

// Export the configuration for potential direct access
export { gameConfig };

// Export individual properties for backward compatibility
export const GAME_ID = gameConfig.gameId;
export const GAME_NAME = gameConfig.gameName;
export const GAME_VERSION = gameConfig.gameVersion;
export const GAME_DESCRIPTION = gameConfig.gameDescription;
