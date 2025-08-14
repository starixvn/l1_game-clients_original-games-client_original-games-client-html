import React from "react";
import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "../../../../../_shared/helpers";
import { useClickSound } from "../../../../../_shared/react-hooks";
import { useSettingContext } from "../../../../../_shared/react-contexts";
import Styles from "./../menu.module.scss";

const dropdownItemClassName = "dropdown-item";

export const Sound: React.FC = () => {
    const clickSound = useClickSound();
    const settingContext = useSettingContext();

    const onToggleSound = () => {
        clickSound();
        const currentEnabled = StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true;
        const next = !currentEnabled;
        console.log("[Menu.Sound] toggle", { from: currentEnabled, to: next });
        StorageHelper.set(localStorageKeys.enableSound, next);
        console.log("[Menu.Sound] storage.write", { key: localStorageKeys.enableSound, value: next });
        AnalyticsHelper.trackFunction({ function: TrackingFunction.Sound, action: next ? TrackingAction.ToggleOn : TrackingAction.ToggleOff });
        console.log("[Menu.Sound] analytics.track", { function: TrackingFunction.Sound, action: next ? TrackingAction.ToggleOn : TrackingAction.ToggleOff });
    };

    return (
        <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} id="sound-settings" onClick={() => onToggleSound()}>
            <span
                id={(((settingContext?.enabledSound ?? (StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true))) && ((settingContext?.volumeSFX ?? 50) > 0)) ? `icon-sound-on` : `icon-sound-off`}
                className={(((settingContext?.enabledSound ?? (StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true))) && ((settingContext?.volumeSFX ?? 50) > 0)) ? `icon-sound-on ${Styles["menu-icon"]}` : `icon-sound-off ${Styles["menu-icon"]}`}
            ></span>
        </div>
    );
};
