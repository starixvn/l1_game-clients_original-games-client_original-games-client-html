import { usePopupStore, useSettingStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";
import { isMobile } from "react-device-detect";

const HotKeyIcon = () => {
    const toggleHotKey = usePopupStore((state) => state.toggleHotKey);
    const isToggleHotKey = useSettingStore((state) => state.isToggleHotKey);
    if (isMobile) {
        return;
    }
    return <MenuIcon name="hot-key" iconName="hot-key" onClick={() => toggleHotKey(true)} isActive={isToggleHotKey} />;
};

export default HotKeyIcon;
