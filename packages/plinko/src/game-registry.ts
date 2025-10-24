// Import shared game registry template
import { registerCurrentGame } from "@shared/game-registry/game-registry-template";
import { initializeGameConfig } from "./game-config";

/**
 * Register a game based on its ID
 * This function dynamically imports the appropriate page component
 * and initializes the game configuration
 */
export function registerGame(gameId: number): void {
    // Initialize game configuration first
    initializeGameConfig(gameId);

    // Register the game with the shared registry
    // Both games use the same page component since they share business logic
    registerCurrentGame(() => import("./page"));
}

/**
 * Legacy registration for backward compatibility
 * Registers Plinko (game ID 145) by default
 */
export function registerPlinkoGame(): void {
    registerGame(145);
}

/**
 * Register Plinko X game (game ID 159)
 */
export function registerPlinkoXGame(): void {
    registerGame(159);
}

// Export the registration functions
export { registerCurrentGame } from "@shared/game-registry/game-registry-template";
