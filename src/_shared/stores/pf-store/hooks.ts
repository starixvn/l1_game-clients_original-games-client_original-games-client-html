import { usePFStore } from "./store";

// Hook để chỉ lấy state (tối ưu cho components chỉ cần đọc)
export const usePFState = () => {
    return usePFStore((state) => ({
        isShowPFSetting: state.isShowPFSetting,
        isShowPFVerify: state.isShowPFVerify,
        isShowPFClientSeedInfo: state.isShowPFClientSeedInfo,
        isShowPFVerification: state.isShowPFVerification,
        pfClientSeedSetting: state.pfClientSeedSetting,
        pfVerifyModalData: state.pfVerifyModalData,
        ownBets: state.ownBets,
        gameId: state.gameId,
        uid: state.uid,
    }));
};

// Hook để chỉ lấy actions - tối ưu cho components chỉ cần thay đổi state
export const usePFActions = () => {
    return usePFStore((state) => ({
        togglePFVerify: state.togglePFVerify,
        togglePFSetting: state.togglePFSetting,
        togglePFClientSeedInfo: state.togglePFClientSeedInfo,
        togglePFVerification: state.togglePFVerification,
        updatePFVerify: state.updatePFVerify,
        updatePFClientSeedSetting: state.updatePFClientSeedSetting,
        setOwnBets: state.setOwnBets,
        setNewGameState: state.setNewGameState,
        initializePF: state.initializePF,
    }));
};

// Hook để lấy state và actions cụ thể - tối ưu cho components cần ít state
export const usePFSetting = () => {
    return usePFStore((state) => ({
        isShowPFSetting: state.isShowPFSetting,
        pfClientSeedSetting: state.pfClientSeedSetting,
        togglePFSetting: state.togglePFSetting,
        updatePFClientSeedSetting: state.updatePFClientSeedSetting,
    }));
};

export const usePFVerification = () => {
    return usePFStore((state) => ({
        isShowPFVerify: state.isShowPFVerify,
        isShowPFVerification: state.isShowPFVerification,
        pfVerifyModalData: state.pfVerifyModalData,
        togglePFVerify: state.togglePFVerify,
        togglePFVerification: state.togglePFVerification,
        updatePFVerify: state.updatePFVerify,
    }));
};

export const usePFBets = () => {
    return usePFStore((state) => ({
        ownBets: state.ownBets,
        setOwnBets: state.setOwnBets,
        setNewGameState: state.setNewGameState,
    }));
}; 