import { useEffect, useState } from "react";

import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "../../../../../../_shared/helpers";
import { SettingEventActionType, useSettingDispatch } from "../../../../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../../../../_shared/react-hooks";
import useDebounce from "../../../../../../_shared/react-hooks/use-debounce";
import Styles from "../settings-popup.module.scss";
import VolumeSetting from "../volume-setting";

const delaySetVolumeInMilliseconds = 100;
const MusicSetting = () => {
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();

    const [enabledMusic, setEnabledMusic] = useState(StorageHelper.get<boolean>(localStorageKeys.enableMusic) ?? true);
    const volumeMusic = StorageHelper.get<number>(localStorageKeys.volumeMusic) ?? 50;

    const { t } = useTranslator();

    const [volumeMusicVal, setVolumeMusicVal] = useState(volumeMusic);
    const [debounceVolumeMusicVal, setDebounceVolumeMusicVal] = useState(volumeMusic);

    const debounceValue = useDebounce(volumeMusicVal, delaySetVolumeInMilliseconds);

    useEffect(() => {
        if (debounceValue === volumeMusic) {
            return;
        }

        setDebounceVolumeMusicVal(volumeMusicVal);
        updateVolume(volumeMusicVal);
    }, [debounceValue]);

    const toggle = () => {
        clickSound();
        toggleValue();

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.Music,
            action: !enabledMusic ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
        });
    };

    const handleChange = (value) => {
        setVolumeMusicVal(value);
    };

    const updateVolume = (value) => {
        StorageHelper.set(localStorageKeys.volumeMusic, value);

        settingDispatch({
            type: SettingEventActionType.UPDATE_VOLUME_MUSIC,
            payload: {
                volumeMusic: value,
            },
        });

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.Music,
            action: value,
        });

        if (!+value) {
            if (enabledMusic) {
                toggleValue();
            }
        } else {
            if (!enabledMusic) {
                toggleValue();
            }
        }
    };

    const toggleValue = () => {
        const updateMusicSetting = !enabledMusic;
        setEnabledMusic(updateMusicSetting);
        StorageHelper.set(localStorageKeys.enableMusic, updateMusicSetting);
        settingDispatch({
            type: SettingEventActionType.TOGGLE_MUSIC,
            payload: {
                enabledMusic: updateMusicSetting,
            },
        });
    };

    return (
        <div className={`${Styles["row"]} `}>
            <div className={Styles["text"]}>{t("lobby_background_music")}</div>
            <div className={Styles["setting-item-container"]}>
                <div className={`${Styles["icon"]} ${Styles["switch"]} rounded-[10px] h-8 w-8 bg-[#212D3D66]`}>
                    <button className={`${Styles["button"]}`} onClick={toggle}>
                        <span className={`icon-music-${enabledMusic ? "on" : "off"}`}></span>
                    </button>
                </div>
                <VolumeSetting onChangeVolume={handleChange} defaultValue={debounceVolumeMusicVal} />
            </div>
        </div>
    );
};

export default MusicSetting;
