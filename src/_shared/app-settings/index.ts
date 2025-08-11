import getConfig from "next/config";

import AppSettings from "./type";

const defaultAppSettings: AppSettings = getConfig().publicRuntimeConfig;
let mergedAppSettings: AppSettings;

// Import configurations for different game types
const gnConfigs = require("../../../configs.json");
const l2Configs = require("../../../configs-original.json");
const gameSettings = require("../../../game-settings.json");

// Function to get configuration based on game ID
const getConfigForGame = (gameId: number) => {
    // SeDie game (ID 2) uses L2 configuration
    if (gameId === 2) {
        return {
            ...l2Configs,
            gameSettings,
        };
    }
    // Other games use GN configuration
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
