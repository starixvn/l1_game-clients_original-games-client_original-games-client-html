import { StateCreator } from "zustand";

export interface PopupSlice {
    isShowBetHistory: boolean;
    isShowBetDetail: boolean;
    isShowGameGuide: boolean;
    isShowPFSetting: boolean;

    toggleBetHistory: (isShow: boolean) => void;
    toggleBetDetail: (isShow: boolean) => void;
    toggleGameGuide: (isShow: boolean) => void;
    togglePFSetting: (isShow: boolean) => void;
}

export const createPopupSlice: StateCreator<PopupSlice> = (set) => ({
    isShowBetHistory: false,
    isShowBetDetail: false,
    isShowGameGuide: false,
    isShowPFSetting: false,

    toggleBetHistory: (isShow) => set({ isShowBetHistory: isShow }),
    toggleBetDetail: (isShow) => set({ isShowBetDetail: isShow }),
    toggleGameGuide: (isShow) => set({ isShowGameGuide: isShow }),
    togglePFSetting: (isShow) => set({ isShowPFSetting: isShow }),
}); 