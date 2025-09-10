import React, { useState } from "react";
import { StorageHelper, localStorageKeys } from "../../../../../_shared/helpers";
import { SettingEventActionType, useSettingDispatch } from "../../../../../_shared/react-contexts";
import Styles from "./../menu.module.scss";

const dropdownItemClassName = "dropdown-item";

export const Music: React.FC = () => {
    const [enabledMusic, setEnabledMusic] = useState(StorageHelper.get<boolean>(localStorageKeys.enableMusic) ?? true);
    const settingDispatch = useSettingDispatch();

    const onToggleMusic = () => {
        StorageHelper.set(localStorageKeys.enableMusic, !enabledMusic);
        setEnabledMusic(!enabledMusic);
        settingDispatch({
            type: SettingEventActionType.TOGGLE_MUSIC,
            payload: {
                enabledMusic: !enabledMusic,
            },
        });
    };

    return (
        <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} id="music-settings" onClick={() => onToggleMusic()}>
            <span
                id={enabledMusic ? `icon-sound-on` : `icon-music-off`}
                className={enabledMusic ? `icon-music-on ${Styles["menu-icon"]}` : `icon-music-off ${Styles["menu-icon"]}`}
            ></span>
        </div>
    );
};
