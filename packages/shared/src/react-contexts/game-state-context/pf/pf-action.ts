import { PFClientSeedSetting, PFResult } from "@shared/components/game-base/type";

export enum PFEventActionType {
    TOGGLE_PF_VERIFY = "TOGGLE_PF_VERIFY",
    UPDATE_PF_VERIFY = "UPDATE_PF_VERIFY",
    TOGGLE_PF_CLIENT_SEED_INFO = "TOGGLE_PF_CLIENT_SEED_INFO",
    TOGGLE_PF_VERIFICATION = "TOGGLE_PF_VERIFICATION",
    TOGGLE_PF_SETTING = "TOGGLE_PF_SETTING",
    UPDATE_PF_CLIENT_SEED_SETTING = "UPDATE_PF_CLIENT_SEED_SETTING",
    OWN_BETS = "OWN_BETS",
    SET_NEW_GAME_STATE = "SET_NEW_GAME_STATE"
}

export interface PFEventPayload {
    isShowPFSetting?: boolean;
    isShowPFVerify?: boolean;
    isShowPFClientSeedInfo?: boolean;
    isShowPFVerification?: boolean;
    pfClientSeedSetting?: PFClientSeedSetting;
    pfVerifyModalData?: PFResult;
    ownBets?: any;
}

export interface PFEventAction {
    type: PFEventActionType;
    payload?: PFEventPayload;
}
