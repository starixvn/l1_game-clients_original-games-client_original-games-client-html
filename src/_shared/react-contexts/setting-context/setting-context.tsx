import { createContext, useContext, useReducer } from "react";

import { StorageHelper, localStorageKeys } from "../../helpers";
import { SettingContextModel, initialSettingContextModel } from "./setting-context-model";
import { SettingEventAction, SettingEventActionType } from "./setting-event-action";

export const SettingContext = createContext<Partial<SettingContextModel>>({});
export const SettingDispatchContext = createContext(null);

SettingContext.displayName = "SettingContext";

export const SettingContextProvider = ({ children }) => {
    const [settingContextModel, dispatch] = useReducer(settingReducer, initialSettingContextModel());
    settingContextModel.enabledMusic = StorageHelper.get<boolean>(localStorageKeys.enableMusic) ?? true;
    settingContextModel.volumeMusic = StorageHelper.get<number>(localStorageKeys.volumeMusic) ?? 50;
    settingContextModel.volumeSFX = StorageHelper.get<number>(localStorageKeys.volumeSFX) ?? 50;
    return (
        <SettingContext.Provider value={settingContextModel}>
            <SettingDispatchContext.Provider value={dispatch}>{children}</SettingDispatchContext.Provider>
        </SettingContext.Provider>
    );
};

export const useSettingContext = () => useContext(SettingContext);
export const useSettingDispatch = () => useContext(SettingDispatchContext);

const settingReducer = (state: any, action: SettingEventAction): SettingContextModel => {
    const { type, payload } = action;
    const { isShowedSetting, enabledMusic, enabledSound, isShowAvatarGallery, chipSettings, volumeMusic, volumeSFX } = payload;

    switch (type) {
        case SettingEventActionType.TOGGLE_SETTING: {
            return {
                ...state,
                isShowedSetting,
            };
        }

        case SettingEventActionType.TOGGLE_MUSIC: {
            return {
                ...state,
                enabledMusic,
            };
        }

        case SettingEventActionType.TOGGLE_SOUND: {
            return {
                ...state,
                enabledSound,
            };
        }

        case SettingEventActionType.SHOW_AVATAR_GALLERY: {
            return {
                ...state,
                isShowAvatarGallery,
            };
        }

        case SettingEventActionType.UPDATE_CHIPS: {
            return {
                ...state,
                chipSettings,
            };
        }

        case SettingEventActionType.UPDATE_VOLUME_MUSIC: {
            return {
                ...state,
                volumeMusic,
            };
        }

        case SettingEventActionType.UPDATE_VOLUME_SFX: {
            return {
                ...state,
                volumeSFX,
            };
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
};
