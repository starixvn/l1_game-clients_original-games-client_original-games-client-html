import { StateCreator } from "zustand";

export interface UISettingsSlice {
    // State
    isShowedSetting: boolean;
    isToggleHotKey: boolean;
    // Actions
    toggleSetting: (isShowed?: boolean) => void;
    toggleHotKey: (isToggleHotKey?: boolean) => void;
    resetUISettings: () => void;
}

const initialUIState = {
    isShowedSetting: false,
    isToggleHotKey: false,
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

    toggleHotKey: (isToggleHotKey) => {
        set((state) => ({
            isToggleHotKey: isToggleHotKey,
        }));
    },

    resetUISettings: () => {
        set(initialUIState);
    },
});
