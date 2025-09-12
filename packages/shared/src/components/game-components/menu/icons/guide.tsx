import { useGameStore, usePopupStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";
import { RoundState } from "@shared/components/game-base/type";
import { useClickSound } from "@shared/react-hooks";

export const GuideIcon = () => {
    const roundState = useGameStore((state) => state.roundState);
    const toggleGameGuide = usePopupStore((state) => state.toggleGameGuide);
    const clickSound = useClickSound();

    const onClick = () => {
        if (roundState === RoundState.Disabled) {
            return;
        }
        clickSound();
        toggleGameGuide(true);
    };
    return <MenuIcon name="guide" onClick={onClick} />;
};
