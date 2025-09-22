import { setGameConfig } from "@shared/game-config";

// Game configuration for SeDie Multiplayer
const gameConfig = {
    gameId: 148,
    gameName: "SeDie Multiplayer",
    gameVersion: "1.0.0",
    gameDescription: "Multiplayer SeDie Game",
    assetPath: "/game-148",
    serviceName: "sedie-multiplayer"
};

// Set the game configuration
setGameConfig(gameConfig);

export { gameConfig };
