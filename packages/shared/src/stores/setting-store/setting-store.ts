import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AudioSettingsSlice, createAudioSettingsSlice } from "./audio-settings-slice";
import { UISettingsSlice, createUISettingsSlice } from "./ui-settings-slice";
import { GameSettingsSlice, createGameSettingsSlice } from "./game-settings-slice";
import { localStorageKeys } from "@shared/helpers";
import { getAppSettings } from "@shared/app-settings";

function getSettingStoreKey(): string {
    try {
        return localStorageKeys.settingStore;
    } catch (error) {
        const hostname = typeof globalThis !== "undefined" && globalThis.location?.hostname ? globalThis.location.hostname : "localhost";
        return `${hostname}.setting-store.${getAppSettings().appType}`;
    }
}

export type SettingStore = {
    // Global actions
    resetAllSettings: () => void;
} & AudioSettingsSlice &
    UISettingsSlice &
    GameSettingsSlice;

export const useSettingStore = create<SettingStore>()(
    persist(
        (set, ...args) => {
            const audioSettingsSlice = createAudioSettingsSlice(set, ...args);
            const uiSettingsSlice = createUISettingsSlice(set, ...args);
            const gameSettingsSlice = createGameSettingsSlice(set, ...args);

            return {
                ...audioSettingsSlice,
                ...uiSettingsSlice,
                ...gameSettingsSlice,

                // Global actions
                resetAllSettings: () => {
                    audioSettingsSlice.resetAudioSettings();
                    uiSettingsSlice.resetUISettings();
                    gameSettingsSlice.resetGameSettings();
                },
            };
        },
        {
            name: getSettingStoreKey(),
            partialize: (state) => ({
                enabledMusic: state.enabledMusic,
                enabledSound: state.enabledSound,
                volumeMusic: state.volumeMusic,
                volumeSFX: state.volumeSFX,
                isToggleHotKey: state.isToggleHotKey,
            }),
        }
    )
);

// Selectors for better performance
export const selectAudioSettings = (state: SettingStore) => ({
    enabledMusic: state.enabledMusic,
    enabledSound: state.enabledSound,
    volumeMusic: state.volumeMusic,
    volumeSFX: state.volumeSFX,
});

export const selectUISettings = (state: SettingStore) => ({
    isShowedSetting: state.isShowedSetting,
});

export const selectGameSettings = (state: SettingStore) => ({
    chipSettings: state.chipSettings,
});

// Individual selectors for specific properties
export const selectMusicSettings = (state: SettingStore) => ({
    enabledMusic: state.enabledMusic,
    volumeMusic: state.volumeMusic,
});

export const selectSoundSettings = (state: SettingStore) => ({
    enabledSound: state.enabledSound,
    volumeSFX: state.volumeSFX,
});
