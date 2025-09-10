import { GameIds } from "@shared/constants";
import { registerGame } from "@shared/game-registry";

// Register the SeDie Multiplayer game
registerGame({
    gameId: GameIds.SeDieMultiplayer,
    loader: () => import("./page"),
    metadata: {
        name: "SeDie Multiplayer",
        version: "1.0.0",
        description: "SeDie Multiplayer game component"
    }
});
