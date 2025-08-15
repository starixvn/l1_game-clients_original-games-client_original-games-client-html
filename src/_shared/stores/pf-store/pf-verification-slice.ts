import { StateCreator } from "zustand";
import { PFResult } from "../../../components/game-base/type";

export interface PFVerificationSlice {
    // State
    isShowPFVerify: boolean;
    isShowPFClientSeedInfo: boolean;
    isShowPFVerification: boolean;
    pfVerifyModalData: PFResult | null;

    // Actions
    togglePFVerify: (isShow: boolean) => void;
    togglePFClientSeedInfo: (isShow: boolean) => void;
    togglePFVerification: (isShow: boolean) => void;
    updatePFVerify: (data: PFResult) => void;
}

export const createPFVerificationSlice: StateCreator<PFVerificationSlice> = (set) => ({
    // Initial state
    isShowPFVerify: false,
    isShowPFClientSeedInfo: false,
    isShowPFVerification: false,
    pfVerifyModalData: null,

    // Actions
    togglePFVerify: (isShow) => set({ isShowPFVerify: isShow }),

    togglePFClientSeedInfo: (isShow) => set({ isShowPFClientSeedInfo: isShow }),

    togglePFVerification: (isShow) => set({ isShowPFVerification: isShow }),

    updatePFVerify: (data) => set({ pfVerifyModalData: data }),
}); 