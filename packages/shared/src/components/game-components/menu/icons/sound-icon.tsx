import { MenuIcon } from "../menu-icon";
import { StorageHelper, localStorageKeys } from "@shared/helpers";
import { useSettingStore } from "@shared/stores/setting-store";
import { useShallow } from "zustand/react/shallow";

const SoundIcon = () => {
    const { toggleSetting, enabledSound, volumeSFX } = useSettingStore(useShallow((state) => ({
        toggleSetting: state.toggleSetting,
        enabledSound: state.enabledSound,
        volumeSFX: state.volumeSFX,
    })));

    const computedEnabledSound =
        (enabledSound ?? StorageHelper.get<boolean>(localStorageKeys.settingStore) ?? true) &&
        (volumeSFX ?? 50) > 0;

    const onClick = () => {
        toggleSetting();
    };
    return <MenuIcon name="sound" iconName={computedEnabledSound ? "sound-on" : "sound-off"} onClick={onClick} />;
};

export default SoundIcon;