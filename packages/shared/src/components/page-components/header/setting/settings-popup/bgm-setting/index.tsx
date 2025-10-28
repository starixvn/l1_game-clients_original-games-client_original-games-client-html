import { useEffect, useState } from "react";

import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "@shared/helpers";
import { useClickSound, useTranslator } from "@shared/react-hooks";
import useDebounce from "@shared/react-hooks/use-debounce";
import Styles from "../settings-popup.module.scss";
import VolumeSetting from "../volume-setting";
import { useSettingStore } from "@shared/stores/setting-store";
import { useShallow } from "zustand/react/shallow";

const delaySetVolumeInMilliseconds = 100;
const MusicSetting = () => {
    const clickSound = useClickSound();

    const { t } = useTranslator();
    const { updateVolumeMusic, toggleMusic, enabledMusic, volumeMusic } = useSettingStore(
        useShallow((state) => ({
            updateVolumeMusic: state.updateVolumeMusic,
            toggleMusic: state.toggleMusic,
            enabledMusic: state.enabledMusic,
            volumeMusic: state.volumeMusic,
        }))
    );

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
        updateVolumeMusic(value);

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
        toggleMusic(updateMusicSetting);
    };

    return (
        <div className={`${Styles["row"]} `}>
            <div className={Styles["text"]}>{t("lobby_background_music")}</div>
            <div className={Styles["setting-item-container"]}>
                <div className={`${Styles["icon"]} ${Styles["switch"]} rounded-[10px] h-8 w-8 bg-[#212D3D66] text-[16px]`}>
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
