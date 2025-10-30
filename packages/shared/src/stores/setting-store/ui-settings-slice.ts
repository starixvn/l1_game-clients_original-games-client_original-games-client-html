import { StateCreator } from "zustand";

export interface UISettingsSlice {
    // State
    isShowedSetting: boolean;
    // Actions
    toggleSetting: (isShowed?: boolean) => void;
    resetUISettings: () => void;
}

const initialUIState = {
    isShowedSetting: false,
};

export const createUISettingsSlice: StateCreator<UISettingsSlice> = (set, get) => ({
    // Initial state
    ...initialUIState,

    // Actions
    toggleSetting: (isShowed) => {
        set((state) => ({
            isShowedSetting: isShowed !== undefined ? isShowed : !state.isShowedSetting,
        }));
    },

    resetUISettings: () => {
        set(initialUIState);
    },
});
