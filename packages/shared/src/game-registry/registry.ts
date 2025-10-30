import { GameRegistry, GameRegistryEntry } from "./types";

class GameRegistryImpl implements GameRegistry {
    private readonly games: Map<number, GameRegistryEntry> = new Map();

    register(entry: GameRegistryEntry): void {
        this.games.set(entry.gameId, entry);
    }

    getLoader(gameId: number): (() => Promise<any>) | null {
        const entry = this.games.get(gameId);
        return entry ? entry.loader : null;
    }

    getAllRegisteredGames(): GameRegistryEntry[] {
        return Array.from(this.games.values());
    }

    isRegistered(gameId: number): boolean {
        return this.games.has(gameId);
    }
}

// Global registry instance
export const gameRegistry = new GameRegistryImpl();

// Convenience function for games to register themselves
export const registerGame = (entry: GameRegistryEntry): void => {
    gameRegistry.register(entry);
};
