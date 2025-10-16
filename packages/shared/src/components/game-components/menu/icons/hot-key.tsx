import { usePopupStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";

const HotKeyIcon = () => {
    const toggleHotKey = usePopupStore((state) => state.toggleHotKey);
    return <MenuIcon name="hot-key" iconName="guide" onClick={() => toggleHotKey(true)} />;
};

export default HotKeyIcon;