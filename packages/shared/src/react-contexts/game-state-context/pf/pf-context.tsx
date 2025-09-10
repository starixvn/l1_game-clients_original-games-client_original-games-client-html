import { createContext, useContext, useReducer } from "react";
import { PFContextModel, initialPFContextModel } from "./pf-context-model";
import { PFEventActionType, PFEventAction } from "./pf-action";
import { localStorageKeys, StorageHelper } from "../../../helpers";

export const PFContext = createContext({} as PFContextModel);
const PFDispatchContext = createContext(null);

export function PFProvider({ children, gameId, uid }) {
    const [pfContextModel, dispatch] = useReducer(pfReducer, initialPFContextModel({ gameId, uid }));

    return (
        <PFContext.Provider value={pfContextModel}>
            <PFDispatchContext.Provider value={dispatch}>
                {children}
            </PFDispatchContext.Provider>
        </PFContext.Provider>
    );
}

export const usePFContext = () => {
    return useContext(PFContext);
};

export function usePFDispatch() {
    return useContext(PFDispatchContext);
}

function pfReducer(state: PFContextModel, action: PFEventAction) {
    const { type, payload } = action;
    const {
        pfClientSeedSetting,
        isShowPFVerify,
        isShowPFSetting,
        pfVerifyModalData,
        isShowPFClientSeedInfo,
        isShowPFVerification,
        ownBets
    } = payload;

    let newState = null;
    switch (type) {
        case PFEventActionType.UPDATE_PF_CLIENT_SEED_SETTING:
            const newPfClientSeedSetting = {
                ...state.pfClientSeedSetting,
                ...pfClientSeedSetting,
            };

            StorageHelper.set(`${localStorageKeys.pfSetting}-${state.uid}-${state.gameId}`, newPfClientSeedSetting);
            newState = { pfClientSeedSetting: newPfClientSeedSetting };
            break;

        case PFEventActionType.TOGGLE_PF_VERIFY:
            newState = { isShowPFVerify };
            break;

        case PFEventActionType.TOGGLE_PF_SETTING:
            StorageHelper.set(`${localStorageKeys.showPFSetting}`, isShowPFSetting ? `${state.uid}-${state.gameId}` : "");
            newState = { isShowPFSetting };
            break;

        case PFEventActionType.UPDATE_PF_VERIFY:
            newState = { pfVerifyModalData };
            break;

        case PFEventActionType.TOGGLE_PF_CLIENT_SEED_INFO:
            newState = { isShowPFClientSeedInfo };
            break;

        case PFEventActionType.TOGGLE_PF_VERIFICATION:
            newState = { isShowPFVerification };
            break;

        case PFEventActionType.OWN_BETS:
            newState = { ownBets };
            break;

        case PFEventActionType.SET_NEW_GAME_STATE:
            newState = { ownBets: {} };
            break;

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }

    return {
        ...state,
        ...newState
    };
}
