import { usePopupStore, useSettingStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";

const HotKeyIcon = () => {
    const toggleHotKey = usePopupStore((state) => state.toggleHotKey);
    const isToggleHotKey = useSettingStore((state) => state.isToggleHotKey);

    return <MenuIcon name="hot-key" iconName="hot-key" onClick={() => toggleHotKey(true)} isActive={isToggleHotKey} />;
};

export default HotKeyIcon;
