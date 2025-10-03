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

    if (!multipliers.length) {
        return null;
    }

    return (
        <div className="round-multiplier-history flex justify-center">
            <div className="flex justify-end gap-1 overflow-x-auto py-2 mx-4">
                {multipliers.map((multiplier, index) => (
                    <RoundMultiplierItem key={index} multiplier={multiplier} />
                ))}
            </div>
        </div>
    );
};

export default RoundMultiplierHistory;
