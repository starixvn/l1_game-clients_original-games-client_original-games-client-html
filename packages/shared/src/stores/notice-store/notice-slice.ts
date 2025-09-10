import { StateCreator } from "zustand";
import { NoticeModel } from '@shared/components/game-base/type';

export interface NoticeSlice {
    // State
    notice: NoticeModel | null;

    // Actions
    setNotice: (notice: NoticeModel | null) => void;
    clearNotice: () => void;
    showNotice: (notice: NoticeModel) => void;
}

export const createNoticeSlice: StateCreator<NoticeSlice> = (set) => ({
    notice: null,

    setNotice: (notice: NoticeModel | null) => set({ notice }),
    clearNotice: () => set({ notice: null }),
    showNotice: (notice: NoticeModel) => set({ notice }),
});
