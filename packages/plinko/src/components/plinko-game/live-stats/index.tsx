import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import LiveStatsModal from "@shared/components/game-components/live-stats";

const LiveStats = () => {
    const finish = usePlinkoGameStore((state) => state.finish);
    return <LiveStatsModal winAmount={finish?.winAmount ?? 0} amount={finish?.amount ?? 0} />;
};

export default LiveStats;
