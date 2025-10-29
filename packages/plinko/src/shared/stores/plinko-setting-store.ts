import { create } from "zustand";

export interface PlinkoSettingStore {
    isInstantMode: boolean;
    actions: {
        toggleInstantMode: () => void;
    };
}
export const usePlinkoSettingStore = create<PlinkoSettingStore>((set) => ({
    isInstantMode: false,
    actions: {
        toggleInstantMode: () => set((state) => ({ isInstantMode: !state.isInstantMode })),
    },
}));
