import getConfig from "next/config";

import AppSettings from "./type";

const defaultAppSettings: AppSettings = getConfig().publicRuntimeConfig;
let mergedAppSettings: AppSettings;

// Import configurations
const gnConfigs = require("../../../configs.json");
const gameSettings = require("../../../game-settings.json");

// Function to get configuration (single config now)
const getConfigForGame = (_gameId: number) => {
    return {
        ...gnConfigs,
        gameSettings,
    };
};

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

// New function to get app settings for a specific game
export const getAppSettingsForGame = (gameId: number) => {
    return getConfigForGame(gameId);
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
