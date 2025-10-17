import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import LiveStatsModal from "@shared/components/game-components/live-stats";

const LiveStats = () => {
    const finishedBall = usePlinkoGameStore((state) => state.finishedBall);

    return <LiveStatsModal data={finishedBall} />;
};

export default LiveStats;
