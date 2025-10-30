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
    paths.push(...optionalGamePaths.map(path => {
        const fullPath = path.startsWith('/static/') ? path : `/static/images/${path}`;
        // Ensure directory paths end with '/' for proper concatenation
        return fullPath.endsWith('/') ? fullPath : fullPath + '/';
    }));

    return paths;
};
