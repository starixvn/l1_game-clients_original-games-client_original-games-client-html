import { Round } from "@shared";
import { useGameStore } from "@shared/stores";
import React, { useEffect, useRef, useState } from "react";
import RoundMultiplierItem from "./round-multiplier-item";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";

export interface PlinkoRound extends Round {
    gameMode: number;
    numberOfRows: number;
}
const RoundMultiplierHistory = () => {
    const roundHistory = useGameStore((state) => state.roundHistory);
    const finish = usePlinkoGameStore((state) => state.finishedBall);
    const [data, setData] = useState<PlinkoRound[]>([]);
    const isInitializedRef = useRef(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (finish) {
            const maxLength = 10;
            setIsAnimating(true);
            setTimeout(() => {
                setData((prevData) => [...prevData, finish as PlinkoRound].slice(-maxLength));
                setIsAnimating(false);
            }, 200);
        }
    }, [finish]);

    useEffect(() => {
        if (roundHistory?.length && !isInitializedRef.current) {
            setData(roundHistory.reverse() as PlinkoRound[]);
            isInitializedRef.current = true;
        }
    }, [roundHistory]);

    if (!data.length) {
        return null;
    }

    return (
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 round-multiplier-history flex justify-center max-w-[40rem] mx-auto">
            <div className="flex justify-end gap-1 overflow-x-auto ">
                {[...data].map((round, index) => (
                    <div key={index} className={`${isAnimating ? "animate-slide-to-left" : ""}`}>
                        <RoundMultiplierItem key={round.roundId} round={round as PlinkoRound} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoundMultiplierHistory;
