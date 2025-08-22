import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PFSettingsSlice, createPFSettingsSlice } from "./pf-settings-slice";
import { PFVerificationSlice, createPFVerificationSlice } from "./pf-verification-slice";
import { PFBetsSlice, createPFBetsSlice } from "./pf-bets-slice";
import { localStorageKeys } from "../../helpers";

export type PFStore = {
    registerEvent: (message: any) => void;
    initializePF: (gameId: number, uid: number) => void;
} & PFSettingsSlice & PFVerificationSlice & PFBetsSlice;

export const usePFStore = create<PFStore>()(
    persist(
        (set, ...a) => {
            const pfSettingsSlice = createPFSettingsSlice(set, ...a);
            const pfVerificationSlice = createPFVerificationSlice(set, ...a);
            const pfBetsSlice = createPFBetsSlice(set, ...a);

            return {
                ...pfSettingsSlice,
                ...pfVerificationSlice,
                ...pfBetsSlice,
                
                registerEvent: (message) => {
                    pfBetsSlice.registerPFBetsEvent(message);
                },

                initializePF: (gameId, uid) => {
                    pfSettingsSlice.initializePFSettings(gameId, uid);
                },
            };
        },
        {
            name: localStorageKeys.pfStore,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                isShowPFSetting: state.isShowPFSetting,
                pfClientSeedSetting: state.pfClientSeedSetting,
                expandGuideFirst: state.expandGuideFirst,
            }),
        }
    )
);

export default usePFStore; 