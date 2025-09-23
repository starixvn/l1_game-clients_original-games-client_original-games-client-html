import { getGameSettings } from "../app-settings";

const COMMON_PATHS = ["/static/images/chips/"];
export const getPathImageGameId = (gameId: number) => {
    const gameSettings = getGameSettings(gameId);
    const gameImagePath = gameSettings?.gameResourceConfigs?.path || "";
    const optionalGamePaths = gameSettings?.gameResourceConfigs?.optionalPaths || [];

    if (!gameImagePath) {
        return [];
    }

    const paths = [];
    if (gameImagePath) {
        paths.push(`/static/images/${gameImagePath}/`);
    }
    paths.push(...optionalGamePaths.map(path => path.startsWith('/static/') ? path : `/static/images/${path}`));

    return paths;
};
