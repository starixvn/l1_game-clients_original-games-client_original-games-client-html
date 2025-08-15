import { StateCreator } from "zustand";
import { PFClientSeedSetting } from "../../../components/game-base/type";
import { localStorageKeys, StorageHelper } from "../../helpers";

export interface PFSettingsSlice {
    // State
    isShowPFSetting: boolean;
    pfClientSeedSetting: PFClientSeedSetting;
    gameId: number;
    uid: number;

    // Actions
    togglePFSetting: (isShow: boolean) => void;
    updatePFClientSeedSetting: (setting: Partial<PFClientSeedSetting>) => void;
    initializePFSettings: (gameId: number, uid: number) => void;
}

export const createPFSettingsSlice: StateCreator<PFSettingsSlice> = (set, get) => ({
    // Initial state
    isShowPFSetting: false,
    pfClientSeedSetting: {
        roundId: 0,
        drawId: 0,
        randomClientSeed: "0000",
        manualClientSeed: "",
        useManualClientSeed: false,
    },
    gameId: 0,
    uid: 0,

    // Actions
    togglePFSetting: (isShow) => {
        const { gameId, uid } = get();
        if (isShow) {
            StorageHelper.set(`${localStorageKeys.showPFSetting}`, `${uid}-${gameId}`);
        } else {
            StorageHelper.set(`${localStorageKeys.showPFSetting}`, "");
        }
        set({ isShowPFSetting: isShow });
    },

    updatePFClientSeedSetting: (setting) => {
        const { gameId, uid, pfClientSeedSetting } = get();
        const newSetting = {
            ...pfClientSeedSetting,
            ...setting,
        };
        
        StorageHelper.set(`${localStorageKeys.pfSetting}-${uid}-${gameId}`, newSetting);
        set({ pfClientSeedSetting: newSetting });
    },

    initializePFSettings: (gameId, uid) => {
        const defaultSettings = {
            gameId,
            uid,
            pfClientSeedSetting: {
                roundId: 0,
                drawId: 0,
                randomClientSeed: "0000",
                manualClientSeed: "",
                useManualClientSeed: false,
            },
        };

        try {
            let isShowPFSetting = StorageHelper.get<string>(`${localStorageKeys.showPFSetting}`) === `${uid}-${gameId}`;
            !isShowPFSetting && StorageHelper.set(`${localStorageKeys.showPFSetting}`, '');

            const pfClientSeedSettingStorage = StorageHelper.get<PFClientSeedSetting>(`${localStorageKeys.pfSetting}-${uid}-${gameId}`);
            const isSleepMode = StorageHelper.get<boolean>(`${localStorageKeys.isSleepMode}`);

            if (!isSleepMode) {
                isShowPFSetting = false;
            }
            StorageHelper.set(localStorageKeys.isSleepMode, false);

            const finalSetting = {
                ...pfClientSeedSettingStorage,
                manualClientSeed:
                    pfClientSeedSettingStorage?.manualClientSeed?.length <= 0 && pfClientSeedSettingStorage?.useManualClientSeed
                        ? pfClientSeedSettingStorage?.randomClientSeed
                        : pfClientSeedSettingStorage?.manualClientSeed,
            };

            set({
                ...defaultSettings,
                isShowPFSetting,
                pfClientSeedSetting: finalSetting,
            });
        } catch (error) {
            set(defaultSettings);
        }
    },
}); 