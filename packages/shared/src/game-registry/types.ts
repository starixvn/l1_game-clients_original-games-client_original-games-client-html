export interface GameRegistryEntry {
    gameId: number;
    loader: () => Promise<any>;
    metadata?: {
        name: string;
        version?: string;
        description?: string;
    };
}

export interface GameRegistry {
    register(entry: GameRegistryEntry): void;
    getLoader(gameId: number): (() => Promise<any>) | null;
    getAllRegisteredGames(): GameRegistryEntry[];
    isRegistered(gameId: number): boolean;
}

export type GameLoader = () => Promise<any>;
