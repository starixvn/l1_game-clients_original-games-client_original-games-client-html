import dynamic from "next/dynamic";
import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import Styles from "./menu-icon.module.scss";
const Tooltip = dynamic(() => import("../tooltip"), { ssr: false });
type Props = { name: string; iconName?: string; onClick?: (e?: any) => void; isActive?: boolean };

export const MenuIcon = ({ name, iconName, onClick, isActive = false }: Props) => {
    const clickSound = useClickSound();
    const { t } = useCommonTranslate();

    const handleClick = (e?: any) => {
        clickSound();
        onClick?.(e);
    };

    return (
        <div className="relative group">
            <Tooltip message={t(`tooltip_${name}`)}>
                <div className="cursor-pointer w-8 h-8 flex items-center justify-center" onClick={handleClick}>
                    <i className={`icon-${iconName ?? name} ${Styles.menuIcon} ${isActive ? Styles.active : ""}`}></i>
                </div>
            </Tooltip>
        </div>
    );
};
