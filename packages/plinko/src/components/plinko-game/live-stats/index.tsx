import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import LiveStatsModal from "@shared/components/game-components/live-stats";
import { useEffect, useState } from "react";
import { PlinkoFinish } from "@plinko/shared/types/types";

const LiveStats = () => {
    const finish = usePlinkoGameStore((state) => state.finish);
    const finishedBall = usePlinkoGameStore((state) => state.finishedBall);

    const [data, setData] = useState<{ winAmount?: number; amount?: number } | null>(null);
    const [queueFinishList, setQueueFinishList] = useState<PlinkoFinish[]>([]);

    useEffect(() => {
        if (finish) {
            setQueueFinishList((prev) => [...prev, finish]);
        }
    }, [finish]);

    useEffect(() => {
        if (finishedBall && queueFinishList.length > 0) {
            const matchingFinishIndex = queueFinishList.findIndex(
                (queuedFinish) => queuedFinish.roundId === finishedBall.roundId
            );

            if (matchingFinishIndex !== -1) {
                const matchingFinish = queueFinishList[matchingFinishIndex];
                
                setData({
                    winAmount: matchingFinish.winAmount,
                    amount: matchingFinish.amount
                });

                setQueueFinishList((prev) => 
                    prev.filter((_, index) => index !== matchingFinishIndex)
                );
            }
        }
    }, [finishedBall, queueFinishList]);

    return <LiveStatsModal data={data} />;
};

export default LiveStats;
