import { StateCreator } from "zustand";
import { PFResult } from '@shared/merged/components/game-base/type';

export interface PFVerificationSlice {
    pfVerifyModalData: PFResult | null;
    updatePFVerify: (data: PFResult) => void;
}

export const createPFVerificationSlice: StateCreator<PFVerificationSlice> = (set) => ({
    pfVerifyModalData: null,
    updatePFVerify: (data) => set({ pfVerifyModalData: data }),
}); 