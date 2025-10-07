import { usePopupStore } from "@shared/stores";
import { MenuIcon } from "../menu-icon";

const LiveStatsIcon = () => {
    const toggleLiveStats = usePopupStore((state) => state.toggleLiveStats);
    return <MenuIcon name="live-stats" iconName="guide-pf" onClick={() => toggleLiveStats(true)} />;
};

export default LiveStatsIcon;