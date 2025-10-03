import { useGameStore } from "@shared/stores";
import React from "react";
import RoundMultiplierItem from "./round-multiplier-item";

type PlinkoSettlementResult = {
    slotIndex: number;
    multiplier: number;
};

const RoundMultiplierHistory = () => {
    const roundHistory = useGameStore((state) => state.roundHistory);

    const multipliers = [...roundHistory].reverse().map((round) => (round.settlementResult as PlinkoSettlementResult)?.multiplier || 0);


    return (
        <div className="round-multiplier-history">
            {multipliers.length > 0 ? (
                <div 
                    className="flex justify-end gap-2 overflow-x-auto py-2 px-1 mx-4"
                >
                    {multipliers.map((multiplier, index) => (
                        <RoundMultiplierItem
                            key={index}
                            multiplier={multiplier}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 text-center py-4 text-sm">
                    No multiplier history available
                </div>
            )}
        </div>
    );
};

export default RoundMultiplierHistory;
