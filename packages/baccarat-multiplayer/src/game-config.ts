import { setGameConfig } from "@shared/game-config";

// Game configuration for Baccarat Multiplayer
const gameConfig = {
    gameId: 150,
    gameName: "Baccarat Multiplayer",
    gameVersion: "1.0.0",
    gameDescription: "Multiplayer Baccarat Game",
    assetPath: "/game-150",
    serviceName: "baccarat-multiplayer"
};

// Set the game configuration
setGameConfig(gameConfig);

export { gameConfig };
