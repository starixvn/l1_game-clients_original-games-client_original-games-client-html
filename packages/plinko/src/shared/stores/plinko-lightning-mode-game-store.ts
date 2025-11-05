import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { LightningBoard } from "@plinko/shared/types/types";

export type PlinkoLightningModeGameStore = {
    isLightningMode: boolean;
    lightningConfig: {
        lightningKey: string;
        lightningBoard: LightningBoard;
    } | null;
    actions: {
        setIsLightningMode: (isLightningMode: boolean) => void;
        setLightningConfig: (lightningConfig: { lightningKey: string; lightningBoard: LightningBoard }) => void;
    };
    reset: () => void;
};

export const usePlinkoLightningModeGameStore = create<PlinkoLightningModeGameStore>()(
    subscribeWithSelector((set) => {
        return {
            isLightningMode: false,
            lightningConfig: null,
            actions: {
                setLightningConfig: (lightningConfig: { lightningKey: string; lightningBoard: LightningBoard }) => set({ lightningConfig }),
                setIsLightningMode: (isLightningMode: boolean) => set({ isLightningMode }),
            },
            reset: () =>
                set({
                    isLightningMode: false,
                    lightningConfig: null,
                }),
        };
    })
);

export default usePlinkoLightningModeGameStore;
