import { MenuIcon } from "../menu-icon";
import { SettingEventActionType, useSettingContext, useSettingDispatch } from "@shared/react-contexts";
import { StorageHelper, localStorageKeys } from "@shared/helpers";

export const SoundIcon = () => {
    const settingDispatch = useSettingDispatch();
    const settingContext = useSettingContext();

    const computedEnabledSound =
        (settingContext?.enabledSound ?? StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true) &&
        (settingContext?.volumeSFX ?? 50) > 0;

    const onClick = () => {
        settingDispatch({
            type: SettingEventActionType.TOGGLE_SETTING,
            payload: { isShowedSetting: true },
        });
    };
    return <MenuIcon name="sound" iconName={computedEnabledSound ? "sound-on" : "sound-off"} onClick={onClick} />;
};
