import { setGameConfig, type GameConfig } from "@shared/game-config";
import "./history/baccarat-multiplayer-bet-history-calculator"; // Register calculators when config loads

/**
 * Baccarat Multiplayer Game Configuration
 *
 * This configuration defines all game-specific settings and metadata.
 * Configuration is validated at runtime to ensure data integrity.
 */
const gameConfig: GameConfig = {
    gameId: 150,
    gameName: "Baccarat Multiplayer",
    gameVersion: "1.0.0",
    gameDescription: "Multiplayer Baccarat Game",
    assetPath: "/site-150",
    serviceName: "baccarat-multiplayer"
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
