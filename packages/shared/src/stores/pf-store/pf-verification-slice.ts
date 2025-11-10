import { StateCreator } from "zustand";
import { PFResult } from "@shared/components/game-base/type";

export interface PFVerificationSlice {
    pfVerifyModalData: PFResult | null;
    roundIdPfVerify: number | null;
    updatePFVerify: (data: PFResult) => void;
    updateRoundIdPfVerify: (roundId: number) => void;
}

export const createPFVerificationSlice: StateCreator<PFVerificationSlice> = (set) => ({
    pfVerifyModalData: null,
    roundIdPfVerify: null,
    updatePFVerify: (data) => set({ pfVerifyModalData: data }),
    updateRoundIdPfVerify: (roundId) => set({ roundIdPfVerify: roundId }),
});
