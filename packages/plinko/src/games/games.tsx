import React from "react";
import { Games, GameConfig } from "@shared/components/game-components/games";
import { GAME_ID } from "../game-config";
import PlinkoGame from "../page";

const gameConfig: GameConfig = {
    gameId: GAME_ID,
    component: PlinkoGame,
    name: "Plinko",
};

export const PlinkoGames: React.FC<any> = (props) => {
    return <Games {...props} gameConfig={gameConfig} />;
};

export default PlinkoGames;
