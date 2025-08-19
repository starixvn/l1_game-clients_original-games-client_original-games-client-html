import { StateCreator } from "zustand";

export interface PopupSlice {
    isShowBetHistory: boolean;
    isShowBetDetail: boolean;
    isShowGameGuide: boolean;
    isShowPFSetting: boolean;
    isShowPFVerify: boolean;
    isShowPFClientSeedInfo: boolean;
    isShowPFVerification: boolean;

    // Actions
    togglePFVerify: (isShow: boolean) => void;
    togglePFClientSeedInfo: (isShow: boolean) => void;
    togglePFVerification: (isShow: boolean) => void;
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
    isShowPFVerify: false,
    isShowPFClientSeedInfo: false,
    isShowPFVerification: false,

    toggleBetHistory: (isShow) => set({ isShowBetHistory: isShow }),
    toggleBetDetail: (isShow) => set({ isShowBetDetail: isShow }),
    toggleGameGuide: (isShow) => set({ isShowGameGuide: isShow }),
    togglePFSetting: (isShow) => set({ isShowPFSetting: isShow }),
    togglePFVerify: (isShow) => set({ isShowPFVerify: isShow }),
    togglePFClientSeedInfo: (isShow) => set({ isShowPFClientSeedInfo: isShow }),
    togglePFVerification: (isShow) => set({ isShowPFVerification: isShow })
}); 