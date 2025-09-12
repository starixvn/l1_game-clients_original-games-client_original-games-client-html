import { useGameStore, usePFStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";
import { useClickSound } from "@shared/react-hooks";
import { RoundState } from "@shared/components/game-base/type";

export const PFIcon = () => {
    const roundState = useGameStore((state) => state.roundState);
    const togglePFSetting = usePFStore((state) => state.togglePFSetting);
    const clickSound = useClickSound();

    const onClick = () => {
        if (roundState === RoundState.Disabled) {
            return;
        }
        clickSound();
        togglePFSetting(true);
    };
    return <MenuIcon name="fairness" onClick={onClick} />;
};

export default PFIcon;
