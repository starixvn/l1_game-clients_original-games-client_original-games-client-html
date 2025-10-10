import { Round } from "@shared";
import { useGameStore } from "@shared/stores";
import React, { useEffect, useRef, useState } from "react";
import RoundMultiplierItem from "./round-multiplier-item";

export interface PlinkoRound extends Round {
    gameMode: number;
    numberOfRows: number;
}
const RoundMultiplierHistory = () => {
    const roundHistory = useGameStore((state) => state.roundHistory);
    const [data, setData] = useState<PlinkoRound[]>([]);
    const previousLengthRef = useRef(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const maxLength = 12;
        if (roundHistory?.length && previousLengthRef.current) {
            const newItem = roundHistory[0];
            setIsAnimating(true);
            setTimeout(() => {
                setData((prevData) => {
                    const newData = [...prevData, newItem as PlinkoRound];
                    if (newData.length > maxLength) {
                        return newData.slice(-maxLength);
                    }
                    return newData;
                });
                setIsAnimating(false);
            }, 200);
        }
        if (!previousLengthRef.current) {
            setData(roundHistory.reverse() as PlinkoRound[]);
            previousLengthRef.current = roundHistory.length;
        }
    }, [roundHistory]);

    if (!roundHistory.length) {
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
