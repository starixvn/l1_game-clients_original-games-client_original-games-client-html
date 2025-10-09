import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import LiveStatsModal from "@shared/components/game-components/live-stats";

const LiveStats = () => {
    const finish = usePlinkoGameStore((state) => state.finish);
    console.log("finish",finish);
    return <LiveStatsModal data={finish} />;
};

export default LiveStats;
