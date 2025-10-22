import { Round } from "@shared";
import { useGameStore } from "@shared/stores";
import React, { useEffect, useRef, useState } from "react";
import RoundMultiplierItem from "./round-multiplier-item";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { isMobile } from "react-device-detect";

export interface PlinkoRound extends Round {
    gameMode: number;
    numberOfRows: number;
}
const RoundMultiplierHistory = () => {
    const roundHistory = useGameStore((state) => state.roundHistory);
    const endBet = useGameStore((state) => state.endBet);
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
            setData(roundHistory.toReversed() as PlinkoRound[]);
            isInitializedRef.current = true;
        }
    }, [roundHistory]);

    useEffect(() => {
        if (endBet) {
            isInitializedRef.current = true;
        }
    }, [endBet]);

    if (!data.length) {
        return null;
    }

    return (
        <div
            className={`absolute left-1/2 -translate-x-1/2 round-multiplier-history flex justify-center mx-auto ${
                isMobile ? "top-[5px]" : "top-[10px]"
            }`}
            style={data.length === 10 ? { maskImage: "linear-gradient(to right, rgba(8, 14, 24, 0) 0.2%, #080E19 8%)" } : undefined}
        >
            <div className="flex justify-end gap-1 overflow-x-auto ">
                {[...data].map((round, index) => (
                    <div key={round.roundId || index} className={`${isAnimating ? "animate-slide-to-left" : ""}`}>
                        <RoundMultiplierItem key={round.roundId} round={round} isWin={round.settlementResult.multiplier >= 1} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoundMultiplierHistory;
