import { usePopupStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";

const GuideIcon = () => {
    const toggleGameGuide = usePopupStore((state) => state.toggleGameGuide);
    return <MenuIcon name="guide" onClick={() => toggleGameGuide(true)} />;
};

export default GuideIcon;