import React from "react";
import { Games, GameConfig } from "@shared/components/game-components/games";
import PlinkoGame from "../page";

// Get game ID from environment variable at build time
const gameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID
    ? parseInt(process.env.NEXT_PUBLIC_DEFAULT_GAME_ID)
    : 145; // Default to Plinko

const gameConfig: GameConfig = {
    gameId: gameId,
    component: PlinkoGame,
    name: gameId === 145 ? "Plinko" : "Plinko X",
};

export const PlinkoGames: React.FC<any> = (props) => {
    return <Games {...props} gameConfig={gameConfig} />;
};

export default PlinkoGames;
