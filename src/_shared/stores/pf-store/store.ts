import { create } from "zustand";
import { PFClientSeedSetting, PFResult } from "../../../components/game-base/type";
import { localStorageKeys, StorageHelper } from "../../helpers";

export interface PFStore {
    // State
    isShowPFSetting: boolean;
    isShowPFVerify: boolean;
    isShowPFClientSeedInfo: boolean;
    isShowPFVerification: boolean;
    pfClientSeedSetting: PFClientSeedSetting;
    pfVerifyModalData: PFResult | null;
    ownBets: Record<string, any>;
    gameId: number;
    uid: number;

    // Actions
    togglePFVerify: (isShow: boolean) => void;
    togglePFSetting: (isShow: boolean) => void;
    togglePFClientSeedInfo: (isShow: boolean) => void;
    togglePFVerification: (isShow: boolean) => void;
    updatePFVerify: (data: PFResult) => void;
    updatePFClientSeedSetting: (setting: Partial<PFClientSeedSetting>) => void;
    setOwnBets: (bets: Record<string, any>) => void;
    setNewGameState: () => void;
    initializePF: (gameId: number, uid: number) => void;
}

export const usePFStore = create<PFStore>((set, get) => ({
    // Initial state
    isShowPFSetting: false,
    isShowPFVerify: false,
    isShowPFClientSeedInfo: false,
    isShowPFVerification: false,
    pfClientSeedSetting: {
        drawId: 0,
        randomClientSeed: "0000",
        manualClientSeed: "",
        useManualClientSeed: false,
    },
    pfVerifyModalData: null,
    ownBets: {},
    gameId: 0,
    uid: 0,

    // Actions
    togglePFVerify: (isShow) => set({ isShowPFVerify: isShow }),

    togglePFSetting: (isShow) => {
        const { gameId, uid } = get();
        if (isShow) {
            StorageHelper.set(`${localStorageKeys.showPFSetting}`, `${uid}-${gameId}`);
        } else {
            StorageHelper.set(`${localStorageKeys.showPFSetting}`, "");
        }
        set({ isShowPFSetting: isShow });
    },

    togglePFClientSeedInfo: (isShow) => set({ isShowPFClientSeedInfo: isShow }),

    togglePFVerification: (isShow) => set({ isShowPFVerification: isShow }),

    updatePFVerify: (data) => set({ pfVerifyModalData: data }),

    updatePFClientSeedSetting: (setting) => {
        const { gameId, uid, pfClientSeedSetting } = get();
        const newSetting = {
            ...pfClientSeedSetting,
            ...setting,
        };
        
        StorageHelper.set(`${localStorageKeys.pfSetting}-${uid}-${gameId}`, newSetting);
        set({ pfClientSeedSetting: newSetting });
    },

    setOwnBets: (bets) => set({ ownBets: bets }),

    setNewGameState: () => set({ ownBets: {} }),

    initializePF: (gameId, uid) => {
        const defaultContext = {
            pfVerifyModalData: null,
            ownBets: {},
            gameId,
            uid,
            pfClientSeedSetting: {
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
                ...defaultContext,
                isShowPFSetting,
                pfClientSeedSetting: finalSetting,
            });
        } catch (error) {
            set(defaultContext);
        }
    },
}));

export default usePFStore; 