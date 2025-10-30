import { registerGame } from "@shared/game-registry";
import { getGameConfig } from "@shared/game-config";

/**
 * Shared game registry template
 * This eliminates duplication between game packages
 */
export const registerCurrentGame = (loader: () => Promise<any>) => {
    const gameConfig = getGameConfig();

    registerGame({
        gameId: gameConfig.gameId,
        loader,
        metadata: {
            name: gameConfig.gameName,
            version: gameConfig.gameVersion,
            description: gameConfig.gameDescription
        }
    });
};
