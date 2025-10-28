import { useEffect, useState } from "react";

import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "@shared/helpers";
import { useClickSound, useTranslator } from "@shared/react-hooks";
import useDebounce from "@shared/react-hooks/use-debounce";
import Styles from "../settings-popup.module.scss";
import VolumeSetting from "../volume-setting";
import { useSettingStore } from "@shared/stores/setting-store";
import { useShallow } from "zustand/react/shallow";

const delaySetVolumeInMilliseconds = 100;
const SoundSetting = () => {
    const { updateVolumeSFX, toggleSound, volumeSFX, enabledSound } = useSettingStore(
        useShallow((state) => ({
            updateVolumeSFX: state.updateVolumeSFX,
            toggleSound: state.toggleSound,
            volumeSFX: state.volumeSFX,
            enabledSound: state.enabledSound,
        }))
    );

    const clickSound = useClickSound();

    const { t } = useTranslator();

    const [volumeSFXVal, setVolumeSFXVal] = useState(volumeSFX);
    const [debounceSFXVal, setDebounceSFXVal] = useState(volumeSFX);

    const debounceValue = useDebounce(volumeSFXVal, delaySetVolumeInMilliseconds);

    const toggle = () => {
        clickSound();
        toggleValue();

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.Sound,
            action: !enabledSound ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
        });
    };

    useEffect(() => {
        if (debounceValue === volumeSFX) {
            return;
        }
        setDebounceSFXVal(volumeSFXVal);
        updateVolume(volumeSFXVal);
    }, [debounceValue]);

    const handleChange = (value) => {
        setVolumeSFXVal(value);
    };

    const updateVolume = (value) => {
        updateVolumeSFX(value);

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
        toggleSound(updateSoundSetting);
    };
    return (
        <div className={`${Styles["row"]} `}>
            <div className={Styles["text"]}>{t("lobby_sound_effect")}</div>
            <div className={Styles["setting-item-container"]}>
                <div className={`${Styles["icon"]} ${Styles["switch"]} rounded-[10px] h-8 w-8 bg-[#212D3D66] text-[16px]`}>
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
