import { StateCreator } from "zustand";
import { ChipInfo } from "sc-user-service-client/dist/setting";

export interface GameSettingsSlice {
    // State
    chipSettings: ChipInfo[];

    // Actions
    updateChips: (chips: ChipInfo[]) => void;
    resetGameSettings: () => void;
}

const initialGameState = {
    chipSettings: [],
};

export const createGameSettingsSlice: StateCreator<GameSettingsSlice> = (set, get) => ({
    // Initial state
    ...initialGameState,

    // Actions
    updateChips: (chips) => {
        set({ chipSettings: chips });
    },

    resetGameSettings: () => {
        set(initialGameState);
    },
});
