import { StateCreator } from "zustand";
import { PFClientSeedSetting } from '@shared/components/game-base/type';
import { localStorageKeys, randomNumberSeries, StorageHelper } from "../../helpers";

export interface PFSettingsSlice {
    // State
    isShowPFSetting: boolean;
    pfClientSeedSetting: PFClientSeedSetting;
    serverSeedHash: string;
    expandGuideFirst: boolean;
    gameId: number;
    uid: number;

    // Actions
    togglePFSetting: (isShow: boolean) => void;
    updatePFClientSeedSetting: (setting: Partial<PFClientSeedSetting>) => void;
    updateServerSeedHash: (hash: string) => void;
    toggleExpandGuideFirst: (isExpand: boolean) => void;
    initializePFSettings: (gameId: number, uid: number) => void;
}

export const createPFSettingsSlice: StateCreator<PFSettingsSlice> = (set, get) => ({
    // Initial state
    isShowPFSetting: false,
    pfClientSeedSetting: {
        roundId: 0,
        randomClientSeed: randomNumberSeries(4),
        manualClientSeed: "",
        useManualClientSeed: false,
    },
    serverSeedHash: "",
    expandGuideFirst: false,
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

    updateServerSeedHash: (hash) => {
        set({ serverSeedHash: hash });
    },

    toggleExpandGuideFirst: (isExpand) => {
        set({ expandGuideFirst: isExpand });
    },

    initializePFSettings: (gameId, uid) => {
        const defaultSettings = {
            gameId,
            uid,
            pfClientSeedSetting: {
                roundId: 0,
                randomClientSeed: "0000",
                manualClientSeed: "",
                useManualClientSeed: false,
            },
            serverSeedHash: "",
        };

        try {
            const isSleepMode = StorageHelper.get<boolean>(`${localStorageKeys.isSleepMode}`);
            let isShowPFSetting = false;

            if (isSleepMode) {
                const storedShowPFSetting = StorageHelper.get<string>(`${localStorageKeys.showPFSetting}`);
                isShowPFSetting = storedShowPFSetting === `${uid}-${gameId}`;
            }

            // Reset sleep mode flag
            StorageHelper.set(localStorageKeys.isSleepMode, false);

            // Get stored PF client seed settings
            const storedPFSetting = StorageHelper.get<PFClientSeedSetting>(`${localStorageKeys.pfSetting}-${uid}-${gameId}`);

            let finalPFSetting = defaultSettings.pfClientSeedSetting;
            if (storedPFSetting) {
                finalPFSetting = {
                    ...storedPFSetting,
                    manualClientSeed: storedPFSetting.manualClientSeed?.length > 0
                        ? storedPFSetting.manualClientSeed
                        : storedPFSetting.randomClientSeed,
                };
            }

            set({
                ...defaultSettings,
                isShowPFSetting,
                pfClientSeedSetting: finalPFSetting,
            });
        } catch (error) {
            set(defaultSettings);
        }
    },
}); 