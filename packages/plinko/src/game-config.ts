import { setGameConfig, type GameConfig } from "@shared/game-config";
import { getGameAssets, getGameMultipliers, getGameUITheme } from "./game-configurations";

/**
 * Game Configuration Factory
 *
 * Creates game configuration based on runtime game ID.
 * Supports both Plinko (145) and Plinko X (159) games.
 */
export function initializeGameConfig(gameId: number): GameConfig {
    

    let gameConfig: GameConfig;

    switch (gameId) {
        case 145:
            gameConfig = {
                gameId: 145,
                gameName: "Plinko",
                gameVersion: "1.0.0",
                gameDescription: "Exciting Plinko game with physics-based ball dropping",
                assetPath: "/site-145",
                serviceName: "plinko"
            };
            break;
        case 159:
            gameConfig = {
                gameId: 159,
                gameName: "Plinko X",
                gameVersion: "1.0.0",
                gameDescription: "Enhanced Plinko X game with advanced physics and new features",
                assetPath: "/site-159",
                serviceName: "plinkox"
            };
            break;
        default:
            throw new Error(`Unsupported game ID: ${gameId}. Supported IDs: 145 (Plinko), 159 (Plinko X)`);
    }

    // Set the game configuration with validation
    setGameConfig(gameConfig);

    // Store current game ID for runtime access
    currentGameId = gameId;

    
    return gameConfig;
}

// Global variable to store current game ID
let currentGameId: number | null = null;

// Initialize game configuration at module load time if NEXT_PUBLIC_DEFAULT_GAME_ID is set
// This serves as a fallback, but page-level initialization takes priority
const defaultGameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID;
if (defaultGameId && !isNaN(Number(defaultGameId))) {
    try {
        const envGameId = Number(defaultGameId);
        
        initializeGameConfig(envGameId);
    } catch (error) {
        // Silently fail during initialization - configuration will be set later
        console.warn('Failed to initialize game config at module load:', error);
    }
}

/**
 * Get the currently active game ID
 */
export function getCurrentGameId(): number {
    if (currentGameId === null) {
        // Return default game ID (Plinko) if not initialized
        const defaultGameId = 145;
        // Ensure the shared game config is initialized with the default
        try {
            initializeGameConfig(defaultGameId);
        } catch (error) {
            // If initialization fails, config might already be set - continue silently
        }
        
        return defaultGameId;
    }
    
    return currentGameId;
}

/**
 * Get game-specific assets configuration
 */
export function getCurrentGameAssets() {
    return getGameAssets(getCurrentGameId());
}

/**
 * Get game-specific multiplier configuration
 */
export function getCurrentGameMultipliers() {
    return getGameMultipliers(getCurrentGameId());
}

/**
 * Get game-specific UI theme configuration
 */
export function getCurrentGameUITheme() {
    return getGameUITheme(getCurrentGameId());
}

// Export version for backward compatibility
export const GAME_VERSION = "1.0.0";
