import React from "react";
import { Games, GameConfig } from "@shared/components/game-components/games";
import PlinkoGame from "../page";

// Function to get game ID (prioritizes env var over URL extraction)
const getGameId = (): number => {
    // First priority: Environment variable (for dedicated game servers)
    const envGameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID;
    if (envGameId && !isNaN(Number(envGameId))) {
        return Number(envGameId);
    }

    // Default fallback for build-time
    return 145;
};

// Dynamic game configuration that can be updated at runtime
let currentGameConfig: GameConfig = {
    gameId: getGameId(), // Use env var or default
    component: PlinkoGame,
    name: getGameId() === 145 ? "Plinko" : "Plinko X",
};

// Function to update game configuration dynamically
export const updateGameConfig = (gameId: number) => {
    currentGameConfig = {
        gameId: gameId,
        component: PlinkoGame,
        name: gameId === 145 ? "Plinko" : "Plinko X",
    };
    console.log(`Games config updated for game ID: ${gameId} (${currentGameConfig.name})`);
};

export const PlinkoGames: React.FC<any> = (props) => {
    return <Games {...props} gameConfig={currentGameConfig} />;
};

export default PlinkoGames;
