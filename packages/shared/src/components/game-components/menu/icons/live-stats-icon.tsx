import { usePopupStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";
import { useShallow } from "zustand/react/shallow";

const LiveStatsIcon = () => {
    const { toggleLiveStats, setPosition } = usePopupStore(
        useShallow((state) => ({
            toggleLiveStats: state.toggleLiveStats,
            setPosition: state.setPosition,
        }))
    );

    const handleClick = (e: React.MouseEvent) => {
        toggleLiveStats(true);
        setPosition(e.clientX, e.clientY);
    };

    return <MenuIcon name="live_stat" iconName="live-stat" onClick={handleClick} />;
};

export default LiveStatsIcon;
