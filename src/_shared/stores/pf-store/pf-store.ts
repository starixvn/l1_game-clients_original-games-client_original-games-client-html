import { create } from "zustand";
import { PFSettingsSlice, createPFSettingsSlice } from "./pf-settings-slice";
import { PFVerificationSlice, createPFVerificationSlice } from "./pf-verification-slice";
import { PFBetsSlice, createPFBetsSlice } from "./pf-bets-slice";

export type PFStore = {
    registerEvent: (message: any) => void;
    initializePF: (gameId: number, uid: number) => void;
} & PFSettingsSlice & PFVerificationSlice & PFBetsSlice;

export const usePFStore = create<PFStore>()((set, ...a) => {
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
});

export default usePFStore; 