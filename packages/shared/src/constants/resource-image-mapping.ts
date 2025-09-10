import { getGameSettings } from "../app-settings";

const COMMON_PATHS = ["/chips/"];
export const getPathImageGameId = (gameId: number) => {
    const gameSettings = getGameSettings(gameId);
    const gameImagePath = gameSettings?.gameResourceConfigs?.path || "";
    const optionalGamePaths = gameSettings?.gameResourceConfigs?.optionalPaths || [];

    if (!gameImagePath) {
        return [];
    }

    return [...COMMON_PATHS, gameImagePath, ...optionalGamePaths];
};
