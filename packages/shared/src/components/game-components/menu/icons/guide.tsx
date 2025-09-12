import { usePopupStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";

export const GuideIcon = () => {
    const toggleGameGuide = usePopupStore((state) => state.toggleGameGuide);
    return <MenuIcon name="guide" onClick={() => toggleGameGuide(true)} />;
};
