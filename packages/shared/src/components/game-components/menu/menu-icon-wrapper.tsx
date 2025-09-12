import { SoundIcon } from "./icons/sound";
import { GuideIcon } from "./icons/guide";

export const MenuIconWrapper = ({ children }: { children?: React.ReactNode }) => {
    return (
        <div className="flex">
            <SoundIcon />
            <GuideIcon />
            {children}
        </div>
    );
};

export default MenuIconWrapper;
