import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import LiveStatsModal from "@shared/components/game-components/live-stats";
import { useEffect, useState } from "react";

const LiveStats = () => {
    const finishedBall = usePlinkoGameStore((state) => state.finishedBall);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (finishedBall) {
            setData({
                winAmount: finishedBall.winAmount,
                amount: finishedBall.amount,
                isWin: finishedBall.settlementResult.multiplier >= 1,
            });
        }
    }, [finishedBall]);

    return <LiveStatsModal data={data} />;
};

export default LiveStats;
