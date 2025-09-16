import { registerGame } from "@shared/game-registry";
import { GAME_ID, GAME_NAME, GAME_VERSION, GAME_DESCRIPTION } from "./game-constants";

// Register the SeDie Multiplayer game
registerGame({
    gameId: GAME_ID,
    loader: () => import("./page"),
    metadata: {
        name: GAME_NAME,
        version: GAME_VERSION,
        description: GAME_DESCRIPTION
    }
});
