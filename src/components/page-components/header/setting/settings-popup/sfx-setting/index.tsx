import { useEffect, useState } from "react";

import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "../../../../../../_shared/helpers";
import { SettingEventActionType, useSettingDispatch } from "../../../../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../../../../_shared/react-hooks";
import useDebounce from "../../../../../../_shared/react-hooks/use-debounce";
import Styles from "../settings-popup.module.scss";
import VolumeSetting from "../volume-setting";

const delaySetVolumeInMilliseconds = 100;
const SoundSetting = () => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true);
    const clickSound = useClickSound();

    const { t } = useTranslator();
    const volumeSFX = StorageHelper.get<number>(localStorageKeys.volumeSFX) ?? 50;

    const settingDispatch = useSettingDispatch();

    const [volumeSFXVal, setVolumeSFXVal] = useState(volumeSFX);
    const [debounceSFXVal, setDebounceSFXVal] = useState(volumeSFX);

    const debounceValue = useDebounce(volumeSFXVal, delaySetVolumeInMilliseconds);

    const toggle = () => {
        clickSound();
        console.log("[Setting.Sound] toggle.click", { from: enabledSound, to: !enabledSound });
        toggleValue();

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.Sound,
            action: !enabledSound ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
        });
        console.log("[Setting.Sound] analytics.track", { function: TrackingFunction.Sound, action: !enabledSound ? TrackingAction.ToggleOn : TrackingAction.ToggleOff });
    };

    useEffect(() => {
        if (debounceValue === volumeSFX) {
            return;
        }
        setDebounceSFXVal(volumeSFXVal);
        console.log("[Setting.Sound] volume.debounce", { debounceValue, volumeSFXVal });
        updateVolume(volumeSFXVal);
    }, [debounceValue]);

    const handleChange = (value) => {
        console.log("[Setting.Sound] volume.change", { from: volumeSFXVal, to: value });
        setVolumeSFXVal(value);
    };

    const updateVolume = (value) => {
        StorageHelper.set(localStorageKeys.volumeSFX, value);
        console.log("[Setting.Sound] storage.write", { key: localStorageKeys.volumeSFX, value });
        settingDispatch({
            type: SettingEventActionType.UPDATE_VOLUME_SFX,
            payload: {
                volumeSFX: value,
            },
        });

        if (!+value) {
            if (enabledSound) {
                toggleValue();
            }
        } else {
            if (!enabledSound) {
                toggleValue();
            }
        }
    };

    const toggleValue = () => {
        const updateSoundSetting = !enabledSound;
        setEnabledSound(updateSoundSetting);
        StorageHelper.set(localStorageKeys.enableSound, updateSoundSetting);
        console.log("[Setting.Sound] storage.write", { key: localStorageKeys.enableSound, value: updateSoundSetting });
        settingDispatch({ type: SettingEventActionType.TOGGLE_SOUND, payload: { enabledSound: updateSoundSetting } as any });
    };
    return (
        <div className={`${Styles["row"]} `}>
            <div className={Styles["text"]}>{t("lobby_sound_effect")}</div>
            <div className={Styles["setting-item-container"]}>
                <div className={`${Styles["icon"]} ${Styles["switch"]}`}>
                    <button className={`${Styles["button"]}`} onClick={toggle}>
                        <span className={`icon-sound-${enabledSound ? "on" : "off"}`}></span>
                    </button>
                </div>
                <VolumeSetting onChangeVolume={handleChange} defaultValue={debounceSFXVal} />
            </div>
        </div>
    );
};

export default SoundSetting;