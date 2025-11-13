import { StateCreator } from "zustand";

export interface AudioSettingsSlice {
    // State
    enabledMusic: boolean;
    enabledSound: boolean;
    volumeMusic: number;
    volumeSFX: number;
    lastHitTime: number;

    // Actions
    toggleMusic: (enabled?: boolean) => void;
    toggleSound: (enabled?: boolean) => void;
    updateVolumeMusic: (volume: number) => void;
    updateVolumeSFX: (volume: number) => void;
    resetAudioSettings: () => void;
    canPlayHit: () => boolean;
    updateHitTime: () => void;
}

const initialAudioState = {
    enabledMusic: true,
    enabledSound: true,
    volumeMusic: 50,
    volumeSFX: 50,
    lastHitTime: 0,
};

export const createAudioSettingsSlice: StateCreator<AudioSettingsSlice> = (set, get) => ({
    // Initial state
    ...initialAudioState,

    // Actions
    toggleMusic: (enabled) => {
        set((state) => ({
            enabledMusic: enabled !== undefined ? enabled : !state.enabledMusic,
        }));
    },

    toggleSound: (enabled) => {
        set((state) => ({
            enabledSound: enabled !== undefined ? enabled : !state.enabledSound,
        }));
    },

    updateVolumeMusic: (volume) => {
        set({ volumeMusic: Math.max(0, Math.min(100, volume)) });
    },

    updateVolumeSFX: (volume) => {
        set({ volumeSFX: Math.max(0, Math.min(100, volume)) });
    },

    resetAudioSettings: () => {
        set(initialAudioState);
    },

    canPlayHit: () => {
        const now = Date.now();
        return now - get().lastHitTime > 300;
      },
    updateHitTime: () => set({ lastHitTime: Date.now() }),
});
