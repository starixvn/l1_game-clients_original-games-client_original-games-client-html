import getConfig from "next/config";

import AppSettings from "./type";

const defaultAppSettings: AppSettings = getConfig().publicRuntimeConfig;
let mergedAppSettings: AppSettings;

export const getAppSettings = () => {
    if (mergedAppSettings) {
        return mergedAppSettings;
    }

    mergedAppSettings = defaultAppSettings;

    if (global.window) {
        defaultAppSettings.serverDomainMapper = undefined;
        mergedAppSettings = global.window["envConfig"] ? { ...defaultAppSettings, ...global.window["envConfig"] } : defaultAppSettings;
        global.window["mergedAppSettings"] = mergedAppSettings;
    }

    return mergedAppSettings;
};

export const getGameSettings = (gameId?: number) => {
    const { gameSettings } = getAppSettings();

    return gameSettings[gameId];
};

export const getGamesPath = () => {
    const { gameSettings } = getAppSettings();

    return Array.from(new Set(Object.values(gameSettings).map((item) => item.gamePath)));
};

export const getGameIdsSetting = () => {
    const { gameSettings } = getAppSettings();

    return Object.keys(gameSettings);
};
