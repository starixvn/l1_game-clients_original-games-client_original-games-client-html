import { Round } from "@shared";
import { useGameStore } from "@shared/stores";
import React from "react";
import RoundMultiplierItem from "./round-multiplier-item";

export interface PlinkoRound extends Round {
    gameMode: number;
    numberOfRows: number;
}

const RoundMultiplierHistory = () => {
    const roundHistory = useGameStore((state) => state.roundHistory);

    if (!roundHistory.length) {
        return null;
    }

    return (
        <div className="round-multiplier-history flex justify-center">
            <div className="flex justify-end gap-1 overflow-x-auto py-2 mx-4">
                {[...roundHistory].reverse().map((round, index) => (
                    <RoundMultiplierItem key={index} round={round as PlinkoRound} />
                ))}
            </div>
        </div>
    );
};

export default RoundMultiplierHistory;
