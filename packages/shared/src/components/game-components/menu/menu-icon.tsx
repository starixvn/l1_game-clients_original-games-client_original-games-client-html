import dynamic from "next/dynamic";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { RoundState } from "../../game-base/type";
import Styles from "./menu-icon.module.scss";
const Tooltip = dynamic(() => import("../tooltip"), { ssr: false });
type Props = { name: string; iconName?: string; onClick?: () => void };

export const MenuIcon = ({ name, iconName, onClick }: Props) => {
    const { roundState } = useGameStateContext();
    const clickSound = useClickSound();
    const { t } = useCommonTranslate();

    const handleClick = () => {
        if (roundState === RoundState.None) {
            return;
        }
        clickSound();
        onClick?.();
    };

    return (
        <div className="relative group">
            <Tooltip message={t(`tooltip_${name}`)} />
            <div className="cursor-pointer w-8 h-8 flex items-center justify-center" onClick={handleClick}>
                <i className={`icon-${iconName ? iconName : name} ${Styles.menuIcon}`}></i>
            </div>
        </div>
    );
};
