import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PFSettingsSlice, createPFSettingsSlice } from "./pf-settings-slice";
import { PFVerificationSlice, createPFVerificationSlice } from "./pf-verification-slice";
import { PFBetsSlice, createPFBetsSlice } from "./pf-bets-slice";
import { localStorageKeys } from "../../helpers";
import { getAppSettings } from "@shared/app-settings";

function getPFStoreKey(): string {
    try {
        return localStorageKeys.pfStore;
    } catch (error) {
        const hostname = typeof globalThis !== "undefined" && globalThis.location?.hostname 
            ? globalThis.location.hostname 
            : 'localhost';
        return `${hostname}.pf-store.${getAppSettings().appType}`;
    }
}

export type PFStore = {
    registerEvent: (message: any) => void;
    initializePF: (gameId: number, uid: number) => void;
} & PFSettingsSlice &
    PFVerificationSlice &
    PFBetsSlice;

export const usePFStore = create<PFStore>()(
    persist(
        (set, ...args) => {
            const pfSettingsSlice = createPFSettingsSlice(set, ...args);
            const pfVerificationSlice = createPFVerificationSlice(set, ...args);
            const pfBetsSlice = createPFBetsSlice(set, ...args);

            return {
                ...pfSettingsSlice,
                ...pfVerificationSlice,
                ...pfBetsSlice,

                registerEvent: (message) => {
                    pfBetsSlice.registerPFBetsEvent(message);
                    pfSettingsSlice.registerPFSettingsEvent(message);
                },

                initializePF: (gameId, uid) => {
                    pfSettingsSlice.initializePFSettings(gameId, uid);
                },
            };
        },
        {
            name: getPFStoreKey(),
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                pfClientSeedSetting: state.pfClientSeedSetting,
                expandGuideFirst: state.expandGuideFirst,
            }),
        }
    )
);

export default usePFStore;
