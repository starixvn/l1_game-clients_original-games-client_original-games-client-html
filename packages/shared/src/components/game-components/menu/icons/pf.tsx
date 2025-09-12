import { useGameStore, usePFStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";
import { RoundState } from "@shared/components/game-base/type";

export const PFIcon = () => {
    const togglePFSetting = usePFStore((state) => state.togglePFSetting);
    const roundState = useGameStore((state) => state.roundState);

    const onClick = () => {
        if (roundState === RoundState.Disabled) {
            return;
        }
        togglePFSetting(true);
    };

    return <MenuIcon name="fairness" onClick={onClick} />;
};

export default PFIcon;
